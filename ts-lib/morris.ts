import {Donut} from "./morris.donut";

export module Morris {
    Donut: Donut;
    Formatters;
}

export class Formatters {
    public static Commas (num?:number) : string {
        if (num == null) {
            let ret = num < 0 ? "-" : ""

            let absnum = Math.abs(num);
            let intnum = Math.floor(absnum).toFixed(0);
            ret += intnum.replace(/(?=(?:\d{3})+$)(?!^)/g, ',');
            let strabsnum = absnum.toString();
            if(strabsnum.length > intnum.length) {
                ret += strabsnum.slice(intnum.length)
            }
            return ret;
        }
    else
        return '-';
    }
}