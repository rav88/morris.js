"use strict";
var morris_donut_1 = require("./morris.donut");
var Morris;
(function (Morris) {
    Donut: morris_donut_1.Donut;
    Formatters;
})(Morris = exports.Morris || (exports.Morris = {}));
var Formatters = (function () {
    function Formatters() {
    }
    Formatters.Commas = function (num) {
        if (num == null) {
            var ret = num < 0 ? "-" : "";
            var absnum = Math.abs(num);
            var intnum = Math.floor(absnum).toFixed(0);
            ret += intnum.replace(/(?=(?:\d{3})+$)(?!^)/g, ',');
            var strabsnum = absnum.toString();
            if (strabsnum.length > intnum.length) {
                ret += strabsnum.slice(intnum.length);
            }
            return ret;
        }
        else
            return '-';
    };
    return Formatters;
}());
exports.Formatters = Formatters;
//# sourceMappingURL=morris.js.map