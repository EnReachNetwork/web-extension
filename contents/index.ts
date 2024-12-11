import type { PlasmoCSConfig } from "plasmo";

import { sendToBackgroundViaRelay } from "@plasmohq/messaging";

import { ENV, ENVData } from "~constants";

export const config: PlasmoCSConfig = {
    world: "MAIN",
    matches: ["<all_urls>"],
    all_frames: true,
    run_at: "document_start",
};
if (window.__EnReachExt) {
    window.__EnReachExt[ENV] = {
        name: "ContentInjected",
        request: sendToBackgroundViaRelay,
    };
} else {
    window.__EnReachExt = {
        [ENV]: {
            name: "ContentInjected",
            request: sendToBackgroundViaRelay,
        },
    };
}
window[ENVData.injectKey] = {
    name: "ContentInjected",
    request: sendToBackgroundViaRelay,
};
