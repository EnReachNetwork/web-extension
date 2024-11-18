import axios from "axios";

const Api = axios.create({
    baseURL: "http://localhost:3000",
    headers: {
        "Content-Type": "application/json",
    },
});

export function configAuth(token: string) {
    Api.defaults.headers.common.Authorization = token.startsWith("Bearer") ? token : `Bearer ${token}`;
}

export default Api;
