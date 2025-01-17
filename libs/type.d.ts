export type RES<T = undefined> = {
    data: T;
};

export type NodeID = string;

export type IPData = { ipString: string; ipType: "IPv4" | "IPv6" };

export type OnTap = {
    data: string;
    src: string;
}[];

export type TapStat = {
    stat: "taping" | "success";
    msg: string;
    lastSuccessTime: number;
};
