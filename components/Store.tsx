import _ from "lodash";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect } from "react";
import { useSetState } from "react-use";

import { StorageCallbackMap } from "@plasmohq/storage";

import { KEYS, KEYSType } from "~constants";
import { storage } from "~libs/mstorage";

export type Store = {
    inited: boolean;
    setStore: (patch: Partial<Store> | ((s: Store) => Partial<Store>)) => void;
};
const StoreCtx = createContext<Store>({ inited: false, setStore: () => {} });

export function StoreProvider(props: PropsWithChildren) {
    const [store, setStore] = useSetState<Omit<Store, "setStore">>({ inited: false });
    useEffect(() => {
        const keys = _.values(KEYS);
        storage
            .getMany(keys)
            .then((data) => {
                console.info("getAll:", data);
                setStore({ ...data, inited: true });
            })
            .catch((e) => setStore({ inited: true }));
        const watchmap: StorageCallbackMap = {};
        keys.forEach((key) => {
            watchmap[key] = (state) => setStore({ [key]: state.newValue });
        });
        storage.watch(watchmap);
        return () => {
            storage.unwatch(watchmap);
        };
    }, []);
    return <StoreCtx.Provider value={{ ...store, setStore }}>{store.inited && props.children}</StoreCtx.Provider>;
}

export function useStoreItem<T = string>(key: KEYSType, def?: T) {
    const store = useContext(StoreCtx);
    const setItem = useCallback(
        (data: T) => {
            storage.set(key, data);
            store.setStore({ [key]: data });
        },
        [store.setStore],
    );
    return [(store[key] || def) as T, setItem] as [T, (data: T) => void];
}
