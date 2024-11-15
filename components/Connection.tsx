import React, { useEffect } from "react";
import { FiCheck } from "react-icons/fi";
import berry from "url:~assets/IconBerry.png";
import rocket from "url:~assets/IconRocket.png";

import useLocalStorage from "~hooks/useLocalStorage";

import { KEYS, StatusConnect, StatusConnectList } from "../constants";
import { useAuthContext } from "./AuthContext";
import ConAnim from "./ConAnim";

export const Connection: React.FC = () => {
    const { userInfo, logoutUser } = useAuthContext();
    const [status, setStatusConnect] = useLocalStorage<StatusConnect>(KEYS.STATUS_CONNECT, "connecting");

    const setConnect = () => {
        let nexti = StatusConnectList.findIndex((item) => item == status) + 1;
        if (nexti >= StatusConnectList.length) {
            nexti = 1;
        }
        setStatusConnect(StatusConnectList[nexti]);
    };
    useEffect(() => {
        if (status == "connecting") {
            setTimeout(() => {
                setStatusConnect("connected");
            }, 2000);
        }
    }, [status]);
    return (
        <div className="flex flex-col items-center w-full flex-1 px-[25px] gap-[10px]">
            <ConAnim status={status} onClick={setConnect} />
            {status === "connected" ? (
                <p className="text-center text-xs">
                    {"You are connected to the EnReach Network"}
                    <FiCheck className="inline-block ml-1 text-green-500" />
                </p>
            ) : (
                <p className="text-center text-xs">Connecting...</p>
            )}
            {status === "connected" && (
                <>
                    <div className="flex bg-[#F5F5F5] w-full items-center justify-between px-5 py-3 text-sm rounded-lg">
                        <span className="font-normal leading-4 ">Network Quality:</span>
                        <span className="font-bold leading-4 text-[#4281FF] ">50%</span>
                    </div>

                    <div className="bg-[#F5F5F5] w-full  px-5 py-3 rounded-lg">
                        <div className="flex justify-between text-[10px] font-normal leading-3 text-[#999999]">
                            <span>Accumulated Rewards</span>
                            <span>Extra Boost</span>
                        </div>
                        <div className="flex justify-between font-bold leading-5 text-5 mt-[10px]">
                            <div className="flex items-center gap-[10px]">
                                <span className="">35.42</span>
                                <img src={berry} alt="berry" />
                            </div>
                            <div className="flex items-center gap-[10px]">
                                <span className="">1.5x</span>
                                <img src={rocket} alt="rocket" />
                            </div>
                        </div>

                        <div className="flex justify-between text-[10px] font-normal leading-3 text-[#999999] mt-5">
                            <span>Berry Baby</span>
                            <span>Small Berry</span>
                        </div>
                        <div className="!w-full progress-bar my-[6px]">
                            <div className="progress" style={{ width: "30%" }}></div>
                        </div>
                        <div className="flex justify-between font-bold leading-5 text-5 ">
                            <div className="flex items-center gap-[10px]">
                                <span className="">36/100</span>
                                <span className="font-medium text-[10px] ">EXP</span>
                            </div>
                        </div>
                    </div>
                    <button className="text-base font-medium btn mt-auto">Copy Referral Link</button>
                </>
            )}
        </div>
    );
};
