import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useInterval } from "react-use";
import { KEYS } from "~constants";
import Api from "~libs/apis";
import { goToAlbum } from "~libs/handlers";
import { OnTap, RES, TapStat } from "~libs/type";
import { User } from "~libs/user";
import { cn } from "~libs/utils";
import { AnimOnTap, AnimTaping, AnimTapSleep } from "./Anims";
import { useAuthContext } from "./AuthContext";
import { AutoFlip } from "./auto-flip";
import { HeaderBack } from "./Headers";
import { useStoreItem } from "./Store";

function useTapStat() {
    const ac = useAuthContext();
    const [tapStat, setTapStat] = useStoreItem<TapStat>(KEYS.TAP_STAT, null)
    const [taps, setTaps] = useStoreItem<OnTap>(KEYS.ON_TAP, [])
    const [ctime, setCTime] = useState(new Date().getTime())
    const { data: tapRemain, refetch } = useQuery({
        enabled: Boolean(ac.userInfo),
        queryKey: ['querytapRemin', ac.userInfo?.id],
        structuralSharing: true,
        queryFn: async () => {
            const tapRemain = await Api.get<RES<{ success: number, remain: number }>>(`/api/extension/tap/remain`).then(item => item.data.data)
            const unReadTap = await Api.get<RES<{ hasUnRead: boolean }>>(`/api/extension/tap/unread`).then(item => item.data.data)
            return { ...tapRemain, ...unReadTap }
        }
    })
    useEffect(() => {
        refetch()
    }, [tapStat?.stat])
    
    useInterval(() => {
        setCTime(new Date().getTime())
    }, 1000)

    const isSleep = tapRemain?.remain == 0 || (Boolean(tapStat) && tapStat.stat === 'success' && ((ctime - tapStat.lastSuccessTime) < 10000))

    return {
        showType: !Boolean(tapRemain) ? '' : taps.length || tapRemain.hasUnRead ? 'ontap' : isSleep ? 'sleep' : 'tap',
        isTaping: Boolean(tapStat) && tapStat.stat === 'taping',
        taps,
        msg: tapStat?.msg,
        setTapStat,
        setTaps
    }
}

export function Tap() {
    const ts = useTapStat()
    const [user] = useStoreItem<User>(KEYS.USER_INFO)
    const isTaping = ts.isTaping;
    const onClickStart = () => {
        if (ts.showType === "taping" || !user) return;
        chrome.runtime.sendMessage({
            target: 'offscreen',
            type: 'doTap',
            data: {
                userId: user.id,
            }
        })
    }
    return (
        <AutoFlip className="flex flex-col items-center w-full h-full gap-4">
            <HeaderBack type="user" />
            <div className="flip_item relative flex justify-center items-center w-[289px] h-[289px] mx-auto">
                <div className="absolute top-0 left-0 z-0 w-full h-full  rounded-full bg-[#434343]" />
                {ts.showType === 'tap' && <AnimTaping taping={isTaping} />}
                {ts.showType === 'sleep' && <AnimTapSleep />}
                {ts.showType === 'ontap' && <AnimOnTap />}
            </div>
            <div className="flip_item text-[15px] font-medium mx-4 text-center whitespace-pre-wrap mt-4">
                {ts.showType === 'tap' && (isTaping ? ts.msg || 'Waiting...' : 'Go find your Buddy！！')}
                {ts.showType === 'sleep' && 'Your berry is feeling good staying at home.'}
                {ts.showType === 'ontap' && 'Your berry found a new friend!'}
            </div>
            {ts.showType === 'tap' && !isTaping && <button className="flip_item text-sm font-medium btn2 w-[129px]" onClick={onClickStart}>Start</button>}
            {ts.showType === 'ontap' && <button className="flip_item text-sm font-medium btn2 w-[129px]" onClick={() => {
                ts.setTaps([])
                goToAlbum()
            }}>Check it out</button>}
        </AutoFlip>
    );
}


export function TapSprite() {
    const nav = useNavigate()
    const ts = useTapStat()
    return <div className={cn("flip_item absolute left-5 top-16 cursor-pointer h-11 bg-contain bg-transparent", {
        "w-10 tap-sprite1": ts.showType === 'tap',
        "w-11 tap-sprite2": ts.showType === 'sleep',
        "w-[49px] tap-sprite3": ts.showType === 'ontap',
    })} onClick={() => Boolean(ts.showType) && nav('/tap')} />
}