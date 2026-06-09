"use strict";

exports.__esModule = true;
exports.timeIsBetween = exports.isValidDate = exports.isDateObject = exports.hasDateObjectTag = exports.getStartOfDayTimestamp = exports.getDateTimestamp = exports.getDateHour = exports.dateIsBetween = exports.dateHourIsBetween = void 0;
var DateConstructor = Date;
var objectToString = Object.prototype.toString;
var dateGetTime = DateConstructor.prototype.getTime;
var dateGetHours = DateConstructor.prototype.getHours;
var dateSetHours = DateConstructor.prototype.setHours;
var numberIsFinite = Number.isFinite;
var arrayEvery = Array.prototype.every;
var isDateInstance = function isDateInstance(date) {
  try {
    return date instanceof DateConstructor;
  } catch (_unused) {
    return false;
  }
};
var hasDateObjectTag = exports.hasDateObjectTag = function hasDateObjectTag(date) {
  if (isDateInstance(date)) return true;
  if (!date || typeof date !== 'object') return false;
  try {
    return objectToString.call(date) === '[object Date]';
  } catch (_unused2) {
    return false;
  }
};
var isDateObject = exports.isDateObject = function isDateObject(date) {
  if (!hasDateObjectTag(date)) return false;
  try {
    dateGetTime.call(date);
    return true;
  } catch (_unused3) {
    return false;
  }
};
var getDateTimestamp = exports.getDateTimestamp = function getDateTimestamp(date) {
  if (!isDateObject(date)) return Number.NaN;
  return dateGetTime.call(date);
};
var getDateHour = exports.getDateHour = function getDateHour(date) {
  if (!isDateObject(date)) return Number.NaN;
  return dateGetHours.call(date);
};
var getStartOfDayTimestamp = exports.getStartOfDayTimestamp = function getStartOfDayTimestamp(date) {
  var timestamp = getDateTimestamp(date);
  if (!numberIsFinite(timestamp)) return Number.NaN;
  var startOfDay = new DateConstructor(timestamp);
  dateSetHours.call(startOfDay, 0, 0, 0, 0);
  return dateGetTime.call(startOfDay);
};
var isValidDate = exports.isValidDate = function isValidDate(date) {
  return numberIsFinite(getDateTimestamp(date));
};
var allNumbersAreFinite = function allNumbersAreFinite() {
  for (var _len = arguments.length, values = new Array(_len), _key = 0; _key < _len; _key++) {
    values[_key] = arguments[_key];
  }
  return arrayEvery.call(values, numberIsFinite);
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