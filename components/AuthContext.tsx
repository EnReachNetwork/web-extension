import React, { createContext, useContext, useEffect } from "react";

import { KEYS } from "~constants";
import useLocalStorage from "~hooks/useLocalStorage";
import Api from "~libs/apis";

interface AuthContextProps {
    isAuthenticated: boolean;
    userInfo: UserInfo;
    logoutUser: () => Promise<void>;
}

interface UserInfo {
    username: string;
    role: string;
}

export const AuthContext = createContext<AuthContextProps>({
    isAuthenticated: false,
    userInfo: { username: "", role: "" },
    logoutUser: async () => {},
});

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // const navigate = useNavigate();
    const [accessToken, setAccessToken] = useLocalStorage<string>(KEYS.ACCESS_TOKEN, "");
    const [isAuthenticated, setIsAuthenticated] = useLocalStorage<boolean>(KEYS.AUTHENTIC, false);

    const [userInfo, setUserInfo] = useLocalStorage<UserInfo>(KEYS.USER_INFO, { username: "", role: "" });
    const logoutUser = async () => {
        setAccessToken("");
        setIsAuthenticated(false);
        setUserInfo({ username: "", role: "" });
    };

    const configureApiAuthorization = (accessToken: string) => {
        if (accessToken) {
            Api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        }
    };

    useEffect(() => {
        if (accessToken) {
            configureApiAuthorization(accessToken);
            Api.get("/user/info").then((response) => {
                setUserInfo({
                    username: response.data.data.email,
                    role: response.data.data.role,
                });
                setIsAuthenticated(true);
            });
        }
    }, [accessToken]);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                userInfo,
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
