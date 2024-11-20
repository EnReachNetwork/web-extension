import React, { MouseEventHandler } from "react";

import { StatusConnect } from "~constants";
import { cn } from "~libs/utils";

export default function ConAnim(p: { status: StatusConnect; onClick?: MouseEventHandler<SVGSVGElement>; className?: string }) {
    const fillColor = p.status === "connected" ? "#0085FD" : "#212121";
    const animDur = 3;
    return (
        <svg
            width="162"
            height="162"
            viewBox="0 0 162 162"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            onClick={p.onClick}
            className={cn({ "cursor-pointer": p.onClick && (p.status == "idle") }, p.className)}
        >
            <circle
                cx="81"
                cy="80.8"
                r="80.4"
                stroke={fillColor}
                strokeOpacity="0.25"
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeDasharray="0.8 6.4"
                transform-origin="center center"
            >
                {<animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0" to="360" dur="12s" repeatCount="indefinite" />}
            </circle>
            <circle cx="80.9999" cy="80.8" r="73.6" fill={fillColor} fillOpacity="0.04" />
            <circle cx="81" cy="80.8" r="64" fill={fillColor} fillOpacity="0.08" />
            <circle cx="81" cy="80.8" r="54.4" fill={fillColor} />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                transform-origin="96 79"
                d="M70.2309 83.3519C70.5294 83.7144 70.9955 83.8512 71.4651 83.8512H88.2952L82.19 94.3077C81.8052 94.9669 81.7587 95.7759 82.2205 96.3837C82.7425 97.0707 83.6218 97.9944 84.9977 98.8077C86.4286 99.6536 87.6954 99.9159 88.5425 99.9813C89.2385 100.035 89.841 99.6115 90.193 99.0086L96.3507 88.4622L100.808 96.0961C101.11 96.6133 101.597 97.0051 102.195 97.0487C103.154 97.1187 104.762 97.0098 106.522 95.9314C108.333 94.8214 108.98 93.6362 109.21 92.9318C109.342 92.5276 109.225 92.1046 109.011 91.7374L104.406 83.8512L113.796 83.8512C114.574 83.8512 115.307 83.4695 115.587 82.7437C115.888 81.9629 116.2 80.7834 116.2 79.2493C116.2 77.7152 115.888 76.5356 115.587 75.7549C115.307 75.029 114.574 74.6473 113.796 74.6473H104.417L110.898 63.5462C111.054 63.2795 111.161 62.9834 111.129 62.6762C111.048 61.915 110.583 60.3646 108.267 59.1156C106.098 57.9459 104.484 58.0968 103.669 58.3155C103.265 58.4237 102.963 58.7283 102.753 59.0889L96.3474 70.0487L87.7981 55.4059C87.4655 54.8363 86.9111 54.4222 86.2518 54.4031C85.3084 54.3758 83.8384 54.5143 82.3799 55.3765C80.9579 56.2171 80.1174 57.3525 79.6645 58.1509C79.3296 58.7412 79.4117 59.4501 79.7539 60.0362L88.2847 74.6473L71.4651 74.6473C70.9955 74.6473 70.5294 74.7842 70.2309 75.1466C69.7161 75.7716 69 77.0384 69 79.2493C69 81.4601 69.7161 82.7269 70.2309 83.3519ZM98.7721 83.1582C97.2836 84.0102 95.4154 84.0103 93.9269 83.1583C92.4479 82.3117 91.5149 80.7274 91.5129 79.0232C91.511 77.3125 92.4472 75.7213 93.9332 74.8738C95.4175 74.0272 97.2788 74.0276 98.7634 74.8737C100.25 75.7208 101.188 77.3129 101.186 79.0238C101.184 80.7276 100.251 82.3118 98.7721 83.1582Z"
                fill="white"
            >
                {p.status !== "connected" && <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="1s" repeatCount="indefinite" />}
                {p.status === "connected" && (
                    <>
                        <animateTransform attributeName="transform" type="scale" values="0.3;1;0.3" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" />
                        <animate attributeName="fillOpacity" values="0.2;1;0.2" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" />
                    </>
                )}
            </path>
        </svg>
    );
}
