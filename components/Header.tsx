import Avatar from "boring-avatars";
import { MouseEventHandler } from "react";

import { imgLogo } from "~constants";

import { useAuthContext } from "./AuthContext";

export const Header = (p: { onClickUser: MouseEventHandler<any> }) => {
    const ac = useAuthContext();
    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center justify-between w-full pr-5 ">
                <img src={imgLogo} className="h-[57px]" alt={"logo"} />
                <Avatar name={ac.userInfo?.email} size={24} className="cursor-pointer" variant="marble" onClick={p.onClickUser} />
            </div>
        </div>
    );
};
