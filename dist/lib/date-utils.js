"use strict";

exports.__esModule = true;
exports.timeIsBetween = exports.dateIsBetween = exports.dateHourIsBetween = void 0;
var _dateFns = require("date-fns");
// Helper function that uses date-fns methods to determine if a date is between two other dates
var dateHourIsBetween = exports.dateHourIsBetween = function dateHourIsBetween(start, candidate, end) {
  return (candidate.getTime() === start.getTime() || (0, _dateFns.isAfter)(candidate, start)) && (candidate.getTime() === end.getTime() || (0, _dateFns.isAfter)(end, candidate));
};
var dateIsBetween = exports.dateIsBetween = function dateIsBetween(start, candidate, end) {
  var startOfCandidate = (0, _dateFns.startOfDay)(candidate);
  var startOfStart = (0, _dateFns.startOfDay)(start);
  var startOfEnd = (0, _dateFns.startOfDay)(end);
  return (startOfCandidate.getTime() === startOfStart.getTime() || (0, _dateFns.isAfter)(startOfCandidate, startOfStart)) && (startOfCandidate.getTime() === startOfEnd.getTime() || (0, _dateFns.isAfter)(startOfEnd, startOfCandidate));
};
var timeIsBetween = exports.timeIsBetween = function timeIsBetween(start, candidate, end) {
  return candidate.getHours() >= start.getHours() && candidate.getHours() <= end.getHours();
};