import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { v5 as uuid } from "uuid";

import { KEYS } from "~constants";

import { storage } from "./mstorage";
import { NodeID } from "./type";
import { User } from "./user";

export async function genNodeId(user: User) {
    while (true) {
        try {
            let nodeID = await storage.get<NodeID>(KEYS.NODE_ID);
            if (nodeID && nodeID.uid == user.id) return;
            const fjs = await FingerprintJS.load();
            const { visitorId } = await fjs.get();
            console.info("vId:", visitorId, user.id);
            const nodeId = uuid(visitorId + user.id, "a40cbc48-a743-11ef-9781-325096b39f47");
            console.info("nodeId:", nodeId, visitorId, user.id);
            nodeID = { uid: user.id, nodeId };
            storage.set(KEYS.NODE_ID, nodeID);
            return;
        } catch (error) {
            console.error(error);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            continue;
        }
    }
}
