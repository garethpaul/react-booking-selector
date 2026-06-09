var objectToString = Object.prototype.toString;
var dateGetTime = Date.prototype.getTime;
var dateGetHours = Date.prototype.getHours;
var dateSetHours = Date.prototype.setHours;
var isDateInstance = function isDateInstance(date) {
  try {
    return date instanceof Date;
  } catch (_unused) {
    return false;
  }
};
export var hasDateObjectTag = function hasDateObjectTag(date) {
  if (isDateInstance(date)) return true;
  if (!date || typeof date !== 'object') return false;
  try {
    return objectToString.call(date) === '[object Date]';
  } catch (_unused2) {
    return false;
  }
};
export var isDateObject = function isDateObject(date) {
  if (!hasDateObjectTag(date)) return false;
  try {
    dateGetTime.call(date);
    return true;
  } catch (_unused3) {
    return false;
  }
};
export var getDateTimestamp = function getDateTimestamp(date) {
  if (!isDateObject(date)) return Number.NaN;
  return dateGetTime.call(date);
};
export var getDateHour = function getDateHour(date) {
  if (!isDateObject(date)) return Number.NaN;
  return dateGetHours.call(date);
};
export var getStartOfDayTimestamp = function getStartOfDayTimestamp(date) {
  var timestamp = getDateTimestamp(date);
  if (!Number.isFinite(timestamp)) return Number.NaN;
  var startOfDay = new Date(timestamp);
  dateSetHours.call(startOfDay, 0, 0, 0, 0);
  return dateGetTime.call(startOfDay);
};
export var isValidDate = function isValidDate(date) {
  return Number.isFinite(getDateTimestamp(date));
};
var allNumbersAreFinite = function allNumbersAreFinite() {
  for (var _len = arguments.length, values = new Array(_len), _key = 0; _key < _len; _key++) {
    values[_key] = arguments[_key];
  }
  return values.every(Number.isFinite);
};

// Helper function that determines if a timestamp is between two other dates.
export var dateHourIsBetween = function dateHourIsBetween(start, candidate, end) {
  var startTimestamp = getDateTimestamp(start);
  var candidateTimestamp = getDateTimestamp(candidate);
  var endTimestamp = getDateTimestamp(end);
  return allNumbersAreFinite(startTimestamp, candidateTimestamp, endTimestamp) && candidateTimestamp >= startTimestamp && candidateTimestamp <= endTimestamp;
};
export var dateIsBetween = function dateIsBetween(start, candidate, end) {
  var startTimestamp = getStartOfDayTimestamp(start);
  var candidateTimestamp = getStartOfDayTimestamp(candidate);
  var endTimestamp = getStartOfDayTimestamp(end);
  return allNumbersAreFinite(startTimestamp, candidateTimestamp, endTimestamp) && candidateTimestamp >= startTimestamp && candidateTimestamp <= endTimestamp;
};
export var timeIsBetween = function timeIsBetween(start, candidate, end) {
  var startHour = getDateHour(start);
  var candidateHour = getDateHour(candidate);
  var endHour = getDateHour(end);
  return allNumbersAreFinite(startHour, candidateHour, endHour) && candidateHour >= startHour && candidateHour <= endHour;
};