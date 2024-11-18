import "@plasmohq/messaging/background";
import { KEYS } from "~constants";

import { storage } from "~libs/mstorage";
import { User } from "~libs/user";

async function inject(tabId: number) {
    console.info("executeScript: on:", tabId);
    await chrome.scripting.executeScript({
        target: { tabId },
        world: "MAIN",
        func: ({ extensionId }) => {
            console.log("Inject __EnReachAI");
            window.__EnReachAI = {
                name: "EnReachAI_ext",
                request: (msg) => chrome.runtime.sendMessage(extensionId, msg),
            };
        },
        args: [{ extensionId: chrome.runtime.id }],
    });
}
chrome.tabs.onAttached.addListener((tabId) => {
    inject(tabId);
});
chrome.tabs.onActivated.addListener((e) => {
    inject(e.tabId);
});

async function main() {
   const auth = await storage.get(KEYS.ACCESS_TOKEN)
   const user = await storage.get<User>(KEYS.USER_INFO)
}
main().catch(console.error)