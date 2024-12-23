import { Peer } from "peerjs";

const lastPeer: { userId: string; peer?: Peer } = {
    userId: "",
    peer: undefined,
};

export function startPeerJs(userId: string) {
    if (lastPeer.peer && lastPeer.userId === userId) {
        return;
    }
    lastPeer.userId = userId;
    const peer = new Peer(userId);
    lastPeer.peer = peer;

    peer.on("open", (id) => {
        console.info("open", id);
    });
    peer.on("connection", (con) => {
        console.info("connection", con.connectionId)
    })  
}

export function sendTask(){

}