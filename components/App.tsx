import React, { useEffect } from "react";
import { Toaster } from "sonner";

import { useAuthContext } from "./AuthContext";
import { Home } from "./RouterHome";
import { Login } from "./RouterLogin";
import { Providers } from "./Providers";
import { MemoryRouter, Routes, Route, useNavigate, useResolvedPath, useLocation, } from "react-router";
import { User } from "./RouterUser";
import { Tap } from "./RouterTap";


function AutoNavForUser() {
    const nav = useNavigate()
    const { userInfo } = useAuthContext();
    const { pathname } = useLocation()
    useEffect(() => {
        console.info('hhh:', pathname, !!userInfo)
        if (userInfo && ['/', '/login'].includes(pathname)) {
            nav("/home")
        } else if (!userInfo && pathname !== '/login') {
            nav("/login")
        }
    }, [pathname, userInfo])
    return null
}
function AppImpl() {
    return <MemoryRouter>
        <AutoNavForUser />
        <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/user" element={<User />} />
            <Route path="/tap" element={<Tap />} />
        </Routes>
    </MemoryRouter>
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
