import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export async function sleep(time: number) {
    await new Promise((reslove) => setTimeout(reslove, time));
}

export async function runLoop(name: string, fn: () => Promise<any> | any, interval: number) {
    while (true) {
        try {
            const re = fn();
            if (re.then) {
                await re;
            }
        } catch (error) {
            console.error("runLoop", name, error);
        }
        await sleep(interval);
    }
}


