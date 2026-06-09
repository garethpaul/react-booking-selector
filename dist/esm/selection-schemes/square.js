import { isBefore } from 'date-fns/isBefore';
import { isValid } from 'date-fns/isValid';
import { startOfDay } from 'date-fns/startOfDay';
import * as dateUtils from '../date-utils.js';
var isValidDate = function isValidDate(time) {
  return time instanceof Date && isValid(time);
};
var square = function square(selectionStart, selectionEnd, dateList) {
  var selected = [];
  if (!isValidDate(selectionStart)) return selected;
  if (selectionEnd == null) {
    selected = [selectionStart];
  } else if (isValidDate(selectionEnd)) {
    var dateIsReversed = isBefore(startOfDay(selectionEnd), startOfDay(selectionStart));
    var timeIsReversed = selectionStart.getHours() > selectionEnd.getHours();
    selected = dateList.reduce(function (acc, dayOfTimes) {
      return Array.isArray(dayOfTimes) ? acc.concat(dayOfTimes.filter(function (t) {
        return isValidDate(t) && dateUtils.dateIsBetween(dateIsReversed ? selectionEnd : selectionStart, t, dateIsReversed ? selectionStart : selectionEnd) && dateUtils.timeIsBetween(timeIsReversed ? selectionEnd : selectionStart, t, timeIsReversed ? selectionStart : selectionEnd);
      })) : acc;
    }, []);
  }
  return selected;
};
export default square;