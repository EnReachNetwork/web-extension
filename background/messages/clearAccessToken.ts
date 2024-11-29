import type { PlasmoMessaging } from "@plasmohq/messaging";

import { storage } from "~libs/mstorage";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    console.info("on clearAccessToken", req);
    await storage.removeAll()
    res.send({ status: "success" });
};

export default handler;
