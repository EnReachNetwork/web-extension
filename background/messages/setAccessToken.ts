
import type { PlasmoMessaging } from "@plasmohq/messaging";

import { KEYS } from "~constants";
import Api, { configAuth } from "~libs/apis";
import { storage } from "~libs/mstorage";
import { RES } from "~libs/type";
import { User } from "~libs/user";
import { sleep } from "~libs/utils";

async function updateUserInfo() {
    while (true) {
        try {
            const user = await Api.get<RES<User>>("/api/user/profile").then((res) => res.data.data);
            await storage.set(KEYS.USER_INFO, user);
            return true;
        } catch (error) {
            console.error("updateUserInfo:", error);
            await sleep(4000)
        }
    }
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    console.info("on setAccessToken", req);
    const auth = req.body as string;
    await storage.set(KEYS.ACCESS_TOKEN, auth);
    configAuth(auth);
    await updateUserInfo();
    res.send({ status: "success" });
};

export default handler;
