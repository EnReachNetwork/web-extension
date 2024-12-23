import React from "react";
import { Toaster } from "sonner";

import { useAuthContext } from "./AuthContext";
import { Home } from "./Home";
import { Login } from "./Login";
import { Providers } from "./Providers";

function AppImpl() {
    const { userInfo } = useAuthContext();
    // return <Login/>
    return userInfo ? <Home /> : <Login />;
}
export const App: React.FC = () => {
    return (
        <Providers>
            <Toaster position="top-center" offset={60} theme="light" style={
                // @ts-ignore
                { '--width': '180px', '--mobile-offset': '50px' }
            } toastOptions={{
                classNames: { 'toast': "rounded-xl bg-[#585858] border border-solid border-white/10 text-white/60 text-xs px-4 py-2" }
            }} />
            <AppImpl />
        </Providers>
    );
};
