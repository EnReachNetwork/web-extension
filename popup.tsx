import "./style.css";


import { App } from "~components/App";

function IndexPopup() {
    return (
        <div className="w-[360px] h-[600px] flex flex-col text-sm font-medium bg-[#1B1B1B] text-white">
            <App />
        </div>
    );
}

export default IndexPopup;
