import Avatar from "boring-avatars";
import { PiCopySimple } from "react-icons/pi";
import { RiDiscordFill, RiTelegram2Fill, RiTwitterXFill } from "react-icons/ri";
import { DashboardBase, KEYS } from "~constants";
import { useCopy } from "~hooks/useCopy";
import { goToFollowX, goToGuide, goToJoinDiscord, goToTelegram, goToWebsite } from "~libs/handlers";
import { IPData } from "~libs/type";
import { User } from "~libs/user";
import { useAuthContext } from "./AuthContext";
import { AutoFlip } from "./auto-flip";
import { GoToDashboard } from "./Footers";
import { HeaderBack } from "./Headers";
import { useStoreItem } from "./Store";

export function User() {
    const ac = useAuthContext();
    const [ip] = useStoreItem<IPData>(KEYS.IP_DATA);
    const [ipFromWs] = useStoreItem<string>(KEYS.IP_FROM_WS);
    const nodeIP = ipFromWs || ip?.ipString || "-";
    const [userInfo] = useStoreItem<User | undefined>(KEYS.USER_INFO);
    const copy = useCopy();
    const onCopyReferral = () => copy(`${DashboardBase}/signup?referral=${userInfo?.inviteCode}`);
    const socialClassName = "flex justify-center items-center w-8 h-8 border border-white rounded-full cursor-pointer text-xl hover:text-primary hover:border-primary";
    const linkClassName = "inline-block mx-1 underline underline-offset-4 cursor-pointer hover:text-[#4281FF]";
    return (
        <AutoFlip className="flex flex-col items-center w-full h-full gap-4">
            <HeaderBack type="logout" />
            <div className="flip_item mt-7">
                <Avatar name={ac.userInfo?.email} size={50} variant="marble" />
            </div>
            <div className="flip_item items-center text-[#8A8A8A] text-sm text-center whitespace-nowrap">
                <div className="">{ac.userInfo?.email || ""}</div>
                <div className="font-bold mt-7">Node IP</div>
                <div className="mt-2">{nodeIP}</div>
            </div>
            <div className="flip_item flex items-center justify-center gap-1 mt-6">
                <button className="text-sm font-medium btn2 w-[129px] !cursor-default">Referral Link</button>
                <div className="w-[41px] h-[41px] rounded-full bg-primary hover:bg-white/15 flex justify-center items-center cursor-pointer" onClick={onCopyReferral}>
                    <PiCopySimple className="rotate-90 text-base" />
                </div>
            </div>
            <div className="flip_item flex justify-center items-center gap-5 text-white mt-6">
                <div className={socialClassName} onClick={goToFollowX}>
                    <RiTwitterXFill />
                </div>
                <div className={socialClassName} onClick={goToJoinDiscord}>
                    <RiDiscordFill />
                </div>
                <div className={socialClassName} onClick={goToTelegram}>
                    <RiTelegram2Fill />
                </div>
            </div>
            <div className="flip_item flex items-center mt-auto text-[#8A8A8A] gap-9 text-xs">
                <div className={linkClassName} onClick={goToWebsite}>
                    Website
                </div>
                <div className={linkClassName} onClick={goToGuide}>
                    Guide
                </div>
            </div>
            <GoToDashboard className="flip_item mb-[36px]" />
        </AutoFlip>
    );
}