import EventEmitter = NodeJS.EventEmitter;
import {Formatters} from "./morris";
import Raphael = require("raphael");

export class Donut extends EventEmitter {
    private options:DonutParams;
    private raphael:Raphael;
    private timeoutId?:any;

    private redraw() : void {
    @raphael.clear()

        cx = @el.width() / 2
        cy = @el.height() / 2
        w = (Math.min(cx, cy) - 10) / 3

        total = 0
        total += value
        for value in @values

            min = 5 / (2 * w)
        C = 1.9999 * Math.PI - min * @data.length

        last = 0
        idx = 0
    @segments
        = []
        for value, i in @values
            next = last + min + C * (value / total)
        seg = new Morris.DonutSegment(
            cx, cy, w * 2, w, last, next,
            @data[i].color || @options.colors[idx % @options.colors.length],
            @options.backgroundColor, idx, @raphael)
        seg.render()
    @segments.push
        seg
        seg.on
        'hover', @select
        seg.on
        'click', @click
        last = next
        idx += 1

    @text1
        = @drawEmptyDonutLabel(cx, cy - 10, @options.labelColor, 15, 800)
    @text2
        = @drawEmptyDonutLabel(cx, cy + 10, @options.labelColor, 14)

        max_value = Math.max
    @values...
        idx = 0
        for value in @values
            if value == max_value
            @select idx
        break
        idx += 1
    }

    private resizeHandler() {
    this.timeoutId = null;
        (<RaphaelPaper>this.raphael).setSize(this.options.element.offsetWidth, this.options.element.offsetHeight);
    this.redraw();
    }

    private ResizeRaphael(evt:UIEvent):any {
        if (this.timeoutId != undefined) {
            window.clearTimeout(this.timeoutId);
        }
        this.timeoutId = window.setTimeout()
    }

    constructor(options:DonutParams) {
        this.options = options;

        if (this.options.element == undefined) {
            this.options.element = document.getElementById(this.options.elementId);
        }

        if (this.options.element == undefined) {
            throw new Error("Element could not be found");
        }

        if (this.options.data == undefined || this.options.data.length == 0) {
            return;
        }

        this.raphael = new Raphael(this.options.element);

        if (this.options.resize) {
            window.onresize =
        }
    }
}

class DonutParams {
    colors:string[] = [
        '#0B62A4',
        '#3980B5',
        '#679DC6',
        '#95BBD7',
        '#B0CCE1',
        '#095791',
        '#095085',
        '#083E67',
        '#052C48',
        '#042135'
    ];
    backgroundColor:string = '#FFFFFF';
    labelColor:string = '#000000';
    formatter:(num?:number) => string = Formatters.Commas;
    resize:boolean = false;

    data:DataAttribute[];
    elementId:string;
    element:HTMLElement;

    resize:boolean;
}

class DataAttribute {
    value:number;
    label:string;
    formatted:string;
}