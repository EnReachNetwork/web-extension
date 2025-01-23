import Peer from "peerjs";

import { KEYS } from "~constants";
import { requsetOfBg } from "~libs/apiRequstOfBg";
import { storageGetOfBg } from "~libs/reqStorageOfBg";
import { retry } from "~libs/utils";

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

export async function createPeer(userId: string, uuid: string, enableTurnServer: boolean) {
    const nodeId = (await storageGetOfBg(KEYS.NODE_ID)) as string;
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
                    urls: "stun:stun.relay.metered.ca:80",
                },
                ...turns,
            ],
        },
        token,
    });
    return peer;
}


