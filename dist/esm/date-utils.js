import { isAfter } from 'date-fns/isAfter';
import { isValid } from 'date-fns/isValid';
import { startOfDay } from 'date-fns/startOfDay';
var allDatesAreValid = function allDatesAreValid() {
  for (var _len = arguments.length, dates = new Array(_len), _key = 0; _key < _len; _key++) {
    dates[_key] = arguments[_key];
  }
  return dates.every(function (date) {
    return date instanceof Date && isValid(date);
  });
};

// Helper function that uses date-fns methods to determine if a date is between two other dates
export var dateHourIsBetween = function dateHourIsBetween(start, candidate, end) {
  return allDatesAreValid(start, candidate, end) && (candidate.getTime() === start.getTime() || isAfter(candidate, start)) && (candidate.getTime() === end.getTime() || isAfter(end, candidate));
};
export var dateIsBetween = function dateIsBetween(start, candidate, end) {
  if (!allDatesAreValid(start, candidate, end)) return false;
  var startOfCandidate = startOfDay(candidate);
  var startOfStart = startOfDay(start);
  var startOfEnd = startOfDay(end);
  return (startOfCandidate.getTime() === startOfStart.getTime() || isAfter(startOfCandidate, startOfStart)) && (startOfCandidate.getTime() === startOfEnd.getTime() || isAfter(startOfEnd, startOfCandidate));
};
export var timeIsBetween = function timeIsBetween(start, candidate, end) {
  return allDatesAreValid(start, candidate, end) && candidate.getHours() >= start.getHours() && candidate.getHours() <= end.getHours();
};