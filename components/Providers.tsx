import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";

import { AuthProvider } from "./AuthContext";

const qClient = new QueryClient();
export function Providers({ children }: PropsWithChildren) {
    return (
        <QueryClientProvider client={qClient}>
            <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
    );
}
