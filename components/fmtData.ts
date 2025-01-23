import _ from "lodash";
import numbro from "numbro";

export function fmtBerry(berry?: string | number | null, def: "-" | number = 0) {
    const total = _.toNumber(berry);
    return total
        ? numbro(total)
              .format({
                  mantissa: 2,
                  trimMantissa: true,
                  average: total >= 1000,
              })
              .toUpperCase()
        : def;
}

export function fmtNetqulity(last?: string | number | number, def: "-" | `${number}%` = "-") {
    const lastNum = _.toNumber(last);
    return lastNum ? `${Math.min(_.round((lastNum * 100) / 10), 100)}%` : def;
}
export function fmtNetqulityDeg(last?: string | number | number, def: "-" | `${number}deg` = "-") {
    const lastNum = _.toNumber(last);
    return lastNum ? `${Math.min(_.round((lastNum * 180) / 10), 180)}deg` : def;
}

export function fmtBoost(boost?: string | number | number) {
    return numbro(Math.max(_.toNumber(boost || "1"), 1)).format({ mantissa: 1, trimMantissa: false });
}
