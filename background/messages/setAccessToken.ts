
import type { PlasmoMessaging } from "@plasmohq/messaging";

import { KEYS } from "~constants";
import Api, { configAuth } from "~libs/apis";
import { storage } from "~libs/mstorage";
import { RES } from "~libs/type";
import { User } from "~libs/user";

async function updateUserInfo() {
    while (true) {
        try {
            const user = await Api.get<RES<User>>("/api/user/profile").then((res) => res.data.data);
            await storage.set(KEYS.USER_INFO, user);
            return true;
        } catch (error) {
            console.error("updateUserInfo:", error);
            await new Promise((reslove) => setTimeout(reslove, 4000));
        }
    }
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    console.info("on setAccessToken", req);
    const auth = req.body as string;
    storage.set(KEYS.ACCESS_TOKEN, auth);
    configAuth(auth);
    await updateUserInfo();
    res.send({ status: "success" });
};

export default handler;
