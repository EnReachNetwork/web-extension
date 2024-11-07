import "@plasmohq/messaging/background";

async function inject(tabId: number) {
    console.info("executeScript: on:", tabId);
    await chrome.scripting.executeScript({
        target: { tabId },
        world: "MAIN",
        func: ({ extensionId }) => {
            console.log("Inject __EnReachAI");
            window.__EnReachAI = {
                name: "hhh",
                request: (msg) => chrome.runtime.sendMessage(extensionId, msg),
            };
        },
        args: [{ extensionId: chrome.runtime.id }],
    });
}
chrome.tabs.onAttached.addListener((tabId) => {
    inject(tabId);
});
chrome.tabs.onActivated.addListener((e) => {
    inject(e.tabId);
});
