import Avatar from "boring-avatars";
import React, { MouseEventHandler, useState } from "react";
import { FaDiscord, FaXTwitter } from "react-icons/fa6";
import { FiChevronLeft, FiLogOut } from "react-icons/fi";

import { HOME_BASE, KEYS } from "~constants";
import useLocalStorage from "~hooks/useLocalStorage";
import { goToFollowX, goToJoinDiscord } from "~libs/handlers";
import { IPData } from "~libs/type";

import { useAuthContext } from "./AuthContext";
import { GoToDashboard } from "./Buttom";
import { Connection } from "./Connection";
import { Header } from "./Header";

function HomeUI(p: { onClickUser: MouseEventHandler<any> }) {
    return (
        <div className="flex flex-col items-center w-full h-full gap-[10px]">
            <Header onClickUser={p.onClickUser} />
            <Connection />
            <GoToDashboard />
        </div>
    );
}

function UserUI(p: { onBack: MouseEventHandler<any> }) {
    const ac = useAuthContext();
    const [ip] = useLocalStorage<IPData>(KEYS.IP_DATA);
    const [ipFromWs] = useLocalStorage<string>(KEYS.IP_FROM_WS);
    const nodeIP = ipFromWs || ip?.ipType == "IPv4" ? ip?.ipString : "-";
    return (
        <div className="flex flex-col items-center w-full h-full gap-[10px]">
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center justify-center cursor-pointer h-11 w-11" onClick={p.onBack}>
                    <FiChevronLeft className="text-2xl" />
                </div>
            </div>
            <Avatar name={ac.userInfo?.email} size={66} className="mt-9" variant="marble" />
            <span>{ac.userInfo?.email || ""}</span>
            <div className="flex flex-col gap-[10px] w-full px-[25px] mt-2.5">
                <div className="bg-[#F5F5F5] w-full flex px-5 py-3 rounded-lg justify-between">
                    <span className="text-[#000000]">Node IP: </span>
                    <span className="text-sm text-[#999999]">{nodeIP}</span>
                </div>
                <button className="text-base font-medium btn" onClick={() => chrome.tabs.create({ url: HOME_BASE })}>
                    About EnReach
                </button>
                <div className="px-6 flex items-center justify-between text-base">
                    <div className="flex items-center gap-[15px]">
                        <FaXTwitter className="cursor-pointer hover:text-primary" onClick={goToFollowX} />
                        <FaDiscord className="cursor-pointer hover:text-primary" onClick={() => goToJoinDiscord} />
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
            <GoToDashboard className="mt-auto" />
        </div>
    );
}
export const Home: React.FC = () => {
    const [showUser, setShowUser] = useState(false);
    return showUser ? <UserUI onBack={() => setShowUser(false)} /> : <HomeUI onClickUser={() => setShowUser(true)} />;
};
