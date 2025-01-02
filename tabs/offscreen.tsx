import { startPeerJs, startTap } from "~tabs/tap"

chrome.runtime.onMessage.addListener((msg, sender, sendRes) => {
    console.info('onMsg', msg, sender)
    const { type, data, target } = msg
    if (!target || target !== 'offscreen') return;
    if (type == "onTap") {
        const { userId, uuid } = data
        startPeerJs(userId, uuid);
    } else if (type == 'doTap') {
        const { userId } = data
        startTap(userId)
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