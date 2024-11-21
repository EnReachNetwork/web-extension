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
        if (!userInfo && accessToken) {
            Api.get<RES<User>>("/api/user/profile").then((res) => setUserInfo(res.data.data));
        }
        if (userInfo) genNodeId(userInfo);
    }, [accessToken, userInfo]);
    return (
        <AuthContext.Provider
            value={{
                userInfo: userInfo,
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
