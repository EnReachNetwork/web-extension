export const KEYS = {
    ACCESS_TOKEN: "accessToken",
    USER_INFO: "userInfo",
    STATUS_CONNECT: "statusConnect",
    CONNECT_ID: "connectedId",
    IP_DATA: "ipData",
    NODE_ID: "nodeID",
    USER_LOGOUT: "userLogout",
    IP_FROM_WS: "ipFromWS",
    CONNECT_ERROR: "connectError",
};
export const StatusConnectList = ["idle", "connecting", "connected"] as const;
export type StatusConnect = (typeof StatusConnectList)[number];

export const CON = {
    InjectKey: "__EnReachAI",
    NameForContentScript: "EnReachAI_content_script",
    NameForPopup: "EnReachAI_popup",
};

export const DashboardBase = "https://beta.dashboard.enreach.network";
export const WSURL = "https://dev-ws.enreach.network";
// export const WSURL = "wss://dev-ws.enreach.network";
export const HOME_BASE = "https://enreach.network";

export const Matches: string[] = ["<all_urls>", "http://*.enreach.network/*"];

export const levels = [
    { exp: 0, level: 0, name: "Baby Berry", boost: "+ 0%", color: "#DFDFDF" },
    { exp: 100, level: 1, name: "Teen Berry", boost: "+ 50%", color: "#EAE0F0" },
    { exp: 500, level: 2, name: "Big Blue", boost: "+ 100%", color: "#8A9CF1" },
    { exp: 1000, level: 3, name: "Berry Captain", boost: "+ 200%", color: "#FFFBB4" },
];
