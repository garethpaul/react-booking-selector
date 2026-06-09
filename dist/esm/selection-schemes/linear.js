import { isBefore } from 'date-fns/isBefore';
import * as dateUtils from '../date-utils.js';
var isDate = function isDate(time) {
  return time instanceof Date;
};
var linear = function linear(selectionStart, selectionEnd, dateList) {
  var selected = [];
  if (selectionEnd == null) {
    if (selectionStart) selected = [selectionStart];
  } else if (selectionStart) {
    var reverseSelection = isBefore(selectionEnd, selectionStart);
    selected = dateList.reduce(function (acc, dayOfTimes) {
      return Array.isArray(dayOfTimes) ? acc.concat(dayOfTimes.filter(function (t) {
        return isDate(t) && selectionStart && selectionEnd && dateUtils.dateHourIsBetween(reverseSelection ? selectionEnd : selectionStart, t, reverseSelection ? selectionStart : selectionEnd);
      })) : acc;
    }, []);
  }
  return selected;
};
export default linear;