import React from "react";
import jump from "url:~assets/IconJump.png";

import { cn } from "~libs/utils";

export function GoToDashboard({ className }: { className?: string }) {
    const handleDashboard = async (e: React.FormEvent) => {
        e.preventDefault();
        chrome.tabs.create({ url: "http://localhost:3001/dashboard" });
    };

    return (
        <div className={cn(` text-center cursor-pointer flex items-center p-[5px] mb-[30px]`, className)} onClick={handleDashboard}>
            Go to Mining Dashboard <img src={jump} alt="jump" />
        </div>
    );
}
