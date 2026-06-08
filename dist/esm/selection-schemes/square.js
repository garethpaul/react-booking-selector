import { isBefore } from 'date-fns/isBefore';
import { startOfDay } from 'date-fns/startOfDay';
import * as dateUtils from '../date-utils.js';
var square = function square(selectionStart, selectionEnd, dateList) {
  var selected = [];
  if (selectionEnd == null) {
    if (selectionStart) selected = [selectionStart];
  } else if (selectionStart) {
    var dateIsReversed = isBefore(startOfDay(selectionEnd), startOfDay(selectionStart));
    var timeIsReversed = selectionStart.getHours() > selectionEnd.getHours();
    selected = dateList.reduce(function (acc, dayOfTimes) {
      return acc.concat(dayOfTimes.filter(function (t) {
        return selectionStart && selectionEnd && dateUtils.dateIsBetween(dateIsReversed ? selectionEnd : selectionStart, t, dateIsReversed ? selectionStart : selectionEnd) && dateUtils.timeIsBetween(timeIsReversed ? selectionEnd : selectionStart, t, timeIsReversed ? selectionStart : selectionEnd);
      }));
    }, []);
  }
  return selected;
};
export default square;