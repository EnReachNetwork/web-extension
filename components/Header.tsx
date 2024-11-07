import React, { MouseEventHandler } from "react";
import { AiOutlineUser } from "react-icons/ai";

import { imgLogo } from "~constants";

export const Header = (p: { onClickUser: MouseEventHandler<HTMLDivElement> }) => {
    return (
        <div className="flex items-center justify-between w-full">
            <img src={imgLogo} className="h-11" alt="logo" />
            <div className="h-11 w-11 flex justify-center items-center cursor-pointer" onClick={p.onClickUser}>
                <AiOutlineUser className="text-2xl" />
            </div>
        </div>
    );
};
