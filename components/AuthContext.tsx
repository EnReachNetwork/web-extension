import { useQuery } from "@tanstack/react-query";
import React, { createContext, useContext, useEffect } from "react";

import { KEYS } from "~constants";
import useLocalStorage from "~hooks/useLocalStorage";
import Api, { configAuth } from "~libs/apis";
import { genNodeId } from "~libs/genNodeId";
import { storage } from "~libs/mstorage";
import { RES } from "~libs/type";
import { User } from "~libs/user";

interface AuthContextProps {
    userInfo?: User;
    logoutUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
    logoutUser: async () => {},
});

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [accessToken, setAccessToken] = useLocalStorage<string>(KEYS.ACCESS_TOKEN, "");
    const [userInfo, setUserInfo] = useLocalStorage<User>(KEYS.USER_INFO);
    const logoutUser = async () => {
        setAccessToken();
        setUserInfo();
        storage.set(KEYS.USER_LOGOUT, true);
    };
    configAuth(accessToken);
    useEffect(() => {
        if (userInfo) genNodeId(userInfo);
    }, [userInfo]);

    useQuery({
        queryKey: ["queryUserInfo", accessToken],
        enabled: !!accessToken,
        refetchInterval: 60 * 1000 * 2,
        queryFn: async () => {
            const res = await Api.get<RES<User>>("/api/user/profile");
            setUserInfo(res.data.data);
            return res.data.data;
        },
    });
    return (
        <AuthContext.Provider
            value={{
                userInfo: accessToken ? userInfo : undefined,
                logoutUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    return useContext(AuthContext);
};
