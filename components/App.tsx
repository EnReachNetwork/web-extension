import React from "react";
import { Toaster } from "sonner";

import { useAuthContext } from "./AuthContext";
import { Home } from "./Home";
import { Login } from "./Login";
import { Providers } from "./Providers";

function AppImpl() {
    const { userInfo } = useAuthContext();

    return userInfo ? <Home /> : <Login />;
}
export const App: React.FC = () => {
    return (
        <Providers>
            <Toaster position="top-center" offset={50} theme="light" />
            <AppImpl />
        </Providers>
    );
};
