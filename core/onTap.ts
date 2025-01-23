import { Peer } from "peerjs";

import { KEYS } from "~constants";
import { requsetOfBg } from "~libs/apiRequstOfBg";
import { signWithPrivateKey } from "~libs/crypto";
import { storageGetOfBg, storageSetOfBg } from "~libs/reqStorageOfBg";
import { User } from "~libs/user";
import { sleep } from "~libs/utils";

import { createPeer } from "./peer";

let catchPeer: Peer | null = null;
export function closeOnTapPeer() {
    catchPeer?.destroy();
    catchPeer = null;
}

let lastCloseTask: any;
function resetCloseTask() {
    if (lastCloseTask) clearTimeout(lastCloseTask);
    lastCloseTask = setTimeout(() => closeOnTapPeer(), 1000 * 60);
}

export async function openOnTapPeer(userId: string, uuid: string) {
    if (!catchPeer) {
        catchPeer = await createPeer(userId, uuid, true);
    }
    const { privateKey } = (await storageGetOfBg(KEYS.USER_INFO)) as User;
    const peer = catchPeer;
    peer.on("error", (error) => {
        console.error("peer err:", error);
        closeOnTapPeer();
    });
    peer.on("open", (id) => {
        console.info("open", id);
    });
    peer.on("connection", (con) => {
        // const { peer } = con;
        const remotePeerId = con.peer;
        console.info(`other peer: ${remotePeerId} connected`);
        con.on("data", async ({ messageType, ...msg }: any) => {
            if (typeof messageType == "string") {
                // report onTap
                if (messageType == "tap") {
                    const { tapTo, tapUUID, tapFromSign } = msg;
                    console.info("onTap tap: ", tapTo && tapUUID && tapFromSign && tapTo === peer.id, msg);
                    if (tapTo && tapUUID && tapFromSign && tapTo === peer.id) {
                        const nodeId = await storageGetOfBg(KEYS.NODE_ID);
                        // 将uuid使用当前用户的私钥签名,上报到主服务器
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
                            await storageSetOfBg(KEYS.ON_TAP, [{ src: remotePeerId, data: msg }]);
                            await con.send({ uuid: tapUUID, success: true, messageType: "tapSuccess" });
                        }
                    }
                }
                if (messageType == "file") {
                    console.info("onTap file:", msg?.file?.length);
                    con.send({ messageType: "fileSuccess" });
                }
            } else {
            }
        });
    });
    resetCloseTask();
    while (true) {
        await sleep(500);
        if (peer.open) return true;
        if (!catchPeer) throw new Error("onTap Open Peer Error");
    }
}
