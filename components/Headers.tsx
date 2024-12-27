import { FiChevronLeft } from "react-icons/fi";
import { TbLogout } from "react-icons/tb";
import { useNavigate } from "react-router";
import { useAuthContext } from "./AuthContext";
import Avatar from "boring-avatars";
import { imgLogo } from "~libs/imgs";
import { cn } from "~libs/utils";

export function HeaderBack({ type }: { type: 'user' | 'logout' }) {
    const nav = useNavigate()
    const ac = useAuthContext()
    return <div className="flip_item flex items-center justify-between w-full p-4">
        <div className="flex items-center justify-center cursor-pointer h-10 w-10 hover:text-primary" onClick={() => nav(-1)}>
            <FiChevronLeft className="text-2xl" />
        </div>
        {type == 'logout' && <div className="flex items-center justify-center cursor-pointer h-10 w-10" onClick={ac.logoutUser}>
            <TbLogout className="text-xl text-[#C64C4C]" />
        </div>}
        {type == 'user' && <div className="flex items-center justify-center cursor-pointer h-10 w-10" onClick={() => nav('/user')}>
            <Avatar size={40} name={ac.userInfo?.email} variant="marble" />
        </div>}
    </div>
}


export function HeaderLogo({ className }: { className?: string }) {
    const nav = useNavigate()
    const ac = useAuthContext()
    return <div className={cn("flip_item w-full flex items-start justify-between mb-6", className)}>
        <img src={imgLogo} className="h-[29px]" alt={"logo"} />
        <Avatar name={ac.userInfo?.email} size={40} className="cursor-pointer" variant="marble" onClick={() => nav('/user')} />
    </div>
}