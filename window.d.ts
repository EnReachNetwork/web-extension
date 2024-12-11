// Optional, this is just an example of extending the window object for fun and profit. Change it however you want for your own interface
interface Window {
    __EnReachExt: {
        beta?: {
            name: string;
            request: (msg: any) => Promise<any>;
        };
        staging?: {
            name: string;
            request: (msg: any) => Promise<any>;
        };
        prod?: {
            name: string;
            request: (msg: any) => Promise<any>;
        };
    };
}
