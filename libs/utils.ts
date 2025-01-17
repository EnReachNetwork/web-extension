import { clsx, type ClassValue } from "clsx";
import _ from "lodash";
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

export async function retry<T>(fn: () => Promise<T> | T, { interval = 1000, count = Infinity }: { interval?: number; count?: number } = {}) {
    while (true) {
        try {
            return await fn();
        } catch (error) {
            console.error("retry", count, error);
            if (count <= 1) {
                throw error;
            }
        }
        count--;
        await sleep(interval);
    }
}
