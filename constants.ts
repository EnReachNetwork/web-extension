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
    CONNECTING: "connecting",
    CONNECTED: "connected",
    CONNECT_ERR: "connectErr",
    UNCONNECTED: "unconnected",
};
export const StatusConnectList = ["idle", "connecting", "connected", "error"] as const;
export type StatusConnect = (typeof StatusConnectList)[number];

export const CON = {
    InjectKey: "__EnReachAI",
    NameForContentScript: "EnReachAI_content_script",
    NameForPopup: "EnReachAI_popup",
};

export const DashboardBase = 'http://localhost:3001'

export const Matches: string[] = ["<all_urls>", "http://*.enreach.com/*"];
