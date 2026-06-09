import * as dateUtils from '../date-utils.js';
var isArray = Array.isArray;
var collectMatchingDates = function collectMatchingDates(dateList, matches) {
  var selected = [];
  if (!isArray(dateList)) return selected;
  for (var dayIndex = 0; dayIndex < dateList.length; dayIndex += 1) {
    var dayOfTimes = dateList[dayIndex];
    if (!isArray(dayOfTimes)) continue;
    for (var timeIndex = 0; timeIndex < dayOfTimes.length; timeIndex += 1) {
      var time = dayOfTimes[timeIndex];
      if (matches(time)) selected.push(time);
    }
  }
  return selected;
};
var linear = function linear(selectionStart, selectionEnd, dateList) {
  var selected = [];
  if (!dateUtils.isValidDate(selectionStart)) return selected;
  if (selectionEnd == null) {
    selected = [selectionStart];
  } else if (dateUtils.isValidDate(selectionEnd)) {
    var reverseSelection = dateUtils.getDateTimestamp(selectionEnd) < dateUtils.getDateTimestamp(selectionStart);
    selected = collectMatchingDates(dateList, function (time) {
      return dateUtils.isValidDate(time) && dateUtils.dateHourIsBetween(reverseSelection ? selectionEnd : selectionStart, time, reverseSelection ? selectionStart : selectionEnd);
    });
  }
  return selected;
};
export default linear;