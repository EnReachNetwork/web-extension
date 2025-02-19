import Peer from "peerjs";

import { KEYS } from "~constants";
import { requsetOfBg } from "~libs/apiRequstOfBg";
import { storageGetOfBg } from "~libs/reqStorageOfBg";
import { retry } from "~libs/utils";

// async function getTurnServers() {
//     return retry(
//         async () => {
//             const { apiKey } = await requsetOfBg<{ apiKey: string; expire: number }>({ path: "/api/extension/turn/apiKey", method: "GET" });
//             return fetch(`https://mla2.metered.live/api/v1/turn/credentials?apiKey=${apiKey}`).then<any[]>((response) => {
//                 if (!response.ok) {
//                     throw new Error("Get TurnServers Error");
//                 }
//                 return response.json();
//             });
//         },
//         { count: 3 },
//     );
// }
async function getTurnServers() {
    return retry(
        async () => {
            const { iceServers } = await requsetOfBg<{
                iceServers: {
                    username: string;
                    urls: string[];
                    credential: string;
                };
            }>({ path: "/api/extension/turn/list", method: "GET" });
            return [iceServers];
        },
        { count: 3 },
    );
}

export async function createPeer(opts: { userId: string; uuid: string; enableTurnServer: boolean; nodeId?: string }) {
    const { userId, uuid, enableTurnServer, nodeId = (await storageGetOfBg(KEYS.NODE_ID)) as string } = opts;
    const token = Buffer.from(
        JSON.stringify({
            userId,
            nodeId,
            uuid,
        }),
    ).toString("base64");
    let turns = [];
    if (enableTurnServer) {
        turns = await getTurnServers();
    }
    const peer = new Peer({
        host: "beta-peers.enreach.network", // 如果使用公共PeerJS服务器，可以留空
        secure: true,
        config: {
            iceServers: [
                {
                    urls: ["stun:hk-turn1.xirsys.com", "stun:stun.relay.metered.ca:80", "stun:us-turn10.xirsys.com"],
                },
                ...turns,
            ],
        },
        token,
    });
    return peer;
}
