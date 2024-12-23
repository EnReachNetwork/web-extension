
import type { PlasmoMessaging } from "@plasmohq/messaging";



const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    console.info("on tapOther", req);
    
};

export default handler;
