var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Donut = (function (_super) {
    __extends(Donut, _super);
    function Donut(options) {
        var _this = this;
        this.defaults = {
            colors: ["#0B62A4", "#3980B5", "#679DC6", "#95BBD7", "#B0CCE1", "#095791", "#095085", "#083E67", "#052C48", "#042135"],
            backgroundColor: "#FFFFFF",
            labelColor: "#000000",
            formatter: Morris.commas,
            resize: false
        };
        this.click = function (idx) {
            return _this.fire("click", idx, _this.data[idx]);
        };
        this.select = function (idx) {
            var row, segment;
            _this.segments.forEach(function (s) { return s.deselect(); });
            segment = _this.segments[idx];
            segment.select();
            row = _this.data[idx];
            return _this.setLabels(row.label, _this.options.formatter(row.value, row));
        };
        this.resizeHandler = function () {
            _this.timeoutId = null;
            _this.raphael.setSize(_this.el.width(), _this.el.height());
            return _this.redraw();
        };
        if (!(this instanceof Morris.Donut)) {
            return new Morris.Donut(options);
        }
        this.options = $.extend({}, this.defaults, options);
        if (typeof options.element === "string") {
            this.el = $(document.getElementById(options.element));
        }
        else {
            this.el = $(options.element);
        }
        if (this.el === null || this.el.length === 0) {
            throw new Error("Graph placeholder not found.");
        }
        if (options.data === void 0 || options.data.length === 0) {
            return;
        }
        this.raphael = new Raphael(this.el[0]);
        if (this.options.resize) {
            $(window).bind("resize", function (evt) {
                if (_this.timeoutId != null) {
                    window.clearTimeout(_this.timeoutId);
                }
                return _this.timeoutId = window.setTimeout(_this.resizeHandler, 100);
            });
        }
        this.setData(options.data);
    }
    Donut.prototype.redraw = function () {
        var C, cx, cy, i, idx, last, max_value, min, next, seg, total, value, w, _i, _j, _len, _len1, _ref, _ref1, _results;
        this.raphael.clear();
        cx = this.el.width() / 2;
        cy = this.el.height() / 2;
        w = (Math.min(cx, cy) - 10) / 3;
        total = 0;
        this.values.forEach(function (value) { return total += value; });
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
    };
    Donut.prototype.setData = function (data) {
        this.data = data;
        this.values = this.data.map(function (row) { return parseFloat(row.value); });
        return this.redraw();
    };
    Donut.prototype.setLabels = function (label1, label2) {
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
    };
    Donut.prototype.drawEmptyDonutLabel = function (xPos, yPos, color, fontSize, fontWeight) {
        var text;
        text = this.raphael.text(xPos, yPos, "").attr("font-size", fontSize).attr("fill", color);
        if (fontWeight != null) {
            text.attr("font-weight", fontWeight);
        }
        return text;
    };
    return Donut;
}(Morris.EventEmitter));
var DonutSegment = (function (_super) {
    __extends(DonutSegment, _super);
    function DonutSegment(cx, cy, inner, outer, p0, p1, color, backgroundColor, index, raphael) {
        var _this = this;
        this.cx = cx;
        this.cy = cy;
        this.inner = inner;
        this.outer = outer;
        this.color = color;
        this.backgroundColor = backgroundColor;
        this.index = index;
        this.raphael = raphael;
        this.select = function () {
            if (!_this.selected) {
                _this.seg.animate({
                    path: _this.selectedPath
                }, 150, "<>");
                _this.arc.animate({
                    opacity: 1
                }, 150, "<>");
                return _this.selected = true;
            }
        };
        this.deselect = function () {
            if (_this.selected) {
                _this.seg.animate({
                    path: _this.path
                }, 150, "<>");
                _this.arc.animate({
                    opacity: 0
                }, 150, "<>");
                return _this.selected = false;
            }
        };
        this.sin_p0 = Math.sin(p0);
        this.cos_p0 = Math.cos(p0);
        this.sin_p1 = Math.sin(p1);
        this.cos_p1 = Math.cos(p1);
        this.is_long = (p1 - p0) > Math.PI ? 1 : 0;
        this.path = this.calcSegment(this.inner + 3, this.inner + this.outer - 5);
        this.selectedPath = this.calcSegment(this.inner + 3, this.inner + this.outer);
        this.hilight = this.calcArc(this.inner);
    }
    DonutSegment.prototype.calcArcPoints = function (r) {
        return [this.cx + r * this.sin_p0, this.cy + r * this.cos_p0, this.cx + r * this.sin_p1, this.cy + r * this.cos_p1];
    };
    DonutSegment.prototype.calcSegment = function (r1, r2) {
        var ix0, ix1, iy0, iy1, ox0, ox1, oy0, oy1, _ref, _ref1;
        _ref = this.calcArcPoints(r1), ix0 = _ref[0], iy0 = _ref[1], ix1 = _ref[2], iy1 = _ref[3];
        _ref1 = this.calcArcPoints(r2), ox0 = _ref1[0], oy0 = _ref1[1], ox1 = _ref1[2], oy1 = _ref1[3];
        return ("M" + ix0 + "," + iy0) + ("A" + r1 + "," + r1 + ",0," + this.is_long + ",0," + ix1 + "," + iy1) + ("L" + ox1 + "," + oy1) + ("A" + r2 + "," + r2 + ",0," + this.is_long + ",1," + ox0 + "," + oy0) + "Z";
    };
    DonutSegment.prototype.calcArc = function (r) {
        var ix0, ix1, iy0, iy1, _ref;
        _ref = this.calcArcPoints(r), ix0 = _ref[0], iy0 = _ref[1], ix1 = _ref[2], iy1 = _ref[3];
        return ("M" + ix0 + "," + iy0) + ("A" + r + "," + r + ",0," + this.is_long + ",0," + ix1 + "," + iy1);
    };
    DonutSegment.prototype.render = function () {
        var _this = this;
        this.arc = this.drawDonutArc(this.hilight, this.color);
        return this.seg = this.drawDonutSegment(this.path, this.color, this.backgroundColor, function () { return _this.fire("hover", _this.index); }, function () { return _this.fire("click", _this.index); });
    };
    DonutSegment.prototype.drawDonutArc = function (path, color) {
        return this.raphael.path(path).attr({
            stroke: color,
            "stroke-width": 2,
            opacity: 0
        });
    };
    DonutSegment.prototype.drawDonutSegment = function (path, fillColor, strokeColor, hoverFunction, clickFunction) {
        return this.raphael.path(path).attr({
            fill: fillColor,
            stroke: strokeColor,
            "stroke-width": 3
        }).hover(hoverFunction).click(clickFunction);
    };
    return DonutSegment;
}(Morris.EventEmitter));
//# sourceMappingURL=morris.donut.migrate.js.map