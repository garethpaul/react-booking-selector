import * as dateUtils from '../date-utils.js';
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
export default square;