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
    auth && user && nodeId && ipData && connect(auth, user, nodeId, ipData);
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
    let lastIpData: IPData = null;
    runLoop(
        "checkIP",
        async () => {
            await getIP().then((ipdata) => {
                if (!lastIpData || lastIpData.ipString !== ipdata.ipString) console.info("ipdata:", ipdata);
                lastIpData = ipdata;
                storage.set(KEYS.IP_DATA, ipdata);
            });
        },
        10000,
    );
}

main().catch(console.error);
