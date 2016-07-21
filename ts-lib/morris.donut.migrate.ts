// Donut charts.
//
// @example
//   Morris.Donut({
//     el: $('#donut-container'),
//     data: [
//       { label: 'yin',  value: 50 },
//       { label: 'yang', value: 50 }
//     ]
//   });

class Donut extends Morris.EventEmitter {
    public defaults = {
        colors: ["#0B62A4", "#3980B5", "#679DC6", "#95BBD7", "#B0CCE1", "#095791", "#095085", "#083E67", "#052C48", "#042135"],
        backgroundColor: "#FFFFFF",
        labelColor: "#000000",
        formatter: Morris.commas,
        resize: false
    };

    // Create and render a donut chart.
    //

    constructor(options) {
        if (!(this instanceof Morris.Donut)) {
            return new Morris.Donut(options);
        }
        this.options = $.extend({}, this.defaults, options);

        if (typeof options.element === "string") {
            this.el = $(document.getElementById(options.element));
        } else {
            this.el = $(options.element);
        }

        if (this.el === null || this.el.length === 0) {
            throw new Error("Graph placeholder not found.");
        }

        // bail if there's no data
        if (options.data === void 0 || options.data.length === 0) {
            return;
        }

        this.raphael = new Raphael(this.el[0]);

        if (this.options.resize) {
            $(window).bind("resize", (evt) => {
                if (this.timeoutId != null) {
                    window.clearTimeout(this.timeoutId);
                }
                return this.timeoutId = window.setTimeout(this.resizeHandler, 100);
            });
        }

        this.setData(options.data);
    }

    // Clear and redraw the chart.

    public redraw() {
        var C, cx, cy, i, idx, last, max_value, min, next, seg, total, value, w, _i, _j, _len, _len1, _ref, _ref1, _results;
        this.raphael.clear();

        cx = this.el.width() / 2;
        cy = this.el.height() / 2;
        w = (Math.min(cx, cy) - 10) / 3;

        total = 0;
        this.values.forEach((value) => total += value);

        min = 5 / (2 * w);
        C = 1.9999 * Math.PI - min * this.data.length;

        last = 0;
        idx = 0;
        this.segments = [];
        _ref = this.values;
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            value = _ref[i];
            next = last + min + C * (value / total);
            seg = new Morris.DonutSegment(cx, cy, w * 2, w, last, next, this.data[i].color || this.options.colors[idx % this.options.colors.length], this.options.backgroundColor, idx, this.raphael);
            seg.render();
            this.segments.push(seg);
            seg.on("hover", this.select);
            seg.on("click", this.click);
            last = next;
            idx += 1;
        }

        this.text1 = this.drawEmptyDonutLabel(cx, cy - 10, this.options.labelColor, 15, 800);
        this.text2 = this.drawEmptyDonutLabel(cx, cy + 10, this.options.labelColor, 14);

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
        this.data = data;
        this.values = this.data.map((row) => parseFloat(row.value));
        return this.redraw();
    }

    // @private

    public click = (idx) => {
        return this.fire("click", idx, this.data[idx]);
    }

    // Select the segment at the given index.

    public select = (idx) => {
        var row, segment;
        this.segments.forEach((s) => s.deselect());
        segment = this.segments[idx];
        segment.select();
        row = this.data[idx];
        return this.setLabels(row.label, this.options.formatter(row.value, row));
    }

    // @private

    public setLabels(label1, label2) {
        var inner, maxHeightBottom, maxHeightTop, maxWidth, text1bbox, text1scale, text2bbox, text2scale;
        inner = (Math.min(this.el.width() / 2, this.el.height() / 2) - 10) * 2 / 3;
        maxWidth = 1.8 * inner;
        maxHeightTop = inner / 2;
        maxHeightBottom = inner / 3;
        this.text1.attr({
            text: label1,
            transform: ""
        });
        text1bbox = this.text1.getBBox();
        text1scale = Math.min(maxWidth / text1bbox.width, maxHeightTop / text1bbox.height);
        this.text1.attr({
            transform: "S" + text1scale + "," + text1scale + "," + (text1bbox.x + text1bbox.width / 2) + "," + (text1bbox.y + text1bbox.height)
        });
        this.text2.attr({
            text: label2,
            transform: ""
        });
        text2bbox = this.text2.getBBox();
        text2scale = Math.min(maxWidth / text2bbox.width, maxHeightBottom / text2bbox.height);
        return this.text2.attr({
            transform: "S" + text2scale + "," + text2scale + "," + (text2bbox.x + text2bbox.width / 2) + "," + text2bbox.y
        });
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
}

// A segment within a donut chart.
//
// @private
class DonutSegment extends Morris.EventEmitter {
    constructor(public cx, public cy, public inner, public outer, p0, p1, public color, public backgroundColor, public index, public raphael) {
        this.sin_p0 = Math.sin(p0);
        this.cos_p0 = Math.cos(p0);
        this.sin_p1 = Math.sin(p1);
        this.cos_p1 = Math.cos(p1);
        this.is_long = (p1 - p0) > Math.PI ? 1 : 0;
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
