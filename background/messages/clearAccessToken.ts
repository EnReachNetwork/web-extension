import type { PlasmoMessaging } from "@plasmohq/messaging";

import { KEYS } from "~constants";
import { storage } from "~libs/mstorage";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    console.info("on clearAccessToken", req);
    await storage.removeItem(KEYS.ACCESS_TOKEN);
    await storage.setItem(KEYS.AUTHENTIC, false);
    res.send({ status: "success" });
};

export default handler;
