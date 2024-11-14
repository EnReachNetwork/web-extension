import React, { useEffect, useState } from "react";
import { FiCheck } from "react-icons/fi";

import useLocalStorage from "~hooks/useLocalStorage";

import { KEYS, StatusConnect, StatusConnectList } from "../constants";
import { useAuthContext } from "./AuthContext";
import ConAnim from "./ConAnim";
import SuccessConnected from "./SuccessConnnected";



export const Connection: React.FC = () => {
    const { userInfo, logoutUser } = useAuthContext();
    const [status, setStatusConnect] = useLocalStorage<StatusConnect>(KEYS.STATUS_CONNECT, "successConnected");

    const setConnect = () => {
        let nexti = StatusConnectList.findIndex((item) => item == status) + 1;
        if (nexti >= StatusConnectList.length) {
            nexti = 0;
        }
        console.log('adasdasdsa', StatusConnectList[nexti]);

        setStatusConnect(StatusConnectList[nexti]);
    };


    const connected = status == "connected";



    useEffect(() => {
        if (connected) {
            setTimeout(() => {
                setStatusConnect('successConnected')
            }, 2000);
        }

    }, [connected])


    console.log('connectedconnected', status);


    return (
        <div className="flex flex-col justify-between w-full h-full mt-[-20px]">
            <div>
                <div className="flex flex-col items-center gap-5 ">
                    <ConAnim status={status} onClick={setConnect} />
                    {status !== "error" && status !== 'successConnected' && (
                        <p className="text-center mx-[61px]">
                            {connected ? "EnReach.AI Accelerating Network Connected" : "Click Connect button to start your EnReach.AI journey."}
                            {connected && <FiCheck className="inline-block ml-1 text-green-500" />}
                        </p>
                    )}
                    {status == "error" && <p className="text-center text-red-500">Connect failed. Please try again.</p>}



                </div>
                {status === 'successConnected' && <SuccessConnected />}


            </div>

            {status !== 'successConnected' && <div className="mx-[30px] flex flex-col gap-[10px]">
                {!connected && <button className="mt-auto btn " onClick={setConnect}>
                    Connect EnReach.AI
                </button>
                }

            </div>}

        </div>
    );
};
