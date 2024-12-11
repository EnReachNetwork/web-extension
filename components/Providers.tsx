import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";

import { AuthProvider } from "./AuthContext";
import { StoreProvider } from "./Store";

const qClient = new QueryClient();
export function Providers({ children }: PropsWithChildren) {
    return (
        <QueryClientProvider client={qClient}>
            <StoreProvider>
                <AuthProvider>{children}</AuthProvider>
            </StoreProvider>
        </QueryClientProvider>
    );
}
