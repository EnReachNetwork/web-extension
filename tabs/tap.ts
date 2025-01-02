import { DataConnection, Peer } from "peerjs";

import { requsetOfBg } from "~/libs/apiRequstOfBg";
import { TapStat } from "~/libs/type";
import { sleep } from "~/libs/utils";
import { KEYS } from "~constants";

import { storageGetOfBg, storageSetOfBg } from "../libs/reqStorageOfBg";

type TapCon = { peerId: string; con: DataConnection; tapSuccess: boolean };
const lastPeer: { userId: string; peerServer: string; peer?: Peer; tapConnections: TapCon[]; closed: boolean; uuid?: string } = {
    userId: "",
    peerServer: "",
    peer: undefined,
    tapConnections: [],
    closed: true,
};

export function closePeer() {
    if (lastPeer.tapConnections.length) {
        for (const item of lastPeer.tapConnections) {
            item.con.close();
        }
        lastPeer.tapConnections = [];
    }
    if (lastPeer.peer) {
        lastPeer.peer.destroy();
        lastPeer.peer.disconnect();
        lastPeer.peer = undefined;
    }
    lastPeer.uuid = undefined;
    lastPeer.closed = true;
}

async function reportPeerId(peerId: string) {
    if (lastPeer.uuid) {
        const nodeId = await storageGetOfBg(KEYS.NODE_ID);
        await requsetOfBg<void>({ path: `/api/extension/${nodeId}/${lastPeer.uuid}/${peerId}/peer`, method: "POST" });
    }
}

let lastCloseTask: any;
function resetCloseTask() {
    if (lastCloseTask) clearTimeout(lastCloseTask);
    lastCloseTask = setTimeout(() => closePeer(), 1000 * 60 * 2);
}
export function startPeerJs(userId: string, uuid?: string) {
    if (uuid) {
        lastPeer.uuid = uuid;
    }
    console.info("startPeer:", lastPeer, userId);
    if (lastPeer.peer && lastPeer.userId === userId) {
        if (lastPeer.peer.id && lastPeer.peer.open) {
            reportPeerId(lastPeer.peer.id);
            resetCloseTask();
        }
        return;
    }
    lastPeer.userId = userId;
    lastPeer.closed = false;
    const peer = new Peer({
        host: "beta-peers.enreach.network", // 如果使用公共PeerJS服务器，可以留空
        secure: true,
        config: {
            iceServers: [
                {
                    urls: "stun:stun.relay.metered.ca:80",
                },
                {
                    urls: "turn:global.relay.metered.ca:80",
                    username: "5e62e0e7be0f6d28832e97ba",
                    credential: "uSyeMuo91M86K3KE",
                },
                {
                    urls: "turn:global.relay.metered.ca:80?transport=tcp",
                    username: "5e62e0e7be0f6d28832e97ba",
                    credential: "uSyeMuo91M86K3KE",
                },
                {
                    urls: "turn:global.relay.metered.ca:443",
                    username: "5e62e0e7be0f6d28832e97ba",
                    credential: "uSyeMuo91M86K3KE",
                },
                {
                    urls: "turns:global.relay.metered.ca:443?transport=tcp",
                    username: "5e62e0e7be0f6d28832e97ba",
                    credential: "uSyeMuo91M86K3KE",
                },
            ],
        },
    });
    lastPeer.peer = peer;
    resetCloseTask();
    peer.on("error", (error) => {
        console.error("peer:", error);
    });
    peer.on("open", async (id) => {
        console.info("open", id);
        // for dev
        if (lastPeer.uuid) {
            const nodeId = await storageGetOfBg(KEYS.NODE_ID);
            await requsetOfBg<void>({ path: `/api/extension/${nodeId}/${uuid}/${id}/peer`, method: "POST" });
        }
    });
    peer.on("connection", (con) => {
        console.info("connection", con.connectionId);
        con.on("data", async (data) => {
            console.info("onTap:data", data);
            // report onTap
            con.send(data);
            await storageSetOfBg(KEYS.ON_TAP, [{ src: con.connectionId, data }]);
        });
    });
}

export async function tapPeer(peer: string, task: string) {
    // no peer of not open
    if (!lastPeer.peer || lastPeer.closed || !lastPeer.peer.open) return;
    // already con
    if (lastPeer.tapConnections.find((item) => item.peerId === peer)) return;
    // connect
    return new Promise<TapCon>((reslove, reject) => {
        const con = lastPeer.peer.connect(peer);
        const tapCon: TapCon = { peerId: peer, con, tapSuccess: false };
        lastPeer.tapConnections.push(tapCon);
        con.on("open", () => {
            con.send(task);
        });
        con.on("data", (data) => {
            if (data == task) {
                tapCon.tapSuccess = true;
                reslove(tapCon);
            }
        });
        setTimeout(() => {
            !con.open && reject(new Error("Timeout"));
        }, 5000);
    });
}

async function checkTapSuccess() {
    if (lastPeer.tapConnections.length == 0) return false;
    let count = 10,
        internal = 100;
    while (count > 0) {
        await sleep(internal);
        const item = lastPeer.tapConnections.find((item) => item.tapSuccess);
        if (item) {
            await storageSetOfBg(KEYS.TAP_STAT, { stat: "success", lastSuccessTime: new Date().getTime() } as TapStat);
            closePeer();
            return true;
        }
        count--;
    }
    return false;
}

let tapRuning = false;
export async function startTap(userId: string) {
    const doTap = async () => {
        await storageSetOfBg(KEYS.TAP_STAT, { stat: "taping", lastSuccessTime: 0 } as TapStat);
        while (true) {
            try {
                if (await checkTapSuccess()) return;
                startPeerJs(userId);
                const nodeId = await storageGetOfBg(KEYS.NODE_ID);
                const data = await requsetOfBg<{ tapStart: boolean; peers: string[]; task: string }>({
                    method: "GET",
                    path: `/api/extension/${nodeId}/peers`,
                });
                console.info("peers:", data);
                if (!data.tapStart) {
                    await requsetOfBg({ method: "POST", path: `/api/extension/${nodeId}/start` });
                } else if (data.peers && data.peers.length) {
                    for (const peer of data.peers) {
                        tapPeer(peer, userId);
                    }
                    // check
                    if (await checkTapSuccess()) return;
                }
            } catch (error) {
                console.error("TapError:", error);
            }
            await sleep(1000);
        }
    };
    if (tapRuning) return;
    tapRuning = true;
    await doTap();
    tapRuning = false;
}
