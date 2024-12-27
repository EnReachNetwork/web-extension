import React from "react";
import { FaSquareArrowUpRight } from "react-icons/fa6";

import { DashboardBase } from "~constants";
import { cn } from "~libs/utils";

export function GoToDashboard({ className }: { className?: string }) {
    const handleDashboard = async (e: React.FormEvent) => {
        e.preventDefault();
        chrome.tabs.create({ url: DashboardBase });
    };

    return (
        <div
            className={cn(`select-none text-center font-semibold text-xs text-[#8A8A8A] cursor-pointer flex items-center gap-2.5 hover:text-primary`, className)}
            onClick={handleDashboard}
        >
            Go to Mining Dashboard <FaSquareArrowUpRight className="text-base" />
        </div>
    );
}
