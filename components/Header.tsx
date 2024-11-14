import { MouseEventHandler } from "react";
import userDefaultLogo from "url:~assets/IconuserDefaultLogo.png";

import { imgLogo } from "~constants";

export const Header = (p: { onClickUser: MouseEventHandler<any> }) => {
    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center justify-between w-full pr-5 ">
                <img src={imgLogo} className="" alt={"logo"} />
                <button onClick={p.onClickUser} >
                    <img src={userDefaultLogo} className="" alt={"defaultLogo"} />
                </button>

            </div>
        </div>
    );
};
