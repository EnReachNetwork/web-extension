import type { PlasmoCSConfig } from "plasmo";

import { sendToBackground } from "@plasmohq/messaging";
import { relay } from "@plasmohq/messaging/relay";

export const config: PlasmoCSConfig = {
    matches: ["<all_urls>"],
};

const relayNames = ["ping", "getStat", "setAccessToken", "clearAccessToken", "clearLogout"];
for (const name of relayNames) {
    relay({ name }, sendToBackground);
}
