import React from "react";
import { FiArrowUpRight } from "react-icons/fi";

export const Buttom: React.FC = () => {
    const handleDashboard = async (e: React.FormEvent) => {
        e.preventDefault();
        chrome.tabs.create({ url: "http://localhost:3001/dashboard" });
    };

    return (
        <div className="text-primary mt-auto mb-[10px] text-center cursor-pointer" onClick={handleDashboard}>
            Go to Mining Dashboard <FiArrowUpRight className="inline-block align-middle" />
        </div>
    );
};
