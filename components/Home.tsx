import React, { MouseEventHandler, useState } from "react";
import { FiChevronLeft } from "react-icons/fi";

import { imgLogo } from "~constants";

import { Buttom } from "./Buttom";
import { Connection } from "./Connection";
import { Header } from "./Header";

function HomeUI(p: { onClickUser: MouseEventHandler<HTMLElement> }) {
    return (
        <div className="flex flex-col items-center w-full h-full gap-5">
            <Header onClickUser={p.onClickUser} />
            <Connection />
            <Buttom />
        </div>
    );
}

function UserUI(p: { onBack: MouseEventHandler<HTMLElement> }) {
    return (
        <div className="flex flex-col items-center w-full h-full gap-5">
            <div className="flex items-center justify-between w-full">
                <div className="h-11 w-11 flex justify-center items-center cursor-pointer" onClick={p.onBack}>
                    <FiChevronLeft className="text-2xl" />
                </div>
                <img src={imgLogo} className="h-11" alt="logo" />
            </div>
        </div>
    );
}
export const Home: React.FC = () => {
    const [showUser, setShowUser] = useState(false);
    return showUser ? <UserUI onBack={() => setShowUser(false)} /> : <HomeUI onClickUser={() => setShowUser(true)} />;
};
