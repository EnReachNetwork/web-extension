import numbro from "numbro";
import { DataConnection, Peer } from "peerjs";

import { KEYS } from "~constants";
import { requsetOfBg } from "~libs/apiRequstOfBg";
import { signWithPrivateKey } from "~libs/crypto";
import { storageGetOfBg, storageSetOfBg } from "~libs/reqStorageOfBg";
import { NodeID, TapStat } from "~libs/type";
import { User } from "~libs/user";
import { now, sleep } from "~libs/utils";

import { createPeer } from "./peer";

export function fmtSpeed(speed: number) {
    return numbro(speed).format({ average: true, mantissa: 2, trimMantissa: true }).toUpperCase();
}

type TapCon = { peerId: string; con: DataConnection; tapSuccess: boolean; speed: number };
const peerItem: { userId: string; peerServer: string; peer?: Peer; tapConnections: TapCon[]; closed: boolean; privateKey: string; uuid?: string; enableTurnServer: boolean } = {
    userId: "",
    peerServer: "",
    peer: undefined,
    tapConnections: [],
    closed: true,
    privateKey: "",
    enableTurnServer: true,
};

function closePeer() {
    if (peerItem.tapConnections.length) {
        for (const item of peerItem.tapConnections) {
            item.con.close();
        }
        peerItem.tapConnections = [];
    }
    if (peerItem.peer) {
        peerItem.peer.destroy();
        peerItem.peer.disconnect();
        peerItem.peer = undefined;
    }
    peerItem.uuid = undefined;
    peerItem.userId = "";
    peerItem.peerServer = "";
    peerItem.privateKey = "";
    peerItem.closed = true;
}

let lastCloseTask: any;
function resetCloseTask() {
    if (lastCloseTask) clearTimeout(lastCloseTask);
    lastCloseTask = setTimeout(() => closePeer(), 1000 * 10);
}

export async function updateTapStat(stat: Partial<TapStat> = {}) {
    const last = (await storageGetOfBg<TapStat>(KEYS.TAP_STAT)) ?? {};
    await storageSetOfBg(KEYS.TAP_STAT, { ...last, ...stat });
}

async function startAndGetTapData() {
    const nodeId = await storageGetOfBg<NodeID>(KEYS.NODE_ID);
    // 查询是否有开启未结束的tap
    const { uuid } = await requsetOfBg<{ uuid?: string }>({
        method: "POST",
        path: `/api/extension/${nodeId}/start`,
    });
    if (!uuid) {
        // 未找到其他在线用户, 无法tap
        throw new Error("Not find online user");
    }
    // 建立连接前查询是否有连接的节点，如果没有等待tap的节点连接后建立连接
    let peers: string[] = [];
    let tapStart = true;
    let now = new Date().getTime();
    while (peers.length === 0 && tapStart) {
        if (new Date().getTime() - now > 1000 * 10) {
            // 超时时间无选中用户连接则停止tap
            throw new Error("Find for online users timeout");
        }
        // 查询是否有连接的节点
        const data = await requsetOfBg<{ tapStart: boolean; peers: string[]; uuid: string }>({
            method: "GET",
            path: `/api/extension/${nodeId}/peers`,
        });
        tapStart = data.tapStart;
        peers = data.peers;
        await sleep(1 * 1000);
    }
    return { peers, uuid, nodeId };
}

async function randomFile() {
    let start = now();
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("").map((item) => item.codePointAt(0));
    const content = new Uint8Array(1024 * 1024);
    for (let index = 0; index < content.length; index++) {
        content[index] = chars[Math.floor(Math.random() * chars.length)];
    }
    const data = new Blob([content], { type: "text/plain" });
    console.info("genFile duration:", now() - start);
    return data;
}

export async function tapPeer(peerId: string, tapUUID: string, sendFile?: boolean) {
    // no peer of not open
    if (!peerItem.peer || peerItem.closed || !peerItem.peer.open) return;
    // already con
    if (peerItem.tapConnections.find((item) => item.peerId === peerId)) return;
    let file: Blob = null;
    if (sendFile) {
        file = await randomFile();
    }
    // connect
    return new Promise<TapCon>((reslove, reject) => {
        const con = peerItem.peer.connect(peerId);
        const tapCon: TapCon = { peerId: peerId, con, tapSuccess: false, speed: 0 };
        peerItem.tapConnections.push(tapCon);
        let sendFileTime = 0;
        let timeout = null;
        const resetTimeout = (time: number = 10000) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                con.close();
                // remove from tapConnections
                peerItem.tapConnections = peerItem.tapConnections.filter((item) => item.peerId !== peerId);
                !con.open && reject(new Error("Timeout"));
            }, time);
        };
        resetTimeout();
        con.on("open", async () => {
            // sendFile
            if (sendFile) {
                try {
                    resetTimeout(20000);
                    sendFileTime = now();
                    await con.send({ file, messageType: "file" }, true);
                    resetTimeout(10000);
                } catch (error) {
                    console.error("sendFileError:", error);
                }
            }
            const tapFromSign = signWithPrivateKey(peerItem.privateKey, tapUUID);
            await con.send({ tapTo: peerId, tapUUID, tapFromSign, messageType: "tap" });
        });
        con.on("data", async ({ messageType, ...msg }: any) => {
            if (messageType && typeof messageType == "string") {
                // tapSuccess
                if (messageType == "tapSuccess" && msg.success && msg.uuid === tapUUID) {
                    console.info("tap: tapSuccess");
                    tapCon.tapSuccess = true;
                    reslove(tapCon);
                }
                // sendFile success
                if (messageType == "fileSuccess") {
                    // kb/s
                    tapCon.speed = (1024 * 1024 * 1000) / (now() - sendFileTime);
                    console.info("tap: fileSuccess", tapCon.speed, now() - sendFileTime);
                }
            }
        });
    });
}

async function checkTapSuccess() {
    if (peerItem.tapConnections.length == 0) return false;
    while (peerItem.closed == false && peerItem.tapConnections.length > 0) {
        await sleep(500);
        const item = peerItem.tapConnections.find((item) => item.tapSuccess);
        if (item) {
            return true;
        }
    }
    return false;
}
async function checkTapConOpend() {
    if (peerItem.tapConnections.length == 0) return false;
    while (peerItem.closed == false && peerItem.tapConnections.length > 0) {
        await sleep(500);
        const item = peerItem.tapConnections.find((item) => item.con.open);
        if (item) {
            return true;
        }
    }
    return false;
}
async function checkTapSpeed() {
    if (peerItem.tapConnections.length == 0) return 0;
    while (peerItem.closed == false && peerItem.tapConnections.length > 0) {
        await sleep(500);
        const item = peerItem.tapConnections.find((item) => item.speed > 0);
        if (item) {
            return item.speed;
        }
    }
    return 0;
}

export async function connectPeerJsServer(userId: string, uuid: string) {
    // 确认是否是当前用户(对应浏览器多账户切换场景)
    if (peerItem.userId === userId && peerItem.peer && peerItem.peer.open) {
        resetCloseTask();
    } else {
        closePeer();
        const peer = await createPeer(userId, uuid, peerItem.enableTurnServer);
        const { privateKey } = (await storageGetOfBg(KEYS.USER_INFO)) as User;
        peerItem.peer = peer;
        peerItem.userId = userId;
        peerItem.privateKey = privateKey;
        peerItem.uuid = uuid;
        peerItem.closed = false;
        peer.on("error", (error) => {
            console.error("peer err:", error);
            closePeer();
        });
        peer.on("open", (id) => {
            console.info("open", id);
        });
        resetCloseTask();
        while (true) {
            await sleep(500);
            if (peer.open) return true;
            if (peerItem.closed) throw new Error("Connect PeerjsServer Error");
        }
    }
}

async function doTap(userId: string) {
    // 将状态写入到localstorage用于页面修改状态
    try {
        // await sleep(1000);
        await updateTapStat({ stat: "taping", lastSuccessTime: 0, msg: "Looking for a Berry Buddy. Please kindly wait." });
        // 查询是否有开启未结束的tap
        const { uuid, peers } = await startAndGetTapData();
        /* 1. first unuse TurnServer */
        if (peerItem.enableTurnServer) {
            peerItem.enableTurnServer = false;
            closePeer();
        }
        await updateTapStat({ msg: "Trying to build peer-to-peer connection to a randomly discovered node." });
        await connectPeerJsServer(userId, uuid);
        // try tap unuse TurnServer
        for (const peerId of peers) {
            tapPeer(peerId, uuid, true).catch(console.error);
        }
        await sleep(500);
        const speed = await checkTapSpeed();
        console.info("checkSpeed:", speed);
        if (speed > 0) {
            await updateTapStat({ msg: `Connected with a peer node. Testing p2p file transfer -- ${fmtSpeed(speed)}B/s.` });
        }
        // chek tap success
        if (await checkTapSuccess()) {
            await updateTapStat({ msg: "Peer connection successful. Your Berry will come back soon." });
            await sleep(3000);
            await updateTapStat({ stat: "success", lastSuccessTime: new Date().getTime(), msg: "" });
            return true;
        }
        // closePeer;
        closePeer();

        /*2. open TurnServer;*/
        peerItem.enableTurnServer = true;
        await updateTapStat({ msg: "Connecting to a randomly designated peer... " });
        await connectPeerJsServer(userId, uuid);
        // try tap by TurnServer;
        for (const peerId of peers) {
            tapPeer(peerId, uuid).catch(console.error);
        }
        // checkTapSuccess
        if (await checkTapSuccess()) {
            await updateTapStat({ msg: "Peer connection successful. Your Berry will come back soon." });
            await sleep(3000);
            await updateTapStat({ stat: "success", lastSuccessTime: new Date().getTime(), msg: "" });
            return true;
        } else {
            throw new Error("Timeout");
        }
    } catch (e) {
        closePeer();
        // await updateTapStat({ msg: "Connection failed. You can try another time or check your network connectivity." });
        // await sleep(3000);
        await updateTapStat({ stat: null, lastSuccessTime: 0, msg: "Oops! Peer connection failed. Check your network connection and try again." });
    }
}

let tapRuning = false;
export async function startTap(userId: string) {
    if (tapRuning) return;
    tapRuning = true;
    await doTap(userId);
    tapRuning = false;
}
