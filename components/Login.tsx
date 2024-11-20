import React from "react";

import { DashboardBase, imgLogo } from "~constants";

export const Login = () => {
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        chrome.tabs.create({ url: DashboardBase });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        chrome.tabs.create({ url: `${DashboardBase}/signup` });
    };
    return (
        <div className="flex flex-col flex-1 w-full h-full p-[30px] logo_bg">
            <img src={imgLogo} className="h-[95px] mt-[50px]" alt={"logo"} />
            <button className="mt-auto btn" onClick={handleLogin}>
                Sign In to EnReach.AI
            </button>
            <div className="mt-[10px] text-xs flex justify-center items-center ">
                Don't have an account? Go{" "}
                <div className="mx-1 underline underline-offset-4 cursor-pointer hover:text-[#4281FF]" onClick={handleRegister}>
                    sign up
                </div>
                with email
            </div>
        </div>
    );
};
