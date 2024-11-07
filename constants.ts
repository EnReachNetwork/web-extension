import imgLogo_ from "url:~assets/logo.png"

export const imgLogo = imgLogo_
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  DASHBOARD: "/dashboard"
}

export const KEYS = {
  ACCESS_TOKEN: "accessToken",
  AUTHENTIC: "authenticated",
  USER_INFO: "userInfo",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  CONNECT_ERR: "connectErr",
  UNCONNECTED: "unconnected"
}

export const CON = {
  InjectKey: "__EnReachAI",
  NameForContentScript: "EnReachAI_content_script",
  NameForPopup: "EnReachAI_popup"
}

export const Matches: string[] = [
  "<all_urls>",
  "http://*.enreach.com/*"
]
