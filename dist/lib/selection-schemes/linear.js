"use strict";

exports.__esModule = true;
exports.default = void 0;
var _dateFns = require("date-fns");
var dateUtils = _interopRequireWildcard(require("../date-utils"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
var linear = function linear(selectionStart, selectionEnd, dateList) {
  var selected = [];
  if (selectionEnd == null) {
    if (selectionStart) selected = [selectionStart];
  } else if (selectionStart) {
    var reverseSelection = (0, _dateFns.isBefore)(selectionEnd, selectionStart);
    selected = dateList.reduce(function (acc, dayOfTimes) {
      return acc.concat(dayOfTimes.filter(function (t) {
        return selectionStart && selectionEnd && dateUtils.dateHourIsBetween(reverseSelection ? selectionEnd : selectionStart, t, reverseSelection ? selectionStart : selectionEnd);
      }));
    }, []);
  }
  return selected;
};
var _default = exports.default = linear;