import "@plasmohq/messaging/background";

import axios from "axios";

import { KEYS } from "~constants";
import { storage } from "~libs/mstorage";
import { IPData, NodeID } from "~libs/type";
import { User } from "~libs/user";

import { closeLast, connect } from "./ws";

// async function inject(tabId: number) {
//     console.info("executeScript: on:", tabId);
//     await chrome.scripting.executeScript({
//         target: { tabId },
//         world: "MAIN",
//         func: ({ extensionId }) => {
//             console.log("Inject __EnReachAI");
//             window.__EnReachAI = {
//                 name: "EnReachAI_ext",
//                 request: (msg) => chrome.runtime.sendMessage(extensionId, msg),
//             };
//         },
//         args: [{ extensionId: chrome.runtime.id }],
//     });
// }
// chrome.tabs.onAttached.addListener((tabId) => {
//     inject(tabId);
// });
// chrome.tabs.onActivated.addListener((e) => {
//     inject(e.tabId);
// });
// chrome.tabs.getCurrent().then((t) => t.id && inject(t.id));
// chrome.tabs.onCreated.addListener((e) => {
//     e.id && inject(e.id);
// });

const connectByAuthUser = async () => {
    const auth = await storage.get(KEYS.ACCESS_TOKEN);
    const user = await storage.get<User>(KEYS.USER_INFO);
    const nodeId = await storage.get<NodeID>(KEYS.NODE_ID);
    const ipData = await storage.get<IPData>(KEYS.IP_DATA);
    console.info("nodeId", nodeId);
    auth && user && nodeId && ipData && ipData.ipType == "IPv4" && connect(auth, user, nodeId, ipData);
};

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
    setInterval(() => {
        axios
            .get<IPData>("https://api.bigdatacloud.net/data/client-ip")
            .then((res) => {
                console.info("ipdata:", res.data);
                storage.set(KEYS.IP_DATA, res.data);
            })
            .catch(console.error);
    }, 10000);
}

main().catch(console.error);
