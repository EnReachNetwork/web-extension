import imgLogo_ from "url:~assets/logo.svg";

export const imgLogo = imgLogo_;
export const ROUTES = {
    HOME: "/",
    LOGIN: "/login",
    FORGOT_PASSWORD: "/forgot-password",
    DASHBOARD: "/dashboard",
};

export const KEYS = {
    ACCESS_TOKEN: "accessToken",
    AUTHENTIC: "authenticated",
    USER_INFO: "userInfo",
    STATUS_CONNECT: "statusConnect",
};
export const StatusConnectList = ["idle", "connecting", "connected"] as const;
export type StatusConnect = (typeof StatusConnectList)[number];

export const CON = {
    InjectKey: "__EnReachAI",
    NameForContentScript: "EnReachAI_content_script",
    NameForPopup: "EnReachAI_popup",
};

export const DashboardBase = "https://beta.dashboard.enreach.network";
export const WSURL = "ws://dev-io.enreach.network";
export const HOME_BASE = "https://enreach.network";

export const Matches: string[] = ["<all_urls>", "http://*.enreach.network/*"];

export const levels = [
    { exp: 0, level: 0, name: "Berry Baby", boost: "+ 0%", color: "#DFDFDF" },
    { exp: 100, level: 1, name: "Blue Berry", boost: "+ 50%", color: "#EAE0F0" },
    { exp: 500, level: 2, name: "Sliver Berry", boost: "+ 100%", color: "#8A9CF1" },
    { exp: 1000, level: 3, name: "Gold Berry", boost: "+ 200%", color: "#FFFBB4" },
];
