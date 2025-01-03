import _ from "lodash";

import { Storage } from "@plasmohq/storage";

import { KEYS, KEYSType, StatusConnect } from "~constants";

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

export async function setConnectError(err?: string) {
    if (err) {
        await storage.set(KEYS.CONNECT_ERROR, err);
    } else {
        await storage.remove(KEYS.CONNECT_ERROR);
    }
}

export async function clearForLogout() {
    const unClearKeys: KEYSType[] = [KEYS.USER_LOGOUT, KEYS.NODE_ID];
    await storage.removeMany(_.values(KEYS).filter((item) => !unClearKeys.includes(item)));
}
