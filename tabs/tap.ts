import forge from "node-forge";
import { DataConnection, Peer } from "peerjs";

import { requsetOfBg } from "~/libs/apiRequstOfBg";
import { NodeID, TapStat } from "~/libs/type";
import { retry, sleep } from "~/libs/utils";
import { KEYS } from "~constants";
import { User } from "~libs/user";

import { storageGetOfBg, storageSetOfBg } from "../libs/reqStorageOfBg";

type TapCon = { peerId: string; con: DataConnection; tapSuccess: boolean };
const peerItem: { userId: string; peerServer: string; peer?: Peer; tapConnections: TapCon[]; closed: boolean; privateKey: string; uuid?: string; enableTurnServer: boolean } = {
    userId: "",
    peerServer: "",
    peer: undefined,
    tapConnections: [],
    closed: true,
    privateKey: "",
    enableTurnServer: false,
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
    lastCloseTask = setTimeout(() => closePeer(), 1000 * 60 * 2);
}

let tapRuning = false;
export async function startTap(userId: string) {
    if (tapRuning) return;
    tapRuning = true;
    await doTap(userId);
    tapRuning = false;
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
        if (now - new Date().getTime() > 1000 * 60 * 2) {
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

async function doTap(userId: string) {
    // 将状态写入到localstorage用于页面修改状态
    await updateTapStat({ stat: "taping", lastSuccessTime: 0, msg: "Looking for a Berry Buddy. Please kindly wait." });
    try {
        // 查询是否有开启未结束的tap
        const { uuid, peers } = await startAndGetTapData();
        // Connect if need
        // 1. first unuse TurnServer
        await updateTapStat({ msg: "Trying to build peer-to-peer connection to a randomly discovered node." });
        if (peerItem.enableTurnServer) {
            peerItem.enableTurnServer = false;
            closePeer();
        }
        await connectPeerJsServer(userId, uuid);
        // 2. try tap unuse TurnServer
        for (const peerId of peers) {
            tapPeer(peerId, uuid);
        }
        // 3. chek tap success
        const success = await checkTapSuccess();
        if (success) {
            await updateTapStat({ msg: "Peer connection successful. Your Berry will come back soon." });
            await sleep(3000);
            await updateTapStat({ stat: "success", lastSuccessTime: new Date().getTime(), msg: "" });
            return true;
        }
        // 4. closePeer;
        closePeer();
        // 5. second open TurnServer;
        await updateTapStat({ msg: "Connecting to a randomly designated peer... " });
        peerItem.enableTurnServer = true;
        await connectPeerJsServer(userId, uuid);
        // 6. try tap by TurnServer;
        for (const peerId of peers) {
            tapPeer(peerId, uuid);
        }
        // 7. checkTapSuccess
        if (await checkTapSuccess()) {
            await updateTapStat({ msg: "Peer connection successful. Your Berry will come back soon." });
            await sleep(3000);
            await updateTapStat({ stat: "success", lastSuccessTime: new Date().getTime(), msg: "" });
        } else {
            await updateTapStat({ msg: "Connection failed. You can try another time or check your network connectivity." });
            await sleep(3000);
            await updateTapStat({ stat: null, msg: "" });
        }
        closePeer();
    } catch (e) {
        await updateTapStat({ stat: null, lastSuccessTime: 0, msg: e.message ?? "Network error" });
    } finally {
        await updateTapStat({ stat: null, lastSuccessTime: 0, msg: "Network error" });
    }
}

export async function tapPeer(peerId: string, tapUUID: string) {
    // no peer of not open
    if (!peerItem.peer || peerItem.closed || !peerItem.peer.open) return;
    // already con
    if (peerItem.tapConnections.find((item) => item.peerId === peerId)) return;
    // connect
    return new Promise<TapCon>((reslove, reject) => {
        const con = peerItem.peer.connect(peerId);
        const tapCon: TapCon = { peerId: peerId, con, tapSuccess: false };
        peerItem.tapConnections.push(tapCon);
        con.on("open", () => {
            const tapFromSign = signWithPrivateKey(peerItem.privateKey, tapUUID);
            const task = JSON.stringify({ tapTo: peerId, tapUUID, tapFromSign, messageType: "startTap" });
            updateTapStat({ msg: "Connected with a peer node. Testing p2p file transfer -- 240kB/s." });
            con.send(task);
        });
        con.on("data", async (data) => {
            if (data) {
                const { success, uuid, messageType } = JSON.parse(`${data}`);
                if (messageType && messageType == "tapSuccess" && success && uuid === tapUUID) {
                    // 调用API结束该tap
                    const nodeId = await storageGetOfBg(KEYS.NODE_ID);
                    // 查询是否有开启未结束的tap
                    await requsetOfBg<{ uuid?: string }>({
                        method: "POST",
                        path: `/api/extension/${nodeId}/finished`,
                    });
                    tapCon.tapSuccess = true;
                    reslove(tapCon);
                }
            }
        });
        setTimeout(() => {
            !con.open && reject(new Error("Timeout"));
        }, 5000);
    });
}

async function checkTapSuccess() {
    if (peerItem.tapConnections.length == 0) return false;
    while (peerItem.closed == false && peerItem.tapConnections.length > 0) {
        await sleep(1000);
        const item = peerItem.tapConnections.find((item) => item.tapSuccess);
        if (item) {
            // 有成功响应后关闭连接
            closePeer();
            return true;
        }
    }
    return false;
}

async function getTurnServers() {
    return retry(async () => {
        const { apiKey } = await requsetOfBg<{ apiKey: string; expire: number }>({ path: "/api/extension/turn/apiKey", method: "GET" });
        return fetch(`https://mla2.metered.live/api/v1/turn/credentials?apiKey=${apiKey}`).then<any[]>((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        });
    });
}

async function createPeer(userId: string, uuid: string) {
    const nodeId = (await storageGetOfBg(KEYS.NODE_ID)) as string;
    const token = Buffer.from(
        JSON.stringify({
            userId,
            nodeId,
            uuid,
        }),
    ).toString("base64");
    let turns = [];
    if (peerItem.enableTurnServer) {
        turns = await getTurnServers();
    }
    const peer = new Peer({
        host: "beta-peers.enreach.network", // 如果使用公共PeerJS服务器，可以留空
        secure: true,
        config: {
            iceServers: [
                {
                    urls: "stun:stun.relay.metered.ca:80",
                },
                ...turns,
            ],
        },
        token,
    });
    return peer;
}

export async function connectPeerJsServer(userId: string, uuid: string) {
    // 确认是否是当前用户(对应浏览器多账户切换场景)
    if (peerItem.userId === userId && peerItem.peer && peerItem.peer.open) {
        resetCloseTask();
    } else {
        closePeer();
        await createBasePeerJsConnection(userId, uuid);
    }
}

async function createBasePeerJsConnection(userId: string, uuid: string) {
    const peer = await createPeer(userId, uuid);
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

    peer.on("connection", (con) => {
        const { peer } = con;
        console.info(`other peer: ${peer} connected`);
        con.on("data", async (data) => {
            console.info("onTap data: ", data);
            // report onTap
            const { tapTo, tapUUID, tapFromSign } = JSON.parse(`${data}`);
            if (tapTo && tapUUID && tapFromSign && tapTo === peer) {
                const nodeId = await storageGetOfBg(KEYS.NODE_ID);
                // 将uuid使用当前用户的私钥签名,上报到主服务器
                const privateKey = peerItem.privateKey;
                const tapToSign = signWithPrivateKey(privateKey, tapUUID);
                const { uploadSuccess } = await requsetOfBg<{ uploadSuccess: boolean }>({
                    method: "POST",
                    path: `/api/extension/${nodeId}/report`,
                    data: {
                        tapUUID,
                        tapTo,
                        tapFromSign,
                        tapToSign,
                    },
                });
                if (uploadSuccess) {
                    // 上报成功, 将上报结果发送给对方, 发送成功后断开连接
                    await storageSetOfBg(KEYS.ON_TAP, [{ src: peer, data }]);
                    await con.send(JSON.stringify({ uuid: tapUUID, success: true, messageType: "tapSuccess" }));
                } else {
                    // 上报失败, 无需处理
                }
            } else {
                // 无效的消息和连接
            }
        });
    });
    resetCloseTask();
    while (true) {
        await sleep(500);
        if (peer.open) return true;
        if (peerItem.closed) throw new Error("Connect PeerjsServer Error");
    }
}

function signWithPrivateKey(privateKeyPem: string, message: string) {
    const privateKey = forge.pki.privateKeyFromPem(Buffer.from(privateKeyPem, "base64").toString("utf-8"));
    const md = forge.md.sha256.create();
    md.update(message, "utf8");
    const signature = privateKey.sign(md);
    return forge.util.encode64(signature); // 返回 base64 编码的签名
}
