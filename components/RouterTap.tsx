import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { KEYS } from "~constants";
import { useCopy } from "~hooks/useCopy";
import { cn } from "~libs/utils";
import { useAuthContext } from "./AuthContext";
import { AutoFlip } from "./auto-flip";
import { HeaderBack } from "./Headers";
import { useStoreItem } from "./Store";
import { AnimOnTap, AnimTaping, AnimTapSleep } from "./Anims";

function useTapStat() {
    const ac = useAuthContext();
    const [ipFromWs] = useStoreItem<string>(KEYS.IP_FROM_WS);
    return useQuery<{ hasOnTap: boolean, canTap: boolean, showType: 'tap' | 'ontap' | 'sleep' }>({
        queryKey: ['QueryTapStat', ac.userInfo.id, ipFromWs],
        initialData: { hasOnTap: false, canTap: false, showType: 'sleep' },
        queryFn: async () => {
            const hasOnTap = false
            const canTap = true;
            return { hasOnTap, canTap, showType: hasOnTap ? 'ontap' : canTap ? 'tap' : 'sleep' }
        }
    })
}

export function Tap() {
    const ts = useTapStat()
    const [isTaping, setIsTaping] = useStoreItem<boolean>(KEYS.IS_TAPING)
    const copy = useCopy();
    const onClickCheck = () => {

    }
    const onClickStart = () => {
        setIsTaping(true)
        setTimeout(() => {
            setIsTaping(false)
        }, 5000);
        chrome.runtime.sendMessage({
            target: 'offscreen',
            type: 'doTap',
            data: {
                userId: '1234',
                peerServer: 'localhost:4004'
            }
        })
    }
    return (
        <AutoFlip className="flex flex-col items-center w-full h-full gap-4">
            <HeaderBack type="user" />
            <div className="flip_item relative flex justify-center items-center w-[289px] h-[289px] mx-auto">
                <div className="absolute top-0 left-0 z-0 w-full h-full  rounded-full bg-[#434343]" />
                {ts.data.showType === 'tap' && <AnimTaping taping={isTaping} />}
                {ts.data.showType === 'sleep' && <AnimTapSleep />}
                {ts.data.showType === 'ontap' && <AnimOnTap />}
            </div>
            <div className="flip_item text-[15px] font-medium mx-4">
                {ts.data.showType === 'tap' && (isTaping ? 'Waiting...' : 'Go find your berry friend.')}
                {ts.data.showType === 'sleep' && 'Your berry is feeling good staying at home.'}
                {ts.data.showType === 'ontap' && 'Your berry found a new friend!'}
            </div>
            {ts.data.showType === 'tap' && !isTaping && <button className="flip_item text-sm font-medium btn2 w-[129px]" onClick={onClickStart}>Start</button>}
            {ts.data.showType === 'ontap' && <button className="flip_item text-sm font-medium btn2 w-[129px]" onClick={onClickCheck}>Check it out</button>}
        </AutoFlip>
    );
}


export function TapSprite() {
    const nav = useNavigate()
    const ts = useTapStat()
    return <div className={cn("flip_item absolute left-5 top-16 cursor-pointer h-11 bg-contain", {
        "w-10 tap-sprite1": ts.data.showType === 'tap',
        "w-11 tap-sprite2": ts.data.showType === 'sleep',
        "w-[49px] tap-sprite3": ts.data.showType === 'ontap',
    })} onClick={() => nav('/tap')} />
}