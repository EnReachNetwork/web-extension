import { connectPeerJsServer, startTap } from "~tabs/tap"

chrome.runtime.onMessage.addListener((msg, sender, sendRes) => {
    // console.info('onMsg', msg, sender)
    const { type, data, target } = msg
    if (!target || target !== 'offscreen') return;
    if (type == "onTap") {
        // 其他用户开始tap, 如果没有连接到peerjs, 则连接
        const { userId, uuid } = data
        console.log(`onTap: userId=${userId}, uuid=${uuid}`)
        connectPeerJsServer(userId, uuid);
    } else if (type == 'doTap') {
        const { userId } = data
        console.log(`doTap: userId=${userId}`)
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