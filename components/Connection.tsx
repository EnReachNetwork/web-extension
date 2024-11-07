import React from "react";
import { FiCheck } from "react-icons/fi";

import useLocalStorage from "~hooks/useLocalStorage";

import { KEYS } from "../constants";
import { useAuthContext } from "./AuthContext";
import ConAnim from "./ConAnim";

export const Connection: React.FC = () => {
    const { userInfo, logoutUser } = useAuthContext();
    const [connecting, _setConnecting] = useLocalStorage<boolean>(KEYS.CONNECTING, false);
    const [connected, _setConnected] = useLocalStorage<boolean>(KEYS.CONNECTED, false);
    const [connectErr, _setConnectErr] = useLocalStorage<boolean>(KEYS.CONNECT_ERR, false);

    const setConnect = () => {
        if (!connected && !connecting) {
            _setConnecting(true);
        } else if (connecting && !connected) {
            _setConnecting(false);
            _setConnected(true);
        } else {
            _setConnected(false);
            _setConnecting(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-5">
            <ConAnim isConnected={connected} isConnecting={connecting} onClick={setConnect} />
            <p className="text-center">
                {connected ? "EnReach.AI Accelerating Network Connected" : "Click Connect button to start your EnReach.AI journey."}
                {connected && <FiCheck className="inline-block text-green-500 ml-1" />}
            </p>
        </div>
    );
};
