import type { PlasmoMessaging } from "@plasmohq/messaging";

import { KEYS } from "~constants";
import { storage } from "~libs/mstorage";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    console.info("on clearLogout", req);
    await storage.remove(KEYS.USER_LOGOUT);
    res.send({ status: "success" });
};

export default handler;
