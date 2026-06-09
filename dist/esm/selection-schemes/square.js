import * as dateUtils from '../date-utils.js';
var square = function square(selectionStart, selectionEnd, dateList) {
  var selected = [];
  if (!dateUtils.isValidDate(selectionStart)) return selected;
  if (selectionEnd == null) {
    selected = [selectionStart];
  } else if (dateUtils.isValidDate(selectionEnd) && Array.isArray(dateList)) {
    var dateIsReversed = dateUtils.getStartOfDayTimestamp(selectionEnd) < dateUtils.getStartOfDayTimestamp(selectionStart);
    var timeIsReversed = dateUtils.getDateHour(selectionStart) > dateUtils.getDateHour(selectionEnd);
    selected = dateList.reduce(function (acc, dayOfTimes) {
      return Array.isArray(dayOfTimes) ? acc.concat(dayOfTimes.filter(function (t) {
        return dateUtils.isValidDate(t) && dateUtils.dateIsBetween(dateIsReversed ? selectionEnd : selectionStart, t, dateIsReversed ? selectionStart : selectionEnd) && dateUtils.timeIsBetween(timeIsReversed ? selectionEnd : selectionStart, t, timeIsReversed ? selectionStart : selectionEnd);
      })) : acc;
    }, []);
  }
  return selected;
};
export default square;