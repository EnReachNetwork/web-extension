import type { PlasmoMessaging } from "@plasmohq/messaging";

import { KEYS } from "~constants";
import Api, { configAuth } from "~libs/apis";
import { storage } from "~libs/mstorage";
import { RES } from "~libs/type";
import { User } from "~libs/user";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    console.info("on setAccessToken", req);
    const auth = req.body as string;
    await storage.set(KEYS.ACCESS_TOKEN, auth);
    configAuth(auth);
    const user = await Api.get<RES<User>>("/api/user/profile").then((res) => res.data.data);
    await storage.set(KEYS.USER_INFO, user);
    res.send({ status: "success" });
};

export default handler;
