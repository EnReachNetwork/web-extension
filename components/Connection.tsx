import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import React from "react";
import { FiCheck } from "react-icons/fi";
import berry from "url:~assets/IconBerry.png";
import rocket from "url:~assets/IconRocket.png";

import { useCopy } from "~hooks/useCopy";
import useLocalStorage from "~hooks/useLocalStorage";
import Api from "~libs/apis";
import { NodeID, RES } from "~libs/type";

import { DashboardBase, KEYS, levels, StatusConnect } from "../constants";
import { useAuthContext } from "./AuthContext";
import ConAnim from "./ConAnim";
import { fmtBerry, fmtBoost, fmtNetqulity } from "./fmtData";

export const Connection: React.FC = () => {
    const { userInfo, logoutUser } = useAuthContext();
    const [status] = useLocalStorage<StatusConnect>(KEYS.STATUS_CONNECT, "connecting");
    const copy = useCopy();
    const exp = userInfo?.stat?.exp || 0;
    const endLevel = levels.find((l) => l.exp > exp) || levels[levels.length - 1];
    const startLevel = levels[endLevel.level - 1];
    const currentProcess = Math.floor((exp * 100) / endLevel.exp);
    const [nodeID] = useLocalStorage<NodeID>(KEYS.NODE_ID);
    const { data: netQuality } = useQuery({
        queryKey: ["NetworkQuality", nodeID?.nodeId],
        enabled: status == "connected" && Boolean(nodeID),
        refetchInterval: 1000 * 60 * 5,
        retry: true,
        retryDelay: 5000,
        refetchIntervalInBackground: true,
        queryFn: async () => {
            const res = await Api.get<RES<{ lastReward: string }>>(`/api/node/${nodeID.nodeId}/reward`);
            return fmtNetqulity(res.data.data.lastReward);
        },
    });
    const total = _.toNumber(userInfo?.point.total || 0);
    const boost = fmtBoost(userInfo?.stat.extraBoost);
    const mTotal = fmtBerry(total * boost);

    return (
        <div className="flex flex-col items-center w-full flex-1 px-[25px] gap-[10px]">
            <ConAnim status={status} />
            {status === "connected" ? (
                <p className="text-center text-xs">
                    {"You are connected to the EnReach Network"}
                    <FiCheck className="inline-block ml-1 text-green-500" />
                </p>
            ) : (
                <p className="text-center text-xs">Connecting...</p>
            )}
            {status === "connected" && (
                <>
                    <div className="flex bg-[#F5F5F5] w-full items-center justify-between px-5 py-3 text-sm rounded-lg">
                        <span className="font-normal leading-4 ">Network Quality:</span>
                        <span className="font-bold leading-4 text-[#4281FF] ">{netQuality}</span>
                    </div>

                    <div className="bg-[#F5F5F5] w-full  px-5 py-3 rounded-lg">
                        <div className="flex justify-between text-[10px] font-normal leading-3 text-[#999999]">
                            <span>Total Rewards</span>
                            <span>Extra Boost</span>
                        </div>
                        <div className="flex justify-between font-bold leading-5 text-5 mt-[10px]">
                            <div className="flex items-center gap-[10px]">
                                <span className="">{mTotal}</span>
                                <img src={berry} alt="berry" />
                            </div>
                            <div className="flex items-center gap-[10px]">
                                <span className="">{boost}x</span>
                                <img src={rocket} alt="rocket" />
                            </div>
                        </div>

                        <div className="flex justify-between text-[10px] font-normal leading-3 text-[#999999] mt-5">
                            <span>{startLevel.name}</span>
                            <span>{endLevel.name}</span>
                        </div>
                        <div className="!w-full progress-bar my-[6px]">
                            <div className="progress" style={{ width: `${currentProcess}%` }}></div>
                        </div>
                        <div className="flex justify-between font-bold leading-5 text-5 ">
                            <div className="flex items-center gap-[10px]">
                                <span className="">
                                    {exp}/{endLevel.exp}
                                </span>
                                <span className="font-medium text-[10px] ">EXP</span>
                            </div>
                        </div>
                    </div>
                    <button className="text-base font-medium btn mt-auto" onClick={() => copy(`${DashboardBase}/signup?referral=${userInfo?.inviteCode}`)}>
                        Copy Referral Link
                    </button>
                </>
            )}
        </div>
    );
};
