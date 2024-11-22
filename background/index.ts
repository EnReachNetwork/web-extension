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
    runLoop(
        "checkIP",
        async () => {
            await getIP().then((ipdata) => {
                console.info("ipdata:", ipdata);
                storage.set(KEYS.IP_DATA, ipdata);
            });
        },
        10000,
    );
}

main().catch(console.error);
