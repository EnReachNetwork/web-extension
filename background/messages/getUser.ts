import type { PlasmoMessaging } from "@plasmohq/messaging";

import { KEYS } from "~constants";
import { storage } from "~libs/mstorage";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    console.info("on getUser", req);
    const token = await storage.getItem(KEYS.ACCESS_TOKEN);
    if (!token) {
        res.send(undefined);
    } else {
        res.send({ status: "success", data: token });
    }
};

export default handler;
