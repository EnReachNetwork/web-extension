import axios from "axios";
import { shuffle } from "lodash";

import { IPData } from "./type";
import { sleep } from "./utils";

async function getIP_0(): Promise<IPData> {
    const data = await axios.get<IPData>("https://api.bigdatacloud.net/data/client-ip");
    return data.data;
}
async function getIP_1(): Promise<IPData> {
    const data = await axios.get<{ ip: string }>("https://api.ipify.org/?format=json");
    return { ipType: "IPv4", ipString: data.data.ip };
}
async function getIP_2(): Promise<IPData> {
    const data = await axios.get<{ ip: string; version: "IPv4" | "IPv6" }>("https://ipapi.co/json/");
    return { ipType: data.data.version, ipString: data.data.ip };
}
async function getIP_3(): Promise<IPData> {
    const data = await axios.get<IPData>("https://api-bdc.net/data/client-ip");
    return data.data;
}

const getIPFuncs: (() => Promise<IPData>)[] = [getIP_0, getIP_1, getIP_2, getIP_3];
export async function getIP() {
    const funcs = shuffle(getIPFuncs);
    let i = 0;
    while (true) {
        try {
            const res = await funcs[i]();
            return res;
        } catch (error) {
            console.error("getIP", i, error);
        }
        i++;
        if (i >= funcs.length) {
            await sleep(5000);
            i = 0;
        }
    }
}
