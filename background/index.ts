import "@plasmohq/messaging/background";

import { KEYS } from "~constants";
import { getIP } from "~libs/getIp";
import { storage } from "~libs/mstorage";
import { IPData, NodeID } from "~libs/type";
import { User } from "~libs/user";
import { runLoop } from "~libs/utils";

import { closeLast, connect } from "./ws";

const connectByAuthUser = async () => {
    const auth = await storage.get(KEYS.ACCESS_TOKEN);
    const user = await storage.get<User>(KEYS.USER_INFO);
    const nodeId = await storage.get<NodeID>(KEYS.NODE_ID);
    const ipData = await storage.get<IPData>(KEYS.IP_DATA);
    console.info("connectIf", Boolean(auth), Boolean(user), Boolean(nodeId), Boolean(ipData));
    auth && user && nodeId && ipData && connect(auth, user, nodeId, ipData);
};

async function hasOffscreenDocument(url: string): Promise<boolean> {
    if ("getContexts" in chrome.runtime) {
        const contexts = await chrome.runtime.getContexts({
            contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
            documentUrls: [url],
        });
        return Boolean(contexts.length);
    } else {
        // @ts-ignore
        const matchedClients = await clients.matchAll();
        return await matchedClients.some((client) => {
            client.url.includes(chrome.runtime.id);
        });
    }
}
let creating; // A global promise to avoid concurrency issues
async function setupOffscreenDocument() {
    // Check all windows controlled by the service worker to see if one
    // of them is the offscreen document with the given path
    const path = "/tabs/offscreen.html";
    const offscreenUrl = chrome.runtime.getURL(path);
    const hasOffscreen = await hasOffscreenDocument(offscreenUrl);
    if (hasOffscreen) {
        return;
    }

    // create offscreen document
    if (creating) {
        await creating;
    } else {
        creating = chrome.offscreen.createDocument({
            url: path,
            reasons: [chrome.offscreen.Reason.WEB_RTC],
            justification: "reason for needing the WebRTC",
        });
        await creating;
        creating = null;
    }
}

async function main() {
    connectByAuthUser();
    storage.watch({
        [KEYS.USER_INFO]: connectByAuthUser,
        [KEYS.NODE_ID]: connectByAuthUser,
        [KEYS.IP_DATA]: connectByAuthUser,
        [KEYS.ACCESS_TOKEN]: (e) => {
            console.info("do close last connect", !Boolean(e.newValue));
            !Boolean(e.newValue) && closeLast();
        },
    });
    let lastIpData: IPData = null;
    runLoop(
        "checkIP",
        async () => {
            await getIP()
                .then((ipdata) => {
                    if (!lastIpData || lastIpData.ipString !== ipdata.ipString) console.info("ipdata:", ipdata);
                    lastIpData = ipdata;
                    return storage.set(KEYS.IP_DATA, ipdata);
                })
                .catch(console.error)
                .finally(connectByAuthUser);
        },
        10000,
    );

    chrome.action.openPopup();
    //
    setupOffscreenDocument();
}

main().catch(console.error);
