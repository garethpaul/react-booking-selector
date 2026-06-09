import { isBefore } from 'date-fns/isBefore';
import { isValid } from 'date-fns/isValid';
import * as dateUtils from '../date-utils.js';
var isValidDate = function isValidDate(time) {
  return time instanceof Date && isValid(time);
};
var linear = function linear(selectionStart, selectionEnd, dateList) {
  var selected = [];
  if (!isValidDate(selectionStart)) return selected;
  if (selectionEnd == null) {
    selected = [selectionStart];
  } else if (isValidDate(selectionEnd)) {
    var reverseSelection = isBefore(selectionEnd, selectionStart);
    selected = dateList.reduce(function (acc, dayOfTimes) {
      return Array.isArray(dayOfTimes) ? acc.concat(dayOfTimes.filter(function (t) {
        return isValidDate(t) && dateUtils.dateHourIsBetween(reverseSelection ? selectionEnd : selectionStart, t, reverseSelection ? selectionStart : selectionEnd);
      })) : acc;
    }, []);
  }
  return selected;
};
export default linear;