import { useEffect, useState } from "react";

import { StorageCallbackMap } from "@plasmohq/storage";

import { storage } from "~libs/mstorage";

function useLocalStorage<T>(key: string, initialValue?: T) {
    const [storedValue, setStoredValue] = useState<T | undefined>(initialValue);

    useEffect(() => {
        getValue();
        const watchMap: StorageCallbackMap = {
            [key]: (change) => setStoredValue(change.newValue),
        };
        storage.watch(watchMap);
        return () => {
            storage.unwatch(watchMap);
        };
    }, [key]);
    
    const getValue = async () => {
        const result = await storage.get<T>(key);
        console.info("useLocalStorage,getVaule,", key, result);
        setStoredValue(result || initialValue);
    };

    const setValue = (value?: T) => {
        setStoredValue(value);
        storage.set(key, JSON.stringify(value));
    };
    return [storedValue, setValue] as const;
}

export default useLocalStorage;
