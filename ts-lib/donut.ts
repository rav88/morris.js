import Raphael = require("raphael");

import EventEmitter = require("wolfy87-eventemitter");
export module Graph {
    export class Donut extends EventEmitter {
        private options:DonutParams;
        private raphael:RaphaelPaper;
        private timeoutId:any;
        private values:number[];
        private text1:RaphaelElement;//HTMLElement;
        private text2:RaphaelElement;//HTMLElement;
        private segments:any = [];

        private redraw():number[] {
            let C:number;
            let cx:number;
            let cy:number;
            let i:number;
            let idx:number;
            let last:number;
            let max_value:number;
            let min:number;
            let next:number;
            let seg:DonutSegment;
            let total:number;
            let value:number;
            let w:number;
            let _i:number;
            let _j:number;
            let _len:number;
            let _len1:number;
            let _ref:number[];
            let _ref1:number[];

            let _results:number[];

            (<RaphaelPaper> this.raphael).clear();

            let el:HTMLElement = this.options.element;

            cx = el.offsetWidth / 2;
            cy = el.offsetHeight / 2;
            w = (Math.min(cx, cy) - 10) / 3;

            total = 0;
            this.values.forEach((value) => total += value);

            min = 5 / (2 * w);
            C = 1.9999 * Math.PI - min * this.options.data.length;

            last = 0;
            idx = 0;
            //let segments:any = [];
            _ref = this.values;
            for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
                value = _ref[i];
                next = last + min + C * (value / total);
                seg = new DonutSegment(cx, cy, w * 2, w, last, next, this.options.data[i].color || this.options.colors[idx % this.options.colors.length], this.options.backgroundColor, idx, this.raphael);
                seg.render();
                this.segments.push(seg);
                seg.on("hover", this.select);
                seg.on("click", this.click);
                last = next;
                idx += 1;
            }

            this.text1 = this.drawEmptyDonutLabel(cx, cy - 10, this.options.labelColor, 15, 800);
            this.text2 = this.drawEmptyDonutLabel(cx, cy + 10, this.options.labelColor, 14, 400);

            max_value = Math.max.apply(Math, this.values);
            idx = 0;
            _ref1 = this.values;
            _results = [];
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                value = _ref1[_j];
                if (value === max_value) {
                    this.select(idx);
                    break;
                }
                _results.push(idx += 1);
            }
            return _results;
        }

        public setData(data:DataAttribute[]) {
            this.options.data = data;
            this.values = this.options.data.map((row) => row.value);
            return this.redraw();
        }

        // @private

        public click = (idx:number) => {
            return this.emit("click", idx, this.options.data[idx]);
        }

        // Select the segment at the given index.

        public select = (idx:number) => {
            let row:any, segment:any;
            this.segments.forEach((s:any) => s.deselect());
            segment = this.segments[idx];
            segment.select();
            row = this.options.data[idx];
            return this.setLabels(row.label, this.options.formatter(row.value));
        }

        // @private

        public setLabels(label1:string, label2:string) {
            let inner:number;
            let maxHeightBottom:number;
            let maxHeightTop:number;
            let maxWidth:number;
            let text1bbox:BoundingBox;
            let text1scale:number;
            let text2bbox:BoundingBox;
            let text2scale:number;

            inner = (Math.min(this.options.element.offsetWidth / 2, this.options.element.offsetHeight / 2) - 10) * 2 / 3;
            maxWidth = 1.8 * inner;
            maxHeightTop = inner / 2;
            maxHeightBottom = inner / 3;
            this.text1.attr("text", label1);
            this.text1.attr("transform", "");
            text1bbox = this.text1.getBBox();
            text1scale = Math.min(maxWidth / text1bbox.width, maxHeightTop / text1bbox.height);
            this.text1.attr("transform", "S" + text1scale + "," + text1scale + "," + (text1bbox.x + text1bbox.width / 2) + "," + (text1bbox.y + text1bbox.height));

            this.text2.attr("text", label2);
            this.text2.attr("transform", "");
            text2bbox = this.text2.getBBox();
            text2scale = Math.min(maxWidth / text2bbox.width, maxHeightBottom / text2bbox.height);
            let text2transform = "S" + text2scale + "," + text2scale + "," + (text2bbox.x + text2bbox.width / 2) + "," + text2bbox.y;
            this.text2.attr("transform", text2transform);
        }

        public drawEmptyDonutLabel(xPos:number, yPos:number, color:string, fontSize:number, fontWeight:number):RaphaelElement {
            let text:RaphaelElement;
            text = (<RaphaelPaper>this.raphael).text(xPos, yPos, "").attr("font-size", fontSize).attr("fill", color);
            if (fontWeight != null) {
                text.attr("font-weight", fontWeight);
            }
            return text;
        }

        public resizeHandler():number[] {
            this.timeoutId = null;
            this.raphael.setSize(this.options.element.offsetWidth, this.options.element.offsetHeight);
            return this.redraw();
        }


        private ResizeRaphael(evt:UIEvent):any {
            if (this.timeoutId != undefined) {
                window.clearTimeout(this.timeoutId);
            }
            this.timeoutId = window.setTimeout(100);
        }

        public ResizeEvt(event:Event):UIEvent {
            if (this.timeoutId != null) {
                window.clearTimeout(this.timeoutId);
            }
            this.timeoutId = window.setTimeout(this.resizeHandler, 100);
            let x:UIEvent;
            return x;
        }

        constructor(options:DonutParams) {
            super();
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

            this.raphael = <RaphaelPaper>(Raphael(this.options.element, this.options.element.offsetWidth, this.options.element.offsetHeight));

            if (this.options.resize) {
                window.onresize = this.ResizeEvt;
            }

            this.setData(options.data);
        }
    }


    class DonutSegment extends EventEmitter {

        private sin_p0:number;
        private cos_p0:number;
        private sin_p1:number;
        private cos_p1:number;
        private is_long:boolean;
        private path:string;
        private selectedPath:string;
        private hilight:any;

        private arc:any;
        private seg:any;
        private selected:any;

        constructor(public cx:number, public cy:number, public inner:number, public outer:number, p0:number, p1:number, public color:string, public backgroundColor:string, public index:any, public raphael:any) {
            super();
            this.sin_p0 = Math.sin(p0);
            this.cos_p0 = Math.cos(p0);
            this.sin_p1 = Math.sin(p1);
            this.cos_p1 = Math.cos(p1);
            this.is_long = (p1 - p0) > Math.PI;
            this.path = this.calcSegment(this.inner + 3, this.inner + this.outer - 5);
            this.selectedPath = this.calcSegment(this.inner + 3, this.inner + this.outer);
            this.hilight = this.calcArc(this.inner);
        }

        public calcArcPoints(r:number) {
            return [this.cx + r * this.sin_p0, this.cy + r * this.cos_p0, this.cx + r * this.sin_p1, this.cy + r * this.cos_p1];
        }

        public calcSegment(r1:number, r2:number):any {
            let ix0:number;
            let iy0:number;
            let ix1:number;
            let iy1:number;
            let ox1:number;
            let ox0:number;
            let oy0:number;
            let oy1:number;
            let _ref:number[];
            let _ref1:number[];

            _ref = this.calcArcPoints(r1), ix0 = _ref[0], iy0 = _ref[1], ix1 = _ref[2], iy1 = _ref[3];
            _ref1 = this.calcArcPoints(r2), ox0 = _ref1[0], oy0 = _ref1[1], ox1 = _ref1[2], oy1 = _ref1[3];
            return ("M" + ix0 + "," + iy0) + ("A" + r1 + "," + r1 + ",0," + this.is_long + ",0," + ix1 + "," + iy1) + ("L" + ox1 + "," + oy1) + ("A" + r2 + "," + r2 + ",0," + this.is_long + ",1," + ox0 + "," + oy0) + "Z";
        }

        public calcArc(r:number):string {
            let ix0:number;
            let iy0:number;
            let ix1:number;
            let iy1:number;
            let _ref:number[];

            _ref = this.calcArcPoints(r), ix0 = _ref[0], iy0 = _ref[1], ix1 = _ref[2], iy1 = _ref[3];
            return ("M" + ix0 + "," + iy0) + ("A" + r + "," + r + ",0," + this.is_long + ",0," + ix1 + "," + iy1);
        }

        public render() {
            this.arc = this.drawDonutArc(this.hilight, this.color);
            return this.seg = this.drawDonutSegment(this.path, this.color, this.backgroundColor, () => this.emit("hover", this.index), () => this.emit("click", this.index));
        }

        public drawDonutArc(path:string, color:string) {
            return this.raphael.path(path).attr({
                stroke: color,
                "stroke-width": 2,
                opacity: 1
            });
        }

        public drawDonutSegment(path:string, fillColor:string, strokeColor:string, hoverFunction:() => any, clickFunction:() => any) {
            return this.raphael.path(path).attr({
                fill: fillColor,
                stroke: strokeColor,
                "stroke-width": 3
            }).hover(hoverFunction).click(clickFunction);
        }

        public select = () => {
            if (!this.selected) {
                this.seg.animate({
                    path: this.selectedPath
                }, 150, "<>");
                this.arc.animate({
                    opacity: 1
                }, 150, "<>");
                return this.selected = true;
            }
        }

        public deselect = () => {
            if (this.selected) {
                this.seg.animate({
                    path: this.path
                }, 150, "<>");
                this.arc.animate({
                    opacity: 0
                }, 150, "<>");
                return this.selected = false;
            }
        }
    }

    export class DonutParams {
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
    }

    export class DataAttribute {
        value:number;
        label:string;
        formatted:string;
        color:string;
    }

    export class Formatters {
        public static Commas(num?:number):string {
            if (num != null) {
                let ret = num < 0 ? "-" : "";

                let absnum = Math.abs(num);
                let intnum = Math.floor(absnum).toFixed(0);
                ret += intnum.replace(/(?=(?:\d{3})+$)(?!^)/g, ',');
                let strabsnum = absnum.toString();
                if (strabsnum.length > intnum.length) {
                    ret += strabsnum.slice(intnum.length)
                }
                return ret;
            }
            else
                return '-';
        }
    }
}

