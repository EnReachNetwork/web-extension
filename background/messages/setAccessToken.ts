import type { PlasmoMessaging } from "@plasmohq/messaging";

import { KEYS } from "~constants";
import { storage } from "~libs/mstorage";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    console.info("on setAccessToken", req);
    await storage.setItem(KEYS.ACCESS_TOKEN, JSON.stringify(req.body));
    res.send({ status: "success" });
};

export default handler;
