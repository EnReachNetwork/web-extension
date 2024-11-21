import type { PlasmoMessaging } from "@plasmohq/messaging";

import { KEYS } from "~constants";
import { storage } from "~libs/mstorage";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    console.info("on getStat", req);
    const logined = Boolean(await storage.get(KEYS.ACCESS_TOKEN));
    const userLogout = Boolean(await storage.get<boolean>(KEYS.USER_LOGOUT));
    res.send({ logined, userLogout });
};

export default handler;
