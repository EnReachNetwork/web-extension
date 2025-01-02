import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { PiCopySimple } from "react-icons/pi";

import { DashboardBase, KEYS, levels, StatusConnect } from "~constants";
import { useCopy } from "~hooks/useCopy";
import Api from "~libs/apis";
import { NodeID, RES } from "~libs/type";
import { User } from "~libs/user";
import { cn } from "~libs/utils";

import { ConnectingAnim, NetworkQulityAnim } from "./Anims";
import { AutoFlip } from "./auto-flip";
import { fmtBerry, fmtBoost, fmtNetqulityDeg } from "./fmtData";
import { GoToDashboard } from "./Footers";
import { HeaderLogo } from "./Headers";
import { useStoreItem } from "./Store";
import { Berry, Exp, Rocket } from "./svgs/icons";
import { TapSprite } from "./RouterTap";

function ConnectingUI() {
    const [connectError] = useStoreItem(KEYS.CONNECT_ERROR);
    // const [connectError] = useStoreItem(KEYS.CONNECT_ERROR,'err');
    return (
        <AutoFlip className="flex flex-col flex-1 w-full h-full p-[18px] items-center justify-between relative">
            <HeaderLogo />
            <div className="flip_item flex w-full rounded-[34px] bg-[#595959] p-6 flex-col items-center">
                <ConnectingAnim className="mt-8 mb-12 h-[195px] translate-x-3" />
                {/* <img src={connectingGif} className="mt-8 mb-12 h-[195px] translate-x-3" alt="login" /> */}
            </div>
            {/* <div className="font-medium text-white text-center text-[15px] my-auto ">Connecting...</div> */}
            <div className="flip_item font-medium text-white text-center text-[15px my-auto flex items-end gap-2">
                Connecting<div className="loading -translate-y-1"></div>
            </div>
            <GoToDashboard className="flip_item mb-[18px] mt-auto" />
            {Boolean(connectError) && (
                <p className="text-left flex items-start gap-1 p-3 text-xs bg-primary absolute left-0 bottom-0 rounded-t-[30px] w-full">
                    <FiAlertCircle className="text-base " />
                    There seems to be a network issue, please check your internet connectivity.
                </p>
            )}
        </AutoFlip>
    );
}

function ConnectedUI() {
    const [userInfo] = useStoreItem<User | undefined>(KEYS.USER_INFO);
    const copy = useCopy();
    const exp = userInfo?.stat?.exp || 0;
    const endLevel = levels.find((l) => l.exp > exp) || levels[levels.length - 1];
    const startLevel = levels[endLevel.level - 1];
    const [currentProcess, setProcess] = useState(0);
    useEffect(() => {
        setProcess(Math.floor((exp * 100) / endLevel.exp));
    }, [exp]);
    // const currentProcess = ;
    const [nodeID] = useStoreItem<NodeID>(KEYS.NODE_ID);
    const [ipFromWS] = useStoreItem<string>(KEYS.IP_FROM_WS);
    const { data: netQuality, isFetching: isFetchingNetQuality } = useQuery({
        initialData: "-",
        queryKey: ["NetworkQuality", nodeID, ipFromWS],
        enabled: Boolean(nodeID) && Boolean(ipFromWS),
        refetchInterval: 1000 * 60 * 2,
        retry: true,

        retryDelay: 5000,
        refetchIntervalInBackground: true,
        refetchOnMount: true,
        structuralSharing: false,
        queryFn: async () => {
            const res = await Api.get<RES<{ lastReward: string }>>(`/api/node/${nodeID}/${encodeURIComponent(ipFromWS)}/reward`);
            return fmtNetqulityDeg(res.data.data.lastReward);
        },
    });
    const netQualityDeg = _.toNumber(netQuality.replace("-", "").replace("deg", ""));
    const netQualityName = netQuality === "-" ? "-" : netQualityDeg < 60 ? "Poor" : netQualityDeg < 120 ? "Good" : "Superb";
    const total = _.toNumber(userInfo?.point.total || 0);
    const boost = fmtBoost(userInfo?.stat.extraBoost);
    const mTotal = fmtBerry(total * _.toNumber(boost));
    const onCopyReferral = () => copy(`${DashboardBase}/signup?referral=${userInfo?.inviteCode}`);
   
    return (
        <AutoFlip className="flex flex-col items-center w-full h-full logo_bg p-[18px] gap-7 relative">
            <HeaderLogo />
            <div className="flip_item flex flex-col gap-2 w-full items-center">
                <NetworkQulityAnim netQulityDeg={netQuality} />
                <span className="font-semibold text-sm text-center">Network Quality: {netQualityName}</span>
                <div className="flex items-center gap-[6px]">
                    <div className="bg-green-500/90 rounded-full w-2 h-2" />
                    <div className="bg-[#3A3A3A] rounded-full px-2 py-[2px] text-xs font-medium">Connected</div>
                </div>
            </div>

            <div className={cn("flip_item bg-[#595959] w-full p-4 rounded-[25px]")}>
                <div className="flex justify-between  leading-3 ">
                    <div>
                        <span className="font-semibold text-[10px] text-[#999999]">Total Rewards</span>
                        <div className="flex items-center mt-1 gap-[10px]">
                            <span className="font-bold text-xl">{mTotal}</span>
                            <Berry className="text-base" />
                        </div>
                    </div>
                    <div>
                        <span className="font-semibold text-[10px] text-[#999999]">Extra Boost</span>
                        <div className="flex items-center mt-1 gap-0.5">
                            <span className="font-bold text-xl">{boost}x</span>
                            <Rocket className="text-xl mt-[3px]" />
                        </div>
                    </div>
                </div>
                <div className="w-full h-[19px] mt-5 relative rounded-full overflow-hidden">
                    <div className="loader" />
                    <div className="left-0 top-0 h-full rounded-full absolute bg-primary" style={{ transition: "all ease 1s", width: `${currentProcess}%` }}></div>
                </div>
                <div className="flex mt-2.5 gap-2.5 items-center font-bold text-[20px] leading-none">
                    <span className="">
                        {exp}/{endLevel.exp}
                    </span>
                    <Exp />
                </div>
            </div>
            <div className="flip_item flex items-center justify-center gap-1 ">
                <button className="text-sm font-medium btn2 w-[129px] !cursor-default">Referral Link</button>
                <div className="w-[41px] h-[41px] rounded-full bg-primary hover:bg-white/15 flex justify-center items-center cursor-pointer" onClick={onCopyReferral}>
                    <PiCopySimple className="rotate-90 text-base" />
                </div>
            </div>
            <GoToDashboard className="flip_item mb-[18px] mt-auto" />
            <TapSprite/>
        </AutoFlip>
    );
}

export const Home: React.FC = () => {
    const [status] = useStoreItem<StatusConnect>(KEYS.STATUS_CONNECT, "connecting");
    // const isConnected = false;
    const isConnected = status === "connected";
    return isConnected ? <ConnectedUI /> : <ConnectingUI />;
};
