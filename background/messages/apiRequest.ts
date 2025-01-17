import type { MessageName, PlasmoMessaging } from "@plasmohq/messaging";

import Api from "~libs/apis";
import { RES } from "~libs/type";
import { AxiosRequestConfig } from "axios";


async function handler<T>(req: PlasmoMessaging.Request<MessageName, AxiosRequestConfig & { path: `/${string}` }>, res: PlasmoMessaging.Response<{ success: T } | { error: any }>) {
    console.info('on apiRequest', req)
    try {
        const { body } = req;
        const r = await Api.request<RES<T>>({
            ...body,
            url: `${Api.defaults.baseURL}${body.path}`,
        });
        res.send({ success: r.data.data });
    } catch (error) {
        res.send({ error });
    }
}

export default handler;
