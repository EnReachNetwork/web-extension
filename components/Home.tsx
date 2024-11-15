import Avatar from "boring-avatars";
import React, { MouseEventHandler, useState } from "react";
import { FiChevronLeft } from "react-icons/fi";
import discord from "url:~assets/IconDiscord.png";
import x from "url:~assets/IconX.png";

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
    return (
        <div className="flex flex-col items-center w-full h-full gap-[10px]">
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center justify-center cursor-pointer h-11 w-11" onClick={p.onBack}>
                    <FiChevronLeft className="text-2xl" />
                </div>
            </div>
            <Avatar name="example@email.com" size={66} className="mt-9" variant="beam" />
            <span>example@email.com</span>
            <div className="flex flex-col gap-[10px] w-full px-[25px] mt-2.5">
                <div className="bg-[#F5F5F5] w-full px-5 py-3 rounded-lg justify-between">
                    <span className="text-[#000000]">Node IP：</span>
                    <span className="text-sm text-[#999999]">57.21.4.2</span>
                </div>
                <button className="text-base font-medium btn ">About EnReach.AI</button>
                <div className="px-6 flex items-center justify-between">
                    <span> Log Out</span>
                    <div className="flex items-center gap-[15px]">
                        <img src={x} />
                        <img src={discord} />
                    </div>
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
