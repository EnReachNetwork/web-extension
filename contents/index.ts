import type { PlasmoCSConfig } from "plasmo";

import { sendToBackgroundViaRelay } from "@plasmohq/messaging";

import { CON } from "~constants";

export const config: PlasmoCSConfig = {
    world: "MAIN",
    matches: ["<all_urls>"],
    all_frames: true,
    run_at: "document_start",
};

window.EnReachAI = {
    name: CON.NameForContentScript,
    request: sendToBackgroundViaRelay,
};
