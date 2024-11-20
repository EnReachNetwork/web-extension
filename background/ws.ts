import { io, Socket } from "socket.io-client";

import { KEYS, StatusConnectList, WSURL } from "~constants";
import { storage } from "~libs/mstorage";
import { User } from "~libs/user";

const lastSocket: { socket?: Socket } = {};

export function closeLast() {
    if (lastSocket.socket) {
        lastSocket.socket.disconnect();
        lastSocket.socket = undefined;
    }
}
export function connect(token: string, user: User) {
    closeLast();
    const socket = io(WSURL, {
        transports: ["websocket"],
        retries: 99999999,
    });
    lastSocket.socket = socket;
    // set connecting
    storage.set(KEYS.STATUS_CONNECT, StatusConnectList[1]);
    let pingTask: NodeJS.Timeout | null = null;
    console.info("doConnect", user.id);
    socket.on("connect", () => {
        console.info("connected:", socket.id);
        // connectedId
        storage.set(KEYS.CONNECT_ID, socket.id);
        // set connected
        storage.set(KEYS.STATUS_CONNECT, StatusConnectList[2]);
        // for connect
        socket.emit("auth", { userId: user.id });
        // for uptime
        pingTask = setInterval(
            () => {
                socket.emit("ping", { userId: user.id });
            },
            1000 * 60 * 10,
        );
        // fot test delay
        socket.on("ping", ({ id }) => {
            socket.emit("pong", { id });
        });
    });
    socket.on("connect_error", (e) => {
        console.error("socket:", e);
    });
    socket.on("disconnect", () => {
        console.info("disconnect", user.id);
        // set idle
        storage.set(KEYS.STATUS_CONNECT, StatusConnectList[0]);
        storage.remove(KEYS.CONNECT_ID);
        pingTask && clearInterval(pingTask);
        pingTask = null;
        lastSocket.socket = undefined;
    });
}
