import React from "react";
import jump from "url:~assets/IconJump.png";


export const Buttom: React.FC = ({ wrapper }: any) => {
    const handleDashboard = async (e: React.FormEvent) => {
        e.preventDefault();
        chrome.tabs.create({ url: "http://localhost:3001/dashboard" });
    };

    return (
        <div className={` text-center cursor-pointer flex items-center p-[5px] ${wrapper} `} onClick={handleDashboard}>
            Go to Mining Dashboard <img src={jump} alt='jump' />
        </div>
    );
};
