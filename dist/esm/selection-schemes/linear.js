import { isBefore } from 'date-fns';
import * as dateUtils from '../date-utils.js';
var linear = function linear(selectionStart, selectionEnd, dateList) {
  var selected = [];
  if (selectionEnd == null) {
    if (selectionStart) selected = [selectionStart];
  } else if (selectionStart) {
    var reverseSelection = isBefore(selectionEnd, selectionStart);
    selected = dateList.reduce(function (acc, dayOfTimes) {
      return acc.concat(dayOfTimes.filter(function (t) {
        return selectionStart && selectionEnd && dateUtils.dateHourIsBetween(reverseSelection ? selectionEnd : selectionStart, t, reverseSelection ? selectionStart : selectionEnd);
      }));
    }, []);
  }
  return selected;
};
export default linear;