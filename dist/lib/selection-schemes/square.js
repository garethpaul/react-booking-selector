"use strict";

exports.__esModule = true;
exports.default = void 0;
var dateUtils = _interopRequireWildcard(require("../date-utils.js"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
var collectMatchingDates = function collectMatchingDates(dateList, matches) {
  var selected = [];
  if (!Array.isArray(dateList)) return selected;
  for (var dayIndex = 0; dayIndex < dateList.length; dayIndex += 1) {
    var dayOfTimes = dateList[dayIndex];
    if (!Array.isArray(dayOfTimes)) continue;
    for (var timeIndex = 0; timeIndex < dayOfTimes.length; timeIndex += 1) {
      var time = dayOfTimes[timeIndex];
      if (matches(time)) selected.push(time);
    }
  }
  return selected;
};
var square = function square(selectionStart, selectionEnd, dateList) {
  var selected = [];
  if (!dateUtils.isValidDate(selectionStart)) return selected;
  if (selectionEnd == null) {
    selected = [selectionStart];
  } else if (dateUtils.isValidDate(selectionEnd)) {
    var dateIsReversed = dateUtils.getStartOfDayTimestamp(selectionEnd) < dateUtils.getStartOfDayTimestamp(selectionStart);
    var timeIsReversed = dateUtils.getDateHour(selectionStart) > dateUtils.getDateHour(selectionEnd);
    selected = collectMatchingDates(dateList, function (time) {
      return dateUtils.isValidDate(time) && dateUtils.dateIsBetween(dateIsReversed ? selectionEnd : selectionStart, time, dateIsReversed ? selectionStart : selectionEnd) && dateUtils.timeIsBetween(timeIsReversed ? selectionEnd : selectionStart, time, timeIsReversed ? selectionStart : selectionEnd);
    });
  }
  return selected;
};
var _default = exports.default = square;