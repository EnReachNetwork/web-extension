
import { KEYSType } from "~constants";

export async function storageGetOfBg<T>(key: KEYSType) {
    const data =  await chrome.runtime.sendMessage<any,T>({ type: 'reqStorage', target: 'sw', data: { method: "get", key }})
    return data;
    // const data = await sendToBackgroundViaRelay<{ method: "get" | "set"; key: string; value?: any }, T | boolean>({ name: "reqStorage", body: { method: "get", key } });
    // return data as T;
}
export async function storageSetOfBg(key: KEYSType, value: any) {
    await chrome.runtime.sendMessage({ type: 'reqStorage', target: 'sw', data: { method: "set", key, value }})
    return true;
    // const data = await sendToBackgroundViaRelay<{ method: "get" | "set"; key: string; value?: any }, T | boolean>({ name: "reqStorage", body: { method: "set", key, value } });
    // return data as boolean;
}
