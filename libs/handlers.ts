export const goToFollowX = () =>
    chrome.tabs.create({
        url: encodeURI("https://x.com/intent/follow?original_referer=enreach.network&ref_src=twsrc^tfw|twcamp^buttonembed|twterm^follow|twgr^WandProtocol&screen_name=EnReachAI"),
    });
export const goToJoinDiscord = () =>
    chrome.tabs.create({
        url: encodeURI("https://discord.com/invite/XbWKu397"),
    });
