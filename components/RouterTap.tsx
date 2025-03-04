import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router";
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
    const tapSuccess = Boolean(tapStat) && tapStat.stat === 'success'
    const isTaping = Boolean(tapStat) && tapStat.stat === 'taping'
    const isOnTap = taps.length || tapRemain?.hasUnRead

    return {
        showType: !Boolean(tapRemain) ? '' : isTaping ? 'taping' : (tapSuccess || isOnTap) ? 'ontap' : tapRemain?.remain <= 0 ? 'sleep' : 'tap',
        isOnTap,
        isTaping,
        taps,
        msg: tapStat?.msg,
        todaySuccess: tapRemain?.success || 0,
        setTapStat: (ts: Partial<TapStat>) => setTapStat({ ...(tapStat || { stat: null, msg: '', lastSuccessTime: 0 }), ...ts }),
        setTaps
    }
}

export function Tap() {
    const ts = useTapStat()
    const [user] = useStoreItem<User>(KEYS.USER_INFO)
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
                {ts.showType === 'tap' && <AnimTaping />}
                {ts.showType === 'taping' && <AnimTaping taping />}
                {ts.showType === 'sleep' && <AnimTapSleep />}
                {ts.showType === 'ontap' && <AnimOnTap />}
            </div>
            <div className="flip_item text-[15px] font-medium mx-4 text-center whitespace-pre-wrap mt-4">
                {ts.showType === 'tap' && (ts.msg || 'Go find your Buddy！！')}
                {ts.showType === 'taping' && (ts.msg || 'Waiting...')}
                {ts.showType === 'sleep' && (ts.todaySuccess >= 3 ? "Enough Berry Buddies for today. Try tomorrow!" : 'Get one more Like on your album and you can have one extra Berry Friend fo today.')}
                {ts.showType === 'ontap' && 'Your berry found a new friend!'}
            </div>
            {ts.showType === 'tap' && <button className="flip_item text-sm font-medium btn2 w-[129px]" onClick={onClickStart}>Start</button>}
            {ts.showType === 'ontap' && <button className="flip_item text-sm font-medium btn2 w-[129px]" onClick={() => {
                ts.setTapStat({ stat: null })
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
        "w-10 tap-sprite1": ts.showType === 'tap' || ts.showType == 'taping',
        "w-11 tap-sprite2": ts.showType === 'sleep',
        "w-[49px] tap-sprite3": ts.showType === 'ontap',
    })} onClick={() => Boolean(ts.showType) && nav('/tap')} />
}