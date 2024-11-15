import React from "react";

import { useAuthContext } from "./AuthContext";
import { Home } from "./Home";
import { Login } from "./Login";
import { Providers } from "./Providers";
import { Connection } from "./Connection";
import { Header } from "./Header";

function AppImpl() {
    const { isAuthenticated } = useAuthContext();

    // return isAuthenticated ? <Home /> : <Login />;
    return <Login />;
    // return <Home />
}
export const App: React.FC = () => {
    return (
        <Providers>
            <AppImpl />
        </Providers>
    );
};
