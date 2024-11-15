import Avatar from "boring-avatars";
import { MouseEventHandler } from "react";

import { imgLogo } from "~constants";

export const Header = (p: { onClickUser: MouseEventHandler<any> }) => {
    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center justify-between w-full pr-5 ">
                <img src={imgLogo} className="h-[57px]" alt={"logo"} />
                <Avatar name="example@email.com" size={24} className="cursor-pointer" variant="beam" onClick={p.onClickUser} />
            </div>
        </div>
    );
};
