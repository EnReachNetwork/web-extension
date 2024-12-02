import React from "react";
import { FiArrowUpRight } from "react-icons/fi";

import { DashboardBase } from "~constants";
import { cn } from "~libs/utils";

export function GoToDashboard({ className }: { className?: string }) {
    const handleDashboard = async (e: React.FormEvent) => {
        e.preventDefault();
        chrome.tabs.create({ url: DashboardBase });
    };

    return (
        <div className={cn(` text-center cursor-pointer text-sm flex items-center gap-2.5 p-[5px] mb-[30px] hover:text-primary`, className)} onClick={handleDashboard}>
            Go to Mining Dashboard <FiArrowUpRight className="text-base"/>
        </div>
    );
}
