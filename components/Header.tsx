import Avatar from "boring-avatars";
import { MouseEventHandler } from "react";

// import {} from
import { imgLogo } from "~constants";

export const Header = (p: { onClickUser: MouseEventHandler<any> }) => {
    return (
        <div className="flex items-center justify-between w-full">
            <img src={imgLogo} className="h-14" alt="logo" />
            <Avatar size={24} variant="beam" className="h-6 w-6 flex justify-center items-center cursor-pointer" onClick={p.onClickUser} />
        </div>
    );
};
