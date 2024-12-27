import React from "react";

import { DashboardBase, KEYS } from "~constants";
import { imgLogin, imgLogo } from "~libs/imgs";
import { storage } from "~libs/mstorage";

export const Login = () => {
    const handleLogin = async (e: React.FormEvent) => {
        storage.remove(KEYS.USER_LOGOUT);
        e.preventDefault();
        chrome.tabs.create({ url: DashboardBase });
    };

    const handleRegister = async (e: React.FormEvent) => {
        storage.remove(KEYS.USER_LOGOUT);
        e.preventDefault();
        chrome.tabs.create({ url: `${DashboardBase}/signup` });
    };
    return (
        <div className="flex flex-col flex-1 w-full h-full p-[18px] items-center">
            <div className="flex w-full rounded-[34px] bg-[#595959] p-6 flex-col items-center">
                <img src={imgLogo} className="h-[29px] -translate-y-2" alt={"logo"} />
                <img src={imgLogin} className="mt-8 mb-12 h-[195px] translate-x-3" alt="login" />
            </div>
            <div className="my-auto w-[170px]">
                <button className="mt-auto btn" onClick={handleLogin}>
                    Sign In
                </button>
                <div className="mt-[10px] text-xs text-[#8A8A8A] w-fit mx-auto text-center">
                    Don't have an account?
                    <br /> Go
                    <div className="inline-block mx-1 underline underline-offset-4 cursor-pointer hover:text-[#4281FF]" onClick={handleRegister}>
                        sign up
                    </div>
                    with email.
                </div>
            </div>
        </div>
    );
};
