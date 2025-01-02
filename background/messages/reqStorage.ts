import type { PlasmoMessaging } from "@plasmohq/messaging";

import { storage } from "~libs/mstorage";

const handler: PlasmoMessaging.MessageHandler<{ method: "get" | "set"; key: string; value?: any }> = async (req, res) => {
    console.info('on reqStorage', req)
    const { body } = req;
    const { method, key, value } = body;
    if (method == "get") {
        const data = await storage.get(key);
        res.send(data);
    } else if (value === null || value === undefined) {
        await storage.remove(key);
        res.send(true);
    } else {
        await storage.set(key, value);
        res.send(true);
    }
};

export default handler;
