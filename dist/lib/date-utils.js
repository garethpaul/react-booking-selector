"use strict";

exports.__esModule = true;
exports.timeIsBetween = exports.isValidDate = exports.getStartOfDayTimestamp = exports.getDateTimestamp = exports.getDateHour = exports.dateIsBetween = exports.dateHourIsBetween = void 0;
var getDateTimestamp = exports.getDateTimestamp = function getDateTimestamp(date) {
  return date instanceof Date ? Date.prototype.getTime.call(date) : Number.NaN;
};
var getDateHour = exports.getDateHour = function getDateHour(date) {
  return date instanceof Date ? Date.prototype.getHours.call(date) : Number.NaN;
};
var getStartOfDayTimestamp = exports.getStartOfDayTimestamp = function getStartOfDayTimestamp(date) {
  var timestamp = getDateTimestamp(date);
  if (!Number.isFinite(timestamp)) return Number.NaN;
  var startOfDay = new Date(timestamp);
  Date.prototype.setHours.call(startOfDay, 0, 0, 0, 0);
  return Date.prototype.getTime.call(startOfDay);
};
var isValidDate = exports.isValidDate = function isValidDate(date) {
  return Number.isFinite(getDateTimestamp(date));
};
var allNumbersAreFinite = function allNumbersAreFinite() {
  for (var _len = arguments.length, values = new Array(_len), _key = 0; _key < _len; _key++) {
    values[_key] = arguments[_key];
  }
  return values.every(Number.isFinite);
};

// Helper function that determines if a timestamp is between two other dates.
var dateHourIsBetween = exports.dateHourIsBetween = function dateHourIsBetween(start, candidate, end) {
  var startTimestamp = getDateTimestamp(start);
  var candidateTimestamp = getDateTimestamp(candidate);
  var endTimestamp = getDateTimestamp(end);
  return allNumbersAreFinite(startTimestamp, candidateTimestamp, endTimestamp) && candidateTimestamp >= startTimestamp && candidateTimestamp <= endTimestamp;
};
var dateIsBetween = exports.dateIsBetween = function dateIsBetween(start, candidate, end) {
  var startTimestamp = getStartOfDayTimestamp(start);
  var candidateTimestamp = getStartOfDayTimestamp(candidate);
  var endTimestamp = getStartOfDayTimestamp(end);
  return allNumbersAreFinite(startTimestamp, candidateTimestamp, endTimestamp) && candidateTimestamp >= startTimestamp && candidateTimestamp <= endTimestamp;
};
var timeIsBetween = exports.timeIsBetween = function timeIsBetween(start, candidate, end) {
  var startHour = getDateHour(start);
  var candidateHour = getDateHour(candidate);
  var endHour = getDateHour(end);
  return allNumbersAreFinite(startHour, candidateHour, endHour) && candidateHour >= startHour && candidateHour <= endHour;
};