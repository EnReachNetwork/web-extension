import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export async function runLoop(name: string, fn: () => any, interval: number) {
    while (true) {
        try {
            fn();
        } catch (error) {
            console.error("runLoop", name, error);
        }
        await new Promise((reslove) => setTimeout(reslove, interval));
    }
}
