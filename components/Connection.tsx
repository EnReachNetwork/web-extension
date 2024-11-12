import React from "react";
import { FiCheck } from "react-icons/fi";

import useLocalStorage from "~hooks/useLocalStorage";

import { KEYS, StatusConnect, StatusConnectList } from "../constants";
import { useAuthContext } from "./AuthContext";
import ConAnim from "./ConAnim";

export const Connection: React.FC = () => {
    const { userInfo, logoutUser } = useAuthContext();
    const [status, setStatusConnect] = useLocalStorage<StatusConnect>(KEYS.STATUS_CONNECT, "idle");

    const setConnect = () => {
        let nexti = StatusConnectList.findIndex((item) => item == status) + 1;
        if (nexti >= StatusConnectList.length) {
            nexti = 0;
        }
        setStatusConnect(StatusConnectList[nexti]);
    };
    const connected = status == "connected";
    return (
        <div className="flex flex-col items-center gap-5">
            <ConAnim status={status} onClick={setConnect} />
            {status !== "error" && (
                <p className="text-center">
                    {connected ? "EnReach.AI Accelerating Network Connected" : "Click Connect button to start your EnReach.AI journey."}
                    {connected && <FiCheck className="inline-block text-green-500 ml-1" />}
                </p>
            )}
            {status == "error" && <p className="text-center text-red-500">Connect failed. Please try again.</p>}
        </div>
    );
};
