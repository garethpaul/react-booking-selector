import * as dateUtils from '../date-utils.js';
var linear = function linear(selectionStart, selectionEnd, dateList) {
  var selected = [];
  if (!dateUtils.isValidDate(selectionStart)) return selected;
  if (selectionEnd == null) {
    selected = [selectionStart];
  } else if (dateUtils.isValidDate(selectionEnd) && Array.isArray(dateList)) {
    var reverseSelection = dateUtils.getDateTimestamp(selectionEnd) < dateUtils.getDateTimestamp(selectionStart);
    selected = dateList.reduce(function (acc, dayOfTimes) {
      return Array.isArray(dayOfTimes) ? acc.concat(dayOfTimes.filter(function (t) {
        return dateUtils.isValidDate(t) && dateUtils.dateHourIsBetween(reverseSelection ? selectionEnd : selectionStart, t, reverseSelection ? selectionStart : selectionEnd);
      })) : acc;
    }, []);
  }
  return selected;
};
export default linear;