import type { PlasmoMessaging } from "@plasmohq/messaging";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    console.info("on ping", req);
    res.send({ message: "ping success" });
};

export default handler;
