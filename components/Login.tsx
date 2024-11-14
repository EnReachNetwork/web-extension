import React from "react";

import { imgLogo } from "~constants";

export const Login = () => {
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        chrome.tabs.create({ url: "http://localhost:3001" });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        chrome.tabs.create({ url: "http://localhost:3001" });
    };
    return (
        <div className="flex flex-col w-full h-full p-[30px] logo_bg">
            <img src={imgLogo} className="h-[95px] mt-[50px]" alt={"logo"} />
            <button className="mt-auto btn" onClick={handleLogin}>
                Sign In to EnReach.AI
            </button>
            <div className="mt-[10px] text-xs flex justify-center items-center ">
                Don't have an account? Go{" "}
                <div className="mx-1 underline decoration-black underline-offset-4" onClick={handleRegister}>
                    register
                </div>
                with email
            </div>
        </div>
    );
};
