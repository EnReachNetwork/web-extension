import type { PlasmoCSConfig } from "plasmo";

import { relayMessage } from "@plasmohq/messaging";

export const config: PlasmoCSConfig = {
    matches: ["<all_urls>"],
};

const relayNames = ["ping", "getStat", "setAccessToken", "clearAccessToken", "clearLogout"];
for (const name of relayNames) {
    // @ts-ignore
    relayMessage({ name });
}
