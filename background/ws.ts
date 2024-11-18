import { io } from "socket.io-client";

import { KEYS, StatusConnectList } from "~constants";
import { storage } from "~libs/mstorage";
import { User } from "~libs/user";

export function connect(token: string, user: User) {
    const socket = io("http://localhost:3300", { auth: { Auth: token }, retries: Infinity });
    storage.set(KEYS.STATUS_CONNECT, StatusConnectList[1]);
    let pingTask: NodeJS.Timeout | null = null;
    socket.on("connect", () => {
        storage.set(KEYS.STATUS_CONNECT, StatusConnectList[2]);
        socket.emit("auth", { userId: user.id });
        pingTask = setInterval(
            () => {
                socket.emit("ping", { userId: user.id });
            },
            1000 * 60 * 10,
        );
        socket.on("ping", ({ id }) => {
            socket.emit("pong", { id });
        });
    });
    socket.on("disconnect", () => {
        storage.set(KEYS.STATUS_CONNECT, StatusConnectList[0]);
        pingTask && clearInterval(pingTask);
        pingTask = null;
    });
}
