import { Storage } from "@plasmohq/storage";

import { KEYS, StatusConnect } from "~constants";

export const storage = new Storage({ area: "local" });

export async function setConnectStatus(status: StatusConnect) {
    await storage.set(KEYS.STATUS_CONNECT, status);
}

export async function setIpFromWS(ip?: string) {
    if (ip) {
        await storage.set(KEYS.IP_FROM_WS, ip);
    } else {
        await storage.remove(KEYS.IP_FROM_WS);
    }
}
