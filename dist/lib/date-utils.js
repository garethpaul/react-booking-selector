"use strict";

exports.__esModule = true;
exports.timeIsBetween = exports.dateIsBetween = exports.dateHourIsBetween = void 0;
var _isAfter = require("date-fns/isAfter");
var _isValid = require("date-fns/isValid");
var _startOfDay = require("date-fns/startOfDay");
var allDatesAreValid = function allDatesAreValid() {
  for (var _len = arguments.length, dates = new Array(_len), _key = 0; _key < _len; _key++) {
    dates[_key] = arguments[_key];
  }
  return dates.every(function (date) {
    return date instanceof Date && (0, _isValid.isValid)(date);
  });
};

// Helper function that uses date-fns methods to determine if a date is between two other dates
var dateHourIsBetween = exports.dateHourIsBetween = function dateHourIsBetween(start, candidate, end) {
  return allDatesAreValid(start, candidate, end) && (candidate.getTime() === start.getTime() || (0, _isAfter.isAfter)(candidate, start)) && (candidate.getTime() === end.getTime() || (0, _isAfter.isAfter)(end, candidate));
};
var dateIsBetween = exports.dateIsBetween = function dateIsBetween(start, candidate, end) {
  if (!allDatesAreValid(start, candidate, end)) return false;
  var startOfCandidate = (0, _startOfDay.startOfDay)(candidate);
  var startOfStart = (0, _startOfDay.startOfDay)(start);
  var startOfEnd = (0, _startOfDay.startOfDay)(end);
  return (startOfCandidate.getTime() === startOfStart.getTime() || (0, _isAfter.isAfter)(startOfCandidate, startOfStart)) && (startOfCandidate.getTime() === startOfEnd.getTime() || (0, _isAfter.isAfter)(startOfEnd, startOfCandidate));
};
var timeIsBetween = exports.timeIsBetween = function timeIsBetween(start, candidate, end) {
  return allDatesAreValid(start, candidate, end) && candidate.getHours() >= start.getHours() && candidate.getHours() <= end.getHours();
};