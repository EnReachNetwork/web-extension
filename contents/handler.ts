import type { PlasmoCSConfig } from "plasmo";

import { relayMessage, type MessageName } from "@plasmohq/messaging";

export const config: PlasmoCSConfig = {
    matches: ["<all_urls>"],
};

const relayNames: MessageName[] = ["ping", "getStat", "setAccessToken", "clearAccessToken", "clearLogout", "apiRequest", "reqStorage"];
for (const name of relayNames) {
    relayMessage({ name });
}
