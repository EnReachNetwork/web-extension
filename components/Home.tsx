import { useQuery } from "@tanstack/react-query";
import Avatar from "boring-avatars";
import _ from "lodash";
import React, { MouseEventHandler, useEffect, useState } from "react";
import { FiAlertCircle, FiChevronLeft, FiLogOut } from "react-icons/fi";
import { PiCopySimple } from "react-icons/pi";
import { RiDiscordLine, RiTwitterXLine } from "react-icons/ri";

import { DashboardBase, HOME_BASE, KEYS, levels, StatusConnect } from "~constants";
import { useCopy } from "~hooks/useCopy";
import useLocalStorage from "~hooks/useLocalStorage";
import Api from "~libs/apis";
import { goToFollowX, goToJoinDiscord } from "~libs/handlers";
import { imgLogo } from "~libs/imgs";
import { IPData, NodeID, RES } from "~libs/type";
import { cn } from "~libs/utils";

import { ConnectingAnim, NetworkQulityAnim } from "./Anims";
import { useAuthContext } from "./AuthContext";
import { GoToDashboard } from "./Buttom";
import { fmtBerry, fmtBoost, fmtNetqulityDeg } from "./fmtData";
import { Berry, Exp, Rocket } from "./svgs/icons";

function ConnectingUI(p: { onClickUser: MouseEventHandler<any> }) {
    const [connectError] = useLocalStorage(KEYS.CONNECT_ERROR);
    // const [connectError] = useLocalStorage(KEYS.CONNECT_ERROR,'err');
    return (
        <div className="flex flex-col flex-1 w-full h-full p-[18px] items-center justify-between relative">
            <div className="flex w-full rounded-[34px] bg-[#595959] p-6 flex-col items-center">
                <img src={imgLogo} className="h-[60px] translate-x-4 -translate-y-5" alt={"logo"} />
                <ConnectingAnim className="mt-8 mb-12 h-[195px] translate-x-3" />
                {/* <img src={connectingGif} className="mt-8 mb-12 h-[195px] translate-x-3" alt="login" /> */}
            </div>
            {/* <div className="font-medium text-white text-center text-[15px] my-auto ">Connecting...</div> */}
            <div className="font-medium text-white text-center text-[15px my-auto flex items-end gap-2">
                Connecting<div className="loading -translate-y-1"></div>
            </div>
            <GoToDashboard className="mb-[11px]" />
            {Boolean(connectError) && (
                <p className="text-left flex items-start gap-1 p-3 text-xs bg-primary absolute left-0 bottom-0 rounded-t-[30px] w-full">
                    <FiAlertCircle className="text-base " />
                    There seems to be a network issue, please check your internet connectivity.
                </p>
            )}
        </div>
    );
}

function ConnectedUI(p: { onClickUser: MouseEventHandler<any> }) {
    const { userInfo, logoutUser, isFetchingUserInfo } = useAuthContext();
    const copy = useCopy();
    const exp = userInfo?.stat?.exp || 0;
    const endLevel = levels.find((l) => l.exp > exp) || levels[levels.length - 1];
    const startLevel = levels[endLevel.level - 1];
    const [currentProcess, setProcess] = useState(0);
    useEffect(() => {
        setProcess(Math.floor((exp * 100) / endLevel.exp));
    }, [exp]);
    // const currentProcess = ;
    const [nodeID] = useLocalStorage<NodeID>(KEYS.NODE_ID);
    const [ipFromWS] = useLocalStorage<string>(KEYS.IP_FROM_WS);
    const { data: netQuality, isFetching: isFetchingNetQuality } = useQuery({
        queryKey: ["NetworkQuality", nodeID, ipFromWS],
        enabled: Boolean(nodeID) && Boolean(ipFromWS),
        refetchInterval: 1000 * 60 * 2,
        retry: true,
        retryDelay: 5000,
        refetchIntervalInBackground: true,
        queryFn: async () => {
            const res = await Api.get<RES<{ lastReward: string }>>(`/api/node/${nodeID}/${encodeURIComponent(ipFromWS)}/reward`);
            return fmtNetqulityDeg(res.data.data.lastReward);
        },
    });
    const total = _.toNumber(userInfo?.point.total || 0);
    const boost = fmtBoost(userInfo?.stat.extraBoost);
    const mTotal = fmtBerry(total * boost);
    const onCopyReferral = () => copy(`${DashboardBase}/signup?referral=${userInfo?.inviteCode}`);
    return (
        <div className="flex flex-col items-center w-full h-full logo_bg p-[18px] gap-7">
            {/* <div className="self-end border border-[#595959] w-[44px] h-[44px] rounded-full">
                <div className="border border-[#C0C0C0] w-full h-full rounded-full">
                </div>
            </div> */}
            <Avatar name={userInfo?.email} size={40} className="cursor-pointer self-end" variant="marble" onClick={p.onClickUser} />
            <div className="flex flex-col gap-2 w-full items-center mt-[30px]">
                <NetworkQulityAnim netQulityDeg={netQuality} />
                <span className="font-semibold text-sm text-center">Network Quality</span>
                <div className="flex items-center gap-[6px]">
                    <div className="bg-green-500/90 rounded-full w-2 h-2" />
                    <div className="bg-[#3A3A3A] rounded-full px-2 py-[2px] text-xs font-medium">Connected</div>
                </div>
            </div>

            <div className={cn("bg-[#595959] w-full p-4 rounded-[25px]")}>
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
            <div className="flex items-center justify-center gap-1">
                <button className="text-sm font-medium btn2 w-[129px]">Referral Link</button>
                <div className="w-[41px] h-[41px] rounded-full bg-primary flex justify-center items-center cursor-pointer" onClick={onCopyReferral}>
                    <PiCopySimple className="rotate-90 text-base" />
                </div>
            </div>
            <GoToDashboard />
        </div>
    );
}

function UserUI(p: { onBack: MouseEventHandler<any> }) {
    const ac = useAuthContext();
    const [ip] = useLocalStorage<IPData>(KEYS.IP_DATA);
    const [ipFromWs] = useLocalStorage<string>(KEYS.IP_FROM_WS);
    const nodeIP = ipFromWs || ip?.ipString || "-";
    return (
        <div className="flex flex-col items-center w-full h-full gap-[10px]">
            <div className="flex items-center justify-between w-full p-4">
                <div className="flex items-center justify-center cursor-pointer h-11 w-11" onClick={p.onBack}>
                    <FiChevronLeft className="text-2xl" />
                </div>
            </div>
            <Avatar name={ac.userInfo?.email} size={66} className="mt-9" variant="marble" />
            <span>{ac.userInfo?.email || ""}</span>
            <div className="flex flex-col gap-[10px] w-full px-[25px] mt-2.5">
                <div className="bg-[#595959] w-full flex px-5 py-3 rounded-lg justify-between flex-wrap">
                    <span className="whitespace-nowrap">Node IP: </span>
                    <span className="text-sm text-white/80">{nodeIP}</span>
                </div>
                <button className="text-base font-medium btn" onClick={() => chrome.tabs.create({ url: HOME_BASE })}>
                    About EnReach
                </button>
                <div className="px-6 flex items-center justify-between text-base">
                    <div className="flex items-center gap-[15px] text-xl">
                        <RiTwitterXLine className="cursor-pointer hover:text-primary" onClick={goToFollowX} />
                        <RiDiscordLine className="text-2xl cursor-pointer hover:text-primary" onClick={goToJoinDiscord} />
                    </div>
                    <span
                        className="cursor-pointer hover:text-primary"
                        onClick={() => {
                            ac.logoutUser();
                        }}
                    >
                        <FiLogOut />
                    </span>
                </div>
            </div>
            <GoToDashboard className="mt-auto mb-[29px]" />
        </div>
    );
}
export const Home: React.FC = () => {
    const [showUser, setShowUser] = useState(false);
    const [status] = useLocalStorage<StatusConnect>(KEYS.STATUS_CONNECT, "connecting");
    // const isConnected = false;
    const isConnected = status === "connected";
    const onClickUser = () => setShowUser(true);
    return showUser ? <UserUI onBack={() => setShowUser(false)} /> : isConnected ? <ConnectedUI onClickUser={onClickUser} /> : <ConnectingUI onClickUser={onClickUser} />;
};
