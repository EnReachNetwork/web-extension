import { HOME_BASE } from "~constants";

export const goToFollowX = () =>
    chrome.tabs.create({
        url: encodeURI("https://x.com/intent/follow?original_referer=enreach.network&ref_src=twsrc^tfw|twcamp^buttonembed|twterm^follow|twgr^WandProtocol&screen_name=EnReachAI"),
    });
export const goToJoinDiscord = () =>
    chrome.tabs.create({
        url: encodeURI("https://discord.com/invite/XbWKu397"),
    });
export const goToTelegram = () =>
    chrome.tabs.create({
        url: encodeURI("https://t.me/EnReachNetwork"),
    });

export const goToGuide = () => chrome.tabs.create({ url: "https://docs.enreach.network/user-guide" });

export const goToWebsite = () => chrome.tabs.create({ url: HOME_BASE });
