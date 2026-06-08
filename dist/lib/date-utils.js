"use strict";

exports.__esModule = true;
exports.timeIsBetween = exports.dateIsBetween = exports.dateHourIsBetween = void 0;
var _isAfter = require("date-fns/isAfter");
var _startOfDay = require("date-fns/startOfDay");
// Helper function that uses date-fns methods to determine if a date is between two other dates
var dateHourIsBetween = exports.dateHourIsBetween = function dateHourIsBetween(start, candidate, end) {
  return (candidate.getTime() === start.getTime() || (0, _isAfter.isAfter)(candidate, start)) && (candidate.getTime() === end.getTime() || (0, _isAfter.isAfter)(end, candidate));
};
var dateIsBetween = exports.dateIsBetween = function dateIsBetween(start, candidate, end) {
  var startOfCandidate = (0, _startOfDay.startOfDay)(candidate);
  var startOfStart = (0, _startOfDay.startOfDay)(start);
  var startOfEnd = (0, _startOfDay.startOfDay)(end);
  return (startOfCandidate.getTime() === startOfStart.getTime() || (0, _isAfter.isAfter)(startOfCandidate, startOfStart)) && (startOfCandidate.getTime() === startOfEnd.getTime() || (0, _isAfter.isAfter)(startOfEnd, startOfCandidate));
};
var timeIsBetween = exports.timeIsBetween = function timeIsBetween(start, candidate, end) {
  return candidate.getHours() >= start.getHours() && candidate.getHours() <= end.getHours();
};