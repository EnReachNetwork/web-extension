import { io, Socket } from "socket.io-client";

import { KEYS, StatusConnectList, WSURL } from "~constants";
import { storage } from "~libs/mstorage";
import { IPData, NodeID } from "~libs/type";
import { User } from "~libs/user";

const lastSocket: { socket?: Socket; uid?: string; pingTask?: NodeJS.Timeout; nodeId?: string; ip?: string } = {};
export function closeLast() {
    storage.set(KEYS.STATUS_CONNECT, StatusConnectList[0]);
    storage.remove(KEYS.CONNECT_ID);
    if (lastSocket.socket) {
        lastSocket.socket.disconnect();
        lastSocket.socket = undefined;
    }
    if (lastSocket.pingTask) {
        clearInterval(lastSocket.pingTask);
        lastSocket.pingTask = null;
    }
}
export async function connect(token: string, user: User, nodeId: NodeID, ipData: IPData) {
    if (lastSocket.socket && lastSocket.socket.id && user.id === lastSocket.uid && nodeId.nodeId === lastSocket.nodeId && ipData.ipString === lastSocket.ip) {
        return;
    }
    closeLast();
    const socket = io(WSURL, {
        transports: ["websocket"],
    });
    lastSocket.socket = socket;
    lastSocket.uid = user.id;
    lastSocket.nodeId = nodeId.nodeId;
    lastSocket.ip = ipData.ipString;
    // set connecting
    storage.set(KEYS.STATUS_CONNECT, StatusConnectList[1]);
    console.info("doConnect", user.id, nodeId);
    socket.on("connect", () => {
        console.info("connected:", socket.id);
        // connectedId
        storage.set(KEYS.CONNECT_ID, socket.id);
        // set connected
        storage.set(KEYS.STATUS_CONNECT, StatusConnectList[2]);
        // for connect
        socket.emit("auth", { userId: user.id, nodeId: nodeId.nodeId });
        // for uptime
        lastSocket.pingTask = setInterval(
            () => {
                console.info("do ping to server");
                socket.emit("ping", { userId: user.id, nodeId: nodeId.nodeId });
            },
            1000 * 60 * 10,
        );
        // fot test delay
        socket.on("ping", ({ id }) => {
            console.info("onPing:", id);
            socket.emit("pong", { id });
        });
    });
    socket.on("connect_error", (e) => {
        console.error("socket:", e);
    });
    socket.on("disconnect", (reason) => {
        console.info("disconnect", user.id, reason);
        if (reason == "io server disconnect") {
            // close
            closeLast();
        }
    });
    try {
        (global as any).getEnreachState = () => ({ active: socket.active, id: socket.id });
    } catch (error) {}
}
