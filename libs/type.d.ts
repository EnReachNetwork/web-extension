export type RES<T = undefined> = {
    data: T;
};

export type NodeID = {
    uid: string;
    nodeId: string;
};

export type IPData = { ipString: string; ipType: "IPv4" | "IPv6" };
