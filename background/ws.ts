import _ from "lodash";
import { io, Socket } from "socket.io-client";

import { WSURL } from "~constants";
import { setConnectError, setConnectStatus, setIpFromWS } from "~libs/mstorage";
import { IPData, NodeID } from "~libs/type";
import { User } from "~libs/user";

const lastSocket: { socket?: Socket; uid?: string; pingTask?: NodeJS.Timeout; nodeId?: string; ip?: string } = {};
export function closeLast(socket?: Socket) {
    if (socket && socket !== lastSocket.socket) {
        return socket.close();
    }
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
    console.info("closeLast");
}
export function connect(token: string, user: User, nodeId: NodeID, ipData: IPData) {
    if (lastSocket.socket && user.id === lastSocket.uid && nodeId === lastSocket.nodeId && ipData.ipString === lastSocket.ip) {
        return;
    }
    closeLast();
    const authToken = { userId: user.id, nodeId: nodeId };
    const socket = io(WSURL, {
        transports: ["websocket"],
        auth: { token: authToken },
        reconnectionDelay: 5000,
        reconnectionDelayMax: 10000,
    });
    lastSocket.socket = socket;
    lastSocket.uid = user.id;
    lastSocket.nodeId = nodeId;
    lastSocket.ip = ipData.ipString;
    // set connecting
    setConnectStatus("connecting");
    setConnectError();
    console.info("doConnect", user.id, nodeId);
    socket.on("connect", () => {
        console.info("connected:", socket.id);
    });
    socket.io.on("reconnect_attempt", (data) => {
        console.info("doReconnect:", data);
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
            setConnectError();
            // clear last pingTask for  auto connected
            if (lastSocket.pingTask) clearInterval(lastSocket.pingTask);
            // for uptime
            lastSocket.pingTask = setInterval(
                () => {
                    console.info("do ping to server");
                    socket.volatile.emit("ping", authToken);
                },
                1000 * 60 * 3,
            );
        }
    });
    socket.on("connect_error", (e) => {
        // will auto connect
        console.error("socket:", e.message);
        // set connect
        const msg = e.message;
        if ((typeof msg === "string" && msg.startsWith("invalid ip address:")) || ["invalid userId", "server err", "invalid auth token"].includes(msg)) {
            closeLast(socket);
        } else {
            setConnectStatus("connecting");
            setConnectError(e.message);
            if (lastSocket.pingTask) clearInterval(lastSocket.pingTask);
            lastSocket.pingTask = null;
        }
    });
    socket.on("disconnect", (reason) => {
        console.info("disconnect", user.id, reason);
        if (reason == "io server disconnect") {
            // close
            closeLast(socket);
        }
        setConnectError(reason);
    });
    try {
        (global as any).getEnreachState = () => ({ active: socket.active, id: socket.id });
    } catch (error) {}
}
