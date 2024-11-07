import type { PlasmoCSConfig } from "plasmo";

import { sendToBackground } from "@plasmohq/messaging";
import { relay } from "@plasmohq/messaging/relay";

export const config: PlasmoCSConfig = {
    matches: ["<all_urls>"],
};

const relayNames = ["ping", "getUser", "setAccessToken", "clearAccessToken"];
relayNames.forEach((name) => {
    relay({ name }, sendToBackground);
});
