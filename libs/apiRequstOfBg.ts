
import { AxiosRequestConfig } from "axios";

export async function requsetOfBg<T>(req: AxiosRequestConfig & { path: `/${string}` }) {
    const data =  await chrome.runtime.sendMessage<any,{ success: T } | { error: any }>({ type: 'apiRequest', target: 'sw', data: req})
    // const data = await sendToBackgroundViaRelay<AxiosRequestConfig & { path: `/${string}` }, { success: T } | { error: any }>({ name: "apiRequest", body: req  });
    if ((data as { error: any }).error) {
        throw (data as { error: any }).error;
    } else {
        return (data as { success: T }).success;
    }
}
