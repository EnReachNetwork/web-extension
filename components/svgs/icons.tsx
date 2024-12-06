import { SVGProps } from "react";

export function Berry({ children, ref, ...props }: SVGProps<SVGElement>) {
    return (
        <svg {...props} width="1em" height="1em" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
            <image
                width="41"
                height="41"
                xlinkHref="data:image/png;base64,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"
            ></image>
        </svg>
    );
}

export function Rocket({ children, ref, ...props }: SVGProps<SVGElement>) {
    return (
        <svg {...props} width="1em" height="1em" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
            <image
                id="image0_70_1714"
                width="41"
                height="41"
                transform-origin="center center"
                xlinkHref="data:image/png;base64,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"
            >
                <animateTransform attributeName="transform" attributeType="XML" type="scale" from="0.7" to="1" dur="1s" repeatCount="indefinite" />
            </image>
        </svg>
    );
}
export function Exp({ children, ref, ...props }: SVGProps<SVGElement>) {
    return (
        <svg {...props} width="1em" height="1em" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
            <image
                id="images_exp"
                width="41"
                height="41"
                transform-origin="center center"
                xlinkHref="data:image/png;base64,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"
            >
                <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0" to="360" dur="6s" repeatCount="indefinite" />
            </image>
        </svg>
    );
}
