import { io, Socket } from "socket.io-client";

import { WSURL } from "~constants";
import { setConnectStatus, setIpFromWS } from "~libs/mstorage";
import { IPData, NodeID } from "~libs/type";
import { User } from "~libs/user";

const lastSocket: { socket?: Socket; uid?: string; pingTask?: NodeJS.Timeout; nodeId?: string; ip?: string } = {};
export function closeLast() {
    setConnectStatus("idle");
    if (lastSocket.socket) {
        lastSocket.socket.disconnect();
        lastSocket.socket = undefined;
    }
    if (lastSocket.pingTask) {
        clearInterval(lastSocket.pingTask);
        lastSocket.pingTask = null;
    }
    setIpFromWS();
}
export function connect(token: string, user: User, nodeId: NodeID, ipData: IPData) {
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
    setConnectStatus("connecting");
    console.info("doConnect", user.id, nodeId);
    socket.on("connect", () => {
        console.info("connected:", socket.id);
        // for connect
        socket.volatile.emit("auth", { userId: user.id, nodeId: nodeId.nodeId });
    });
    // fot test delay
    socket.on("ping", ({ id }) => {
        console.info("onPing:", id);
        socket.volatile.emit("pong", { id });
    });
    socket.on("pong", () => {
        console.info("onPong:");
    });
    // auth success
    socket.on("auth", (data) => {
        console.info("onAuth:", data);
        if (data && data.ip && typeof data.ip == "string") {
            const { ip } = data;
            setIpFromWS(ip);
            // set connected
            setConnectStatus("connected");
            // clear last pingTask for  auto connected
            if (lastSocket.pingTask) clearInterval(lastSocket.pingTask);
            // for uptime
            lastSocket.pingTask = setInterval(
                () => {
                    console.info("do ping to server");
                    socket.volatile.emit("ping", { userId: user.id, nodeId: nodeId.nodeId });
                },
                1000 * 60 * 3,
            );
        }
    });
    socket.on("connect_error", (e) => {
        // will auto connect
        console.error("socket:", e);
        // set connect
        setConnectStatus("connecting");
        if (lastSocket.pingTask) clearInterval(lastSocket.pingTask);
        lastSocket.pingTask = null;
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
