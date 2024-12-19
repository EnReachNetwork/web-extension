export const ENV: "beta" | "staging" | "prod" = process.env.PLASMO_TAG === "dev" ? "beta" : (process.env.PLASMO_TAG as any) || "beta";
export const ENVDataMap: {
    [k in typeof ENV]: { dashboardBase: string; injectKey: string; wsUrl: string; api: string };
} = {
    beta: { dashboardBase: "https://beta.dashboard.enreach.network", injectKey: "EnreachExt_beta", wsUrl: "wss://dev-ws.enreach.network", api: "https://dev-api.enreach.network" },
    staging: {
        dashboardBase: "https://staging.dashboard.enreach.network",
        injectKey: "EnreachExt_staging",
        wsUrl: "wss://staging-ws-1.enreach.network",
        api: "https://staging-api-1.enreach.network",
    },
    prod: { dashboardBase: "https://dashboard.enreach.network", injectKey: "EnreachExt", wsUrl: "https://ws.enreach.network", api: "https://api.enreach.network" },
};
export const ENVData = ENVDataMap[ENV];
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
} as const;
export const StatusConnectList = ["idle", "connecting", "connected"] as const;
export type StatusConnect = (typeof StatusConnectList)[number];
export type KEYSType = (typeof KEYS)[keyof typeof KEYS];

export const DashboardBase = ENVData.dashboardBase;
export const WSURL = ENVData.wsUrl;
export const HOME_BASE = "https://enreach.network";

export const Matches: string[] = ["<all_urls>", "http://*.enreach.network/*"];

export const levels = [
    { exp: 0, level: 0, name: "Baby Berry", boost: "+ 0%", color: "#DFDFDF" },
    { exp: 100, level: 1, name: "Teen Berry", boost: "+ 50%", color: "#EAE0F0" },
    { exp: 500, level: 2, name: "Big Blue", boost: "+ 100%", color: "#8A9CF1" },
    { exp: 1000, level: 3, name: "Berry Captain", boost: "+ 200%", color: "#FFFBB4" },
];
