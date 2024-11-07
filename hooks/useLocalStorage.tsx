import { useEffect, useState } from "react";

import { storage } from "~libs/mstorage";

function useLocalStorage<T>(key: string, initialValue?: T) {
    const [storedValue, setStoredValue] = useState<T | undefined>(initialValue);

    useEffect(() => {
        getValue();
        storage.watch({
            [key]: (change) => setStoredValue(change.newValue),
        });
    }, []);

    const parseValue = (value: string) => {
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    };

    const getValue = async () => {
        const result = await storage.getItem(key);
        console.info("useLocalStorage,getVaule,", key, result);
        setStoredValue(parseValue(result) || initialValue);
    };

    const setValue = (value?: T) => {
        setStoredValue(value);
        storage.setItem(key, JSON.stringify(value));
    };
    return [storedValue, setValue] as const;
}

export default useLocalStorage;
