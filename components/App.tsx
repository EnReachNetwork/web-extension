import React from "react";

import { useAuthContext } from "./AuthContext";
import { Home } from "./Home";
import { Login } from "./Login";
import { Providers } from "./Providers";

function AppImpl() {
    const { isAuthenticated } = useAuthContext();

    // return isAuthenticated ? <Home /> : <Login />;
    // return <Home />;
    return <Login />;
}
export const App: React.FC = () => {
    return (
        <Providers>
            <AppImpl />
        </Providers>
    );
};
