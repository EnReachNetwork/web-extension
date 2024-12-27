import { Peer } from "peerjs";

import { KEYS } from "~constants";

import { storage } from "./mstorage";

const lastPeer: { userId: string; peerServer: string; peer?: Peer } = {
    userId: "",
    peerServer: "",
    peer: undefined,
};

export function closePeer() {
    if (lastPeer.peer) {
        lastPeer.peer.destroy();
        lastPeer.peer.disconnect();
        lastPeer.peer = undefined;
    }
}

export function startPeerJs(userId: string, peerServer: string) {
    if (lastPeer.peer && lastPeer.userId === userId && lastPeer.peerServer === peerServer) {
        return;
    }
    lastPeer.userId = userId;
    const [host, port = "443"] = peerServer.split(":");
    console.info(userId, host, port);
    const peer = new Peer(userId, { host, port: parseInt(port) });
    lastPeer.peer = peer;
    peer.on("error", (error) => {
        console.error("peer:", error);
    });
    peer.on("open", (id) => {
        console.info("open", id);
    });
    peer.on("connection", (con) => {
        console.info("connection", con.connectionId);
        con.on("data", (data) => {});
    });
}

export function startTap(list: {}[]) {

}
