import type { PlasmoMessaging } from "@plasmohq/messaging";

import { clearForLogout } from "~libs/mstorage";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    console.info("on clearAccessToken", req);
    await clearForLogout();
    res.send({ status: "success" });
};

export default handler;
