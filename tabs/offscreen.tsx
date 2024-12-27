import { startPeerJs, startTap } from "~/libs/tap"

chrome.runtime.onMessage.addListener((msg, sender, sendRes) => {
    console.info('onMsg', msg, sender)
    const { type, data, target } = msg
    if (!target || target !== 'offscreen') return;
    if (type == "onTap") {
        const { userId, peerServer } = data
        startPeerJs(userId, peerServer);
    } else if (type == 'doTap') {
        const { userId, peerServer } = data
        startPeerJs(userId, peerServer)
        startTap([])
    }
})

export default function Offscreen() {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                padding: 16
            }}>
            <h2>Offscreen</h2>
        </div>
    )
}