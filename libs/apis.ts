import axios from "axios";
import { ENVData } from "~constants";

const Api = axios.create({
    baseURL: ENVData.api,
    headers: {
        "Content-Type": "application/json",
    },
});

export function configAuth(token?: string) {
    if (!token) {
        Api.defaults.headers.common.Authorization = undefined;
    } else {
        Api.defaults.headers.common.Authorization = token.startsWith("Bearer") ? token : `Bearer ${token}`;
    }
}

export default Api;
