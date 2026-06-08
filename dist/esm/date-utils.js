import { startOfDay, isAfter } from 'date-fns';

// Helper function that uses date-fns methods to determine if a date is between two other dates
export var dateHourIsBetween = function dateHourIsBetween(start, candidate, end) {
  return (candidate.getTime() === start.getTime() || isAfter(candidate, start)) && (candidate.getTime() === end.getTime() || isAfter(end, candidate));
};
export var dateIsBetween = function dateIsBetween(start, candidate, end) {
  var startOfCandidate = startOfDay(candidate);
  var startOfStart = startOfDay(start);
  var startOfEnd = startOfDay(end);
  return (startOfCandidate.getTime() === startOfStart.getTime() || isAfter(startOfCandidate, startOfStart)) && (startOfCandidate.getTime() === startOfEnd.getTime() || isAfter(startOfEnd, startOfCandidate));
};
export var timeIsBetween = function timeIsBetween(start, candidate, end) {
  return candidate.getHours() >= start.getHours() && candidate.getHours() <= end.getHours();
};