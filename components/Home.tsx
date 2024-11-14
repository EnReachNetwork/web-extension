import React, { MouseEventHandler, useState } from "react";
import { FiChevronLeft } from "react-icons/fi";
import { Buttom } from "./Buttom";
import { Connection } from "./Connection";
import { Header } from "./Header";
import userDefaultLogo from "url:~assets/IconuserDefaultLogo.png";
import x from "url:~assets/IconX.png";
import discord from "url:~assets/IconDiscord.png";


function HomeUI(p: { onClickUser: MouseEventHandler<any> }) {
    return (
        <div className="flex flex-col items-center w-full h-full gap-[15px]">
            <Header onClickUser={p.onClickUser} />
            <Connection />
            <Buttom />
        </div>
    );
}

function UserUI(p: { onBack: MouseEventHandler<any> }) {
    return (
        <div className="flex flex-col items-center w-full h-full gap-5">
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center justify-center cursor-pointer h-11 w-11" onClick={p.onBack}>
                    <FiChevronLeft className="text-2xl" />
                </div>

            </div>
            <img src={userDefaultLogo} className=" h-[66px]" alt="logo" />
            <span>example@email.com</span>
            <div className="w-full ">
                <div className="bg-[#F5F5F5]  px-5 py-3  mx-[25px]">
                    <div className="flex justify-between text-[14px] font-normal leading-4 text-[#999999]">
                        <span className="text-[#000000]">Node IP：</span>
                        <span className="text-sm ">57.21.4.2</span>
                    </div>

                </div>
                <div className=" mx-[25px]">
                    <button className="text-base font-medium btn mt-[40px] ">
                        About EnReach.AI
                    </button>
                </div>
                <div className=" mx-[50px] mt-[14px] flex  items-center justify-between">
                    <span> Log Out</span>
                    <div className="flex items-center gap-[15px]">
                        <img src={x} />
                        <img src={discord} />
                    </div>

                </div>

            </div>
            <div className="absolute bottom-5 ">
                <Buttom></Buttom>
            </div>
        </div>
    );
}
export const Home: React.FC = () => {
    const [showUser, setShowUser] = useState(false);
    return showUser ? <UserUI onBack={() => setShowUser(false)} /> : <HomeUI onClickUser={() => setShowUser(true)} />;
};
