import EventEmitter = NodeJS.EventEmitter;
import {Formatters} from "./morris";
import Raphael = require("raphael");

export class Donut extends EventEmitter {
    private options:DonutParams;
    private raphael:Raphael;
    private timeoutId?:any;
    private values: number[];
    private text1:HTMLElement;
    private text2:HTMLElement;

    private redraw() : void {
        var C, cx, cy, i, idx, last, max_value, min, next, seg, total, value, w, _i, _j, _len, _len1, _ref, _ref1, _results;
        this.raphael.clear();
        
        let el: HTMLElement = this.options.element;

        cx = el.offsetWidth / 2;
        cy = el.offsetHeight / 2;
        w = (Math.min(cx, cy) - 10) / 3;

        total = 0;
        this.values.forEach((value) => total += value);

        min = 5 / (2 * w);
        C = 1.9999 * Math.PI - min * this.options.data.length;

        last = 0;
        idx = 0;
        let segments:any = [];
        _ref = this.values;
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            value = _ref[i];
            next = last + min + C * (value / total);
            seg = new Morris.DonutSegment(cx, cy, w * 2, w, last, next, this.options.data[i].color || this.options.colors[idx % this.options.colors.length], this.options.backgroundColor, idx, this.raphael);
            seg.render();
            segments.push(seg);
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

    public setData(data) {
        this.options.data = data;
        this.values = this.options.data.map((row) => parseFloat(row.value));
        return this.redraw();
    }

    // @private

    public click = (idx) => {
        return this.fire("click", idx, this.options.data[idx]);
    }

    // Select the segment at the given index.

    public select = (idx) => {
        var row, segment;
        this.segments.forEach((s) => s.deselect());
        segment = this.segments[idx];
        segment.select();
        row = this.options.data[idx];
        return this.setLabels(row.label, this.options.formatter(row.value, row));
    }

    // @private

    public setLabels(label1, label2) {
        var inner, maxHeightBottom, maxHeightTop, maxWidth, text1bbox, text1scale, text2bbox, text2scale;
        inner = (Math.min(this.options.element.offsetWidth / 2, this.options.element.offsetHeight / 2) - 10) * 2 / 3;
        maxWidth = 1.8 * inner;
        maxHeightTop = inner / 2;
        maxHeightBottom = inner / 3;
        this.text1.setAttribute("text", label1);
        this.text1.setAttribute("transform", "");
        text1bbox = this.text1.getBBox();
        text1scale = Math.min(maxWidth / text1bbox.width, maxHeightTop / text1bbox.height);
        this.text1.attr({
            transform: "S" + text1scale + "," + text1scale + "," + (text1bbox.x + text1bbox.width / 2) + "," + (text1bbox.y + text1bbox.height)
        });
        this.text1.setAttribute("text", label2);
        this.text1.setAttribute("transform", "");
        text2bbox = this.text2.getBBox();
        text2scale = Math.min(maxWidth / text2bbox.width, maxHeightBottom / text2bbox.height);
        let text2transform =  "S" + text2scale + "," + text2scale + "," + (text2bbox.x + text2bbox.width / 2) + "," + text2bbox.y;
        this.text2.setAttribute("transform", text2transform);
    }

    public drawEmptyDonutLabel(xPos, yPos, color, fontSize, fontWeight) {
        var text;
        text = this.raphael.text(xPos, yPos, "").attr("font-size", fontSize).attr("fill", color);
        if (fontWeight != null) {
            text.attr("font-weight", fontWeight);
        }
        return text;
    }

    public resizeHandler = () => {
        this.timeoutId = null;
        this.raphael.setSize(this.el.width(), this.el.height());
        return this.redraw();
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
        this.timeoutId = window.setTimeout();
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
    private seg:any;private
    private selected:any;

    constructor(public cx, public cy, public inner, public outer, p0, p1, public color, public backgroundColor, public index, public raphael) {
        this.sin_p0 = Math.sin(p0);
        this.cos_p0 = Math.cos(p0);
        this.sin_p1 = Math.sin(p1);
        this.cos_p1 = Math.cos(p1);
        this.is_long = (p1 - p0) > Math.PI;
        this.path = this.calcSegment(this.inner + 3, this.inner + this.outer - 5);
        this.selectedPath = this.calcSegment(this.inner + 3, this.inner + this.outer);
        this.hilight = this.calcArc(this.inner);
    }

    public calcArcPoints(r) {
        return [this.cx + r * this.sin_p0, this.cy + r * this.cos_p0, this.cx + r * this.sin_p1, this.cy + r * this.cos_p1];
    }

    public calcSegment(r1, r2) {
        var ix0, ix1, iy0, iy1, ox0, ox1, oy0, oy1, _ref, _ref1;
        _ref = this.calcArcPoints(r1), ix0 = _ref[0], iy0 = _ref[1], ix1 = _ref[2], iy1 = _ref[3];
        _ref1 = this.calcArcPoints(r2), ox0 = _ref1[0], oy0 = _ref1[1], ox1 = _ref1[2], oy1 = _ref1[3];
        return ("M" + ix0 + "," + iy0) + ("A" + r1 + "," + r1 + ",0," + this.is_long + ",0," + ix1 + "," + iy1) + ("L" + ox1 + "," + oy1) + ("A" + r2 + "," + r2 + ",0," + this.is_long + ",1," + ox0 + "," + oy0) + "Z";
    }

    public calcArc(r) {
        var ix0, ix1, iy0, iy1, _ref;
        _ref = this.calcArcPoints(r), ix0 = _ref[0], iy0 = _ref[1], ix1 = _ref[2], iy1 = _ref[3];
        return ("M" + ix0 + "," + iy0) + ("A" + r + "," + r + ",0," + this.is_long + ",0," + ix1 + "," + iy1);
    }

    public render() {
        this.arc = this.drawDonutArc(this.hilight, this.color);
        return this.seg = this.drawDonutSegment(this.path, this.color, this.backgroundColor, () => this.fire("hover", this.index), () => this.fire("click", this.index));
    }

    public drawDonutArc(path, color) {
        return this.raphael.path(path).attr({
            stroke: color,
            "stroke-width": 2,
            opacity: 0
        });
    }

    public drawDonutSegment(path, fillColor, strokeColor, hoverFunction, clickFunction) {
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
}

class DataAttribute {
    value:number;
    label:string;
    formatted:string;
}