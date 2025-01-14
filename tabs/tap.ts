import { DataConnection, Peer } from "peerjs";

import { requsetOfBg } from "~/libs/apiRequstOfBg";
import { TapStat } from "~/libs/type";
import { sleep } from "~/libs/utils";
import { KEYS } from "~constants";
import forge from 'node-forge';

import { storageGetOfBg, storageSetOfBg } from "../libs/reqStorageOfBg";
import { User } from "~libs/user";

type TapCon = { peerId: string; con: DataConnection; tapSuccess: boolean };
const peerItem: { userId: string; peerServer: string; peer?: Peer; tapConnections: TapCon[]; closed: boolean; privateKey: string; uuid?: string; } = {
    userId: "",
    peerServer: "",
    peer: undefined,
    tapConnections: [],
    closed: true,
    privateKey: ""
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

async function doTap(userId: string) {
    // 将状态写入到localstorage用于页面修改状态
    await storageSetOfBg(KEYS.TAP_STAT, { stat: "taping", lastSuccessTime: 0 } as TapStat);
    try {
        const nodeId = await storageGetOfBg(KEYS.NODE_ID);
        // 查询是否有开启未结束的tap
        const { uuid } = await requsetOfBg<{ uuid?: string }>({
            method: "POST", path: `/api/extension/${nodeId}/start`
        });

        if (!uuid) {
            // 未找到其他在线用户, 无法tap
            await storageSetOfBg(KEYS.TAP_STAT, { stat: null, lastSuccessTime: 0 } as TapStat);
            return;
        }
        // 建立连接前查询是否有连接的节点，如果没有等待tap的节点连接后建立连接
        let peers: string[] = [];
        let tapStart = true;
        let now = new Date().getTime();
        while (peers.length === 0 && tapStart) {
            if (now - new Date().getTime() > 1000 * 60 * 2) {
                // 超时时间无选中用户连接则停止tap
                await storageSetOfBg(KEYS.TAP_STAT, { stat: null, lastSuccessTime: 0 } as TapStat);
                return;
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

        // 查询是否已经连接了peerJsServer, 如果连接说明被其他节点选中回复消息，无需再次连接，重置连接超时时间
        if (peerItem.userId === userId && peerItem.peer && peerItem.peer.open) {
            resetCloseTask();
        } else {
            // 未开启连接或者连接已经关闭或其他用户建立的peerJs连接，关闭后重新连接
            closePeer();
            await createBasePeerJsConnection(userId, uuid);
        }
        // 建立连接
        for (const p of peers) {
            tapPeer(p, uuid, `${nodeId}`);
        }
        // 等待tap响应
        await checkTapSuccess();
    } finally {
        await storageSetOfBg(KEYS.TAP_STAT, { stat: null, lastSuccessTime: 0 } as TapStat);
    }
}

export async function tapPeer(peer: string, tapUUID: string, nodeId: string) {
    // no peer of not open
    if (!peerItem.peer || peerItem.closed || !peerItem.peer.open) return;
    // already con
    if (peerItem.tapConnections.find((item) => item.peerId === peer)) return;
    // connect
    return new Promise<TapCon>((reslove, reject) => {
        const con = peerItem.peer.connect(peer);
        const tapCon: TapCon = { peerId: peer, con, tapSuccess: false };
        peerItem.tapConnections.push(tapCon);
        con.on("open", () => {
            const tapFromSign = signWithPrivateKey(peerItem.privateKey, tapUUID);
            const task = JSON.stringify({ tapTo: peer, tapUUID, tapFromSign, messageType: "startTap" });
            con.send(task);
        });
        con.on("data", async (data) => {
            if (data) {
                const { success, uuid, messageType } = JSON.parse(`${data}`);
                if (messageType && messageType == 'tapSuccess' && success && uuid === tapUUID) {
                    // 调用API结束该tap
                    const nodeId = await storageGetOfBg(KEYS.NODE_ID);
                    // 查询是否有开启未结束的tap
                    await requsetOfBg<{ uuid?: string }>({
                        method: "POST", path: `/api/extension/${nodeId}/finished`
                    });
                    tapCon.tapSuccess = true;
                    await storageSetOfBg(KEYS.TAP_STAT, { stat: "success", lastSuccessTime: new Date().getTime() } as TapStat);
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

async function createPeer(userId: string, uuid: string) {
    const nodeId = (await storageGetOfBg(KEYS.NODE_ID)) as string;
    const token = Buffer.from(JSON.stringify({
        userId,
        nodeId,
        uuid
    })).toString('base64');
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
        token
    });
    return peer;
}

export async function connectionPeerJsServer(userId: string, uuid: string) {
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
            const { tapTo, tapUUID, tapFromSign, } = JSON.parse(`${data}`);
            if (tapTo && tapUUID && tapFromSign && tapTo === peer) {
                const nodeId = await storageGetOfBg(KEYS.NODE_ID);
                // 将uuid使用当前用户的私钥签名,上报到主服务器
                const privateKey = peerItem.privateKey;
                const tapToSign = signWithPrivateKey(privateKey, tapUUID);
                const { uploadSuccess } = await requsetOfBg<{ uploadSuccess: boolean }>({
                    method: "POST", path: `/api/extension/${nodeId}/report`, data: {
                        tapUUID,
                        tapTo,
                        tapFromSign,
                        tapToSign
                    }
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
}

function signWithPrivateKey(privateKeyPem: string, message: string) {
    const privateKey = forge.pki.privateKeyFromPem(Buffer.from(privateKeyPem, 'base64').toString('utf-8'));
    const md = forge.md.sha256.create();
    md.update(message, 'utf8');
    const signature = privateKey.sign(md);
    return forge.util.encode64(signature); // 返回 base64 编码的签名
}


// async function startPeerJsClient(userId: string, uuid: string) {
//     const peer = await createPeer(userId, uuid);
//     peer.on("error", (error) => {
//         console.error("peer:", error);
//     });
//     peer.on("open", async (id) => {
//         console.info("open", id);
//         // 连接成功后无需上报, PeerJs会自动上报
//     });
//     peer.on("connection", (con) => {
//         console.info(`connection: ${con.connectionId} peer: ${con.peer}`);
//         con.on("data", async (data) => {
//             console.info("onTap:data", data);
//             // report onTap
//             con.send(data);
//             await storageSetOfBg(KEYS.ON_TAP, [{ src: con.connectionId, data }]);
//         });
//     });
//     return peer;
// }

// export async function startPeerJs(userId: string, uuid: string) {
//     if (uuid) {
//         peerItem.uuid = uuid;
//     }
//     const nodeId = await storageGetOfBg(KEYS.NODE_ID);
//     console.info("startPeer:", peerItem, userId);
//     if (peerItem.peer && peerItem.userId === userId) {
//         if (peerItem.peer.id && peerItem.peer.open) {
//             reportPeerId(peerItem.peer.id);
//             resetCloseTask();
//         }
//         return;
//     }
//     peerItem.userId = userId;
//     peerItem.closed = false;
//     const peer = createPeer(userId, nodeId as string, uuid);
//     peerItem.peer = peer;
//     resetCloseTask();
//     peer.on("error", (error) => {
//         console.error("peer:", error);
//     });
//     peer.on("open", async (id) => {
//         console.info("open", id);
//         // 连接成功后无需上报, PeerJs会自动上报
//     });
//     peer.on("connection", (con) => {
//         console.info(`connection: ${con.connectionId} peer: ${con.peer}`);
//         con.on("data", async (data) => {
//             console.info("onTap:data", data);
//             // report onTap
//             con.send(data);
//             await storageSetOfBg(KEYS.ON_TAP, [{ src: con.connectionId, data }]);
//         });

//     });
// }

// export async function tapPeer(peer: string, task: string) {
//     // no peer of not open
//     if (!peerItem.peer || peerItem.closed || !peerItem.peer.open) return;
//     // already con
//     if (peerItem.tapConnections.find((item) => item.peerId === peer)) return;
//     // connect
//     return new Promise<TapCon>((reslove, reject) => {
//         const con = peerItem.peer.connect(peer);
//         const tapCon: TapCon = { peerId: peer, con, tapSuccess: false };
//         peerItem.tapConnections.push(tapCon);
//         con.on("open", () => {
//             con.send(task);
//         });
//         con.on("data", (data) => {
//             if (data == task) {
//                 tapCon.tapSuccess = true;
//                 reslove(tapCon);
//             }
//         });
//         setTimeout(() => {
//             !con.open && reject(new Error("Timeout"));
//         }, 5000);
//     });
// }

// async function checkTapSuccess() {
//     if (peerItem.tapConnections.length == 0) return false;
//     let count = 10,
//         internal = 100;
//     while (count > 0) {
//         await sleep(internal);
//         const item = peerItem.tapConnections.find((item) => item.tapSuccess);
//         if (item) {
//             await storageSetOfBg(KEYS.TAP_STAT, { stat: "success", lastSuccessTime: new Date().getTime() } as TapStat);
//             closePeer();
//             return true;
//         }
//         count--;
//     }
//     return false;
// }

// async function doTap(userId: string) {
//     // 将状态写入到localstorage用于页面修改状态
//     await storageSetOfBg(KEYS.TAP_STAT, { stat: "taping", lastSuccessTime: 0 } as TapStat);

//     const nodeId = await storageGetOfBg(KEYS.NODE_ID);
//     const data = await requsetOfBg<{ tapStart: boolean; peers: string[]; uuid: string }>({
//         method: "GET",
//         path: `/api/extension/${nodeId}/peers`,
//     });
//     if (!data.tapStart) {
//         const { uuid } = await requsetOfBg<{ uuid?: string }>({ method: "POST", path: `/api/extension/${nodeId}/start` });
//         if (uuid) {
//             // 启动peerJs需要先获取到tap的uuid
//             startPeerJs(userId, uuid);
//         } else {
//             // 未找到其他在线用户, 无法tap

//         }
//     }


//     while (true) {
//         try {
//             if (await checkTapSuccess()) return;
//             const nodeId = await storageGetOfBg(KEYS.NODE_ID);
//             const data = await requsetOfBg<{ tapStart: boolean; peers: string[]; uuid: string }>({
//                 method: "GET",
//                 path: `/api/extension/${nodeId}/peers`,
//             });
//             console.info("peers:", data);
//             if (!data.tapStart) {
//                 const { uuid } = await requsetOfBg<{ uuid?: string }>({ method: "POST", path: `/api/extension/${nodeId}/start` });
//                 if (uuid) {
//                     // 启动peerJs需要先获取到tap的uuid
//                     startPeerJs(userId, uuid);
//                 }
//             } else if (data.peers && data.peers.length) {
//                 for (const peer of data.peers) {
//                     tapPeer(peer, userId);
//                 }
//                 // check
//                 if (await checkTapSuccess()) return;
//             }
//         } catch (error) {
//             console.error("TapError:", error);
//         }
//         await sleep(1000);
//     }
// }
