var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5, _templateObject6, _templateObject7, _templateObject8, _templateObject9, _templateObject0;
function _inheritsLoose(t, o) { t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _taggedTemplateLiteralLoose(e, t) { return t || (t = e.slice(0)), e.raw = t, e; }
import * as React from 'react';
import { format as formatDate } from 'date-fns/format';
import styled from './styled.js';
import { Text, Subtitle } from './typography.js';
import colors from './colors.js';
import { getDateTimestamp as readDateTimestamp, hasDateObjectTag } from './date-utils.js';
import selectionSchemes from './selection-schemes/index.js';
var DEFAULT_DATE_FORMAT = 'd';
var DEFAULT_ARIA_LABEL = 'Booking time slots';
var isSelectionType = function isSelectionType(value) {
  return value === 'add' || value === 'remove';
};
var getSelectionScheme = function getSelectionScheme(selectionScheme) {
  return selectionScheme === 'linear' || selectionScheme === 'square' ? selectionScheme : 'square';
};
var toCssUnit = function toCssUnit(value) {
  if (value == null) return '0px';
  if (typeof value === 'number' && !numberIsFinite(value)) return '0px';
  if (typeof value === 'number') return value + "px";
  if (typeof value !== 'string') return '0px';
  var cssValue = value.trim();
  if (!cssValue) return '0px';
  return /^-?\d+(\.\d+)?$/.test(cssValue) ? cssValue + "px" : cssValue;
};
var toCssColor = function toCssColor(value, fallback) {
  if (typeof value !== 'string') return fallback;
  var colorValue = value.trim();
  return colorValue || fallback;
};
var getNonEmptyString = function getNonEmptyString(value) {
  if (typeof value !== 'string') return undefined;
  var trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : undefined;
};
var DateConstructor = Date;
var invalidDate = function invalidDate() {
  return new DateConstructor(NaN);
};
var dateGetTime = DateConstructor.prototype.getTime;
var dateGetFullYear = DateConstructor.prototype.getFullYear;
var dateGetMonth = DateConstructor.prototype.getMonth;
var dateGetDate = DateConstructor.prototype.getDate;
var dateGetHours = DateConstructor.prototype.getHours;
var dateSetDate = DateConstructor.prototype.setDate;
var dateSetHours = DateConstructor.prototype.setHours;
var dateNow = DateConstructor.now;
var ArrayConstructor = Array;
var MapConstructor = Map;
var SetConstructor = Set;
var arrayFrom = ArrayConstructor.from;
var arrayFilter = Array.prototype.filter;
var arrayForEach = Array.prototype.forEach;
var arrayJoin = Array.prototype.join;
var arrayMap = Array.prototype.map;
var arraySort = Array.prototype.sort;
var isArray = ArrayConstructor.isArray;
var numberIsFinite = Number.isFinite;
var mathFloor = Math.floor;
var getCurrentTimestamp = function getCurrentTimestamp() {
  try {
    if (typeof Date.now === 'function') {
      var timestamp = Date.now();
      if (numberIsFinite(timestamp)) return timestamp;
    }
  } catch (_unused) {
    // Fall back to the captured Date.now below.
  }
  return dateNow.call(DateConstructor);
};
var getDateTimestamp = function getDateTimestamp(value) {
  var timestamp = readDateTimestamp(value);
  return numberIsFinite(timestamp) ? timestamp : null;
};
var cloneDate = function cloneDate(date) {
  return new DateConstructor(dateGetTime.call(date));
};
var startOfDayDate = function startOfDayDate(date) {
  var startTime = cloneDate(date);
  dateSetHours.call(startTime, 0, 0, 0, 0);
  return startTime;
};
var addDaysToDate = function addDaysToDate(value, amount) {
  var date = cloneDate(value);
  if (amount !== 0) {
    dateSetDate.call(date, dateGetDate.call(date) + amount);
  }
  return date;
};
var toDate = function toDate(value) {
  if (value == null) return invalidDate();
  if (hasDateObjectTag(value)) {
    var timestamp = getDateTimestamp(value);
    return timestamp == null ? invalidDate() : new DateConstructor(timestamp);
  }
  if (typeof value === 'string' || typeof value === 'number') return new DateConstructor(value);
  if (typeof value !== 'object') return invalidDate();
  try {
    var primitiveValue = value.valueOf();
    return typeof primitiveValue === 'number' ? new DateConstructor(primitiveValue) : invalidDate();
  } catch (_unused2) {
    return invalidDate();
  }
};
var normalizeDates = function normalizeDates(dates) {
  var dateValues = isArray(dates) ? dates : [];
  return arrayFilter.call(arrayMap.call(dateValues, toDate), function (date) {
    return getDateTimestamp(date) != null;
  });
};
var dateMinuteKey = function dateMinuteKey(value) {
  return mathFloor(dateGetTime.call(value) / 60000);
};
var getValidDate = function getValidDate(value) {
  return getDateTimestamp(value) == null ? null : value;
};
var getDateMinuteKey = function getDateMinuteKey(value) {
  var validDate = getValidDate(value);
  return validDate ? dateMinuteKey(validDate) : null;
};
var hasDateMinuteKey = function hasDateMinuteKey(dateMinuteKeys, time) {
  var key = getDateMinuteKey(time);
  return key != null && dateMinuteKeys.has(key);
};
var getDateMinuteSetSignature = function getDateMinuteSetSignature(dates) {
  var dateMinuteKeys = arrayFrom.call(ArrayConstructor, new SetConstructor(arrayMap.call(normalizeDates(dates), dateMinuteKey)));
  arraySort.call(dateMinuteKeys, function (a, b) {
    return a - b;
  });
  return arrayJoin.call(dateMinuteKeys, '|');
};
var getDateMinuteKeySet = function getDateMinuteKeySet(dates) {
  return new SetConstructor(arrayMap.call(normalizeDates(dates), dateMinuteKey));
};
var uniqueDatesByMinute = function uniqueDatesByMinute(dates) {
  var dateMinuteKeys = new SetConstructor();
  var uniqueDates = [];
  arrayForEach.call(dates, function (date) {
    var key = dateMinuteKey(date);
    if (dateMinuteKeys.has(key)) return;
    dateMinuteKeys.add(key);
    uniqueDates.push(date);
  });
  return uniqueDates;
};
var concatDates = function concatDates(firstDates, secondDates) {
  var dates = [];
  arrayForEach.call(firstDates, function (date) {
    dates.push(date);
  });
  arrayForEach.call(secondDates, function (date) {
    dates.push(date);
  });
  return dates;
};
var normalizeSelectionDraft = function normalizeSelectionDraft(dates) {
  return uniqueDatesByMinute(normalizeDates(dates));
};
var getDateListSignature = function getDateListSignature(dates) {
  return arrayJoin.call(arrayMap.call(normalizeSelectionDraft(dates), dateKey), '|');
};
var getStartDate = function getStartDate(startDate) {
  var timestamp = getDateTimestamp(startDate);
  return timestamp == null ? new DateConstructor(getCurrentTimestamp()) : new DateConstructor(timestamp);
};
var getNumberSignaturePart = function getNumberSignaturePart(value) {
  return typeof value === 'number' ? "number:" + value : "invalid:" + typeof value;
};
var getDateGridSignature = function getDateGridSignature(_ref) {
  var startDate = _ref.startDate,
    numDays = _ref.numDays,
    minTime = _ref.minTime,
    maxTime = _ref.maxTime;
  return arrayJoin.call([dateMinuteKey(startOfDayDate(getStartDate(startDate))), getNumberSignaturePart(numDays), getNumberSignaturePart(minTime), getNumberSignaturePart(maxTime)], '|');
};
var isWholeNumber = function isWholeNumber(value) {
  return numberIsFinite(value) && mathFloor(value) === value;
};
var getVisibleHours = function getVisibleHours(minTime, maxTime) {
  if (!isWholeNumber(minTime) || !isWholeNumber(maxTime) || minTime < 0 || maxTime > 23 || minTime > maxTime) {
    return [];
  }
  var hours = [];
  for (var h = minTime; h <= maxTime; h += 1) {
    hours.push(h);
  }
  return hours;
};
var createLocalTime = function createLocalTime(day, hour) {
  return new DateConstructor(dateGetFullYear.call(day), dateGetMonth.call(day), dateGetDate.call(day), hour, 0, 0, 0);
};
var localTimeExists = function localTimeExists(day, hour, time) {
  return dateGetFullYear.call(time) === dateGetFullYear.call(day) && dateGetMonth.call(time) === dateGetMonth.call(day) && dateGetDate.call(time) === dateGetDate.call(day) && dateGetHours.call(time) === hour;
};
var createDateSlotTime = function createDateSlotTime(day, hour, createTime) {
  try {
    var time = createTime(day, hour);
    var timestamp = getDateTimestamp(time);
    if (timestamp == null) return null;
    var slotTime = new DateConstructor(timestamp);
    return localTimeExists(day, hour, slotTime) ? slotTime : null;
  } catch (_unused3) {
    return null;
  }
};
export var buildDateColumns = function buildDateColumns(_ref2, createTime) {
  var startDate = _ref2.startDate,
    numDays = _ref2.numDays,
    minTime = _ref2.minTime,
    maxTime = _ref2.maxTime;
  if (createTime === void 0) {
    createTime = createLocalTime;
  }
  if (!isWholeNumber(numDays) || numDays <= 0) return [];
  var startTime = startOfDayDate(getStartDate(startDate));
  var visibleHours = getVisibleHours(minTime, maxTime);
  if (visibleHours.length === 0) return [];
  var dateColumns = [];
  var _loop = function _loop() {
    var day = addDaysToDate(startTime, d);
    var slots = [];
    arrayForEach.call(visibleHours, function (h) {
      slots.push({
        hour: h,
        time: createDateSlotTime(day, h, createTime)
      });
    });
    dateColumns.push({
      day: day,
      slots: slots
    });
  };
  for (var d = 0; d < numDays; d += 1) {
    _loop();
  }
  return dateColumns;
};
export var buildDates = function buildDates(dateGridProps, createTime) {
  if (createTime === void 0) {
    createTime = createLocalTime;
  }
  var dates = [];
  arrayForEach.call(buildDateColumns(dateGridProps, createTime), function (dateColumn) {
    var columnDates = [];
    arrayForEach.call(dateColumn.slots, function (slot) {
      if (slot.time) columnDates.push(slot.time);
    });
    dates.push(columnDates);
  });
  return dates;
};
var formatHour = function formatHour(hour) {
  var h = hour === 0 || hour === 12 || hour === 24 ? 12 : hour % 12;
  var abb = hour < 12 || hour === 24 ? 'am' : 'pm';
  return h + " " + abb;
};
var formatCellLabel = function formatCellLabel(time, selected, blocked) {
  var state = blocked ? 'Blocked' : selected ? 'Selected' : 'Available';
  return state + " " + formatDate(time, 'EEEE, MMMM d, yyyy') + " at " + formatHour(dateGetHours.call(time));
};
var formatDateHeader = function formatDateHeader(time, dateFormat) {
  try {
    return formatDate(time, dateFormat);
  } catch (_unused4) {
    return formatDate(time, DEFAULT_DATE_FORMAT);
  }
};
var getDateColumnSlots = function getDateColumnSlots(dateColumn) {
  return dateColumn && isArray(dateColumn.slots) ? dateColumn.slots : [];
};
var getDateSlotTime = function getDateSlotTime(dateSlot) {
  return dateSlot ? getValidDate(dateSlot.time) : null;
};
var findDateSlotPosition = function findDateSlotPosition(dateColumns, time) {
  var targetKey = getDateKey(time);
  if (targetKey == null) return null;
  for (var columnIndex = 0; columnIndex < dateColumns.length; columnIndex += 1) {
    var dateColumn = dateColumns[columnIndex];
    var slots = getDateColumnSlots(dateColumn);
    for (var slotIndex = 0; slotIndex < slots.length; slotIndex += 1) {
      var slotTime = getDateSlotTime(slots[slotIndex]);
      if (slotTime && dateKey(slotTime) === targetKey) return {
        columnIndex: columnIndex,
        slotIndex: slotIndex
      };
    }
  }
  return null;
};
var getHorizontalKeyboardNavigationTarget = function getHorizontalKeyboardNavigationTarget(dateColumns, position, direction, blockedMinuteKeys) {
  for (var targetColumnIndex = position.columnIndex + direction; targetColumnIndex >= 0 && targetColumnIndex < dateColumns.length; targetColumnIndex += direction) {
    var targetColumn = dateColumns[targetColumnIndex];
    var targetTime = getDateSlotTime(getDateColumnSlots(targetColumn)[position.slotIndex]);
    if (targetTime && !hasDateMinuteKey(blockedMinuteKeys, targetTime)) return targetTime;
  }
  return null;
};
var getVerticalKeyboardNavigationTarget = function getVerticalKeyboardNavigationTarget(dateColumn, slotIndex, direction, blockedMinuteKeys) {
  var slots = getDateColumnSlots(dateColumn);
  for (var nextSlotIndex = slotIndex + direction; nextSlotIndex >= 0; nextSlotIndex += direction) {
    if (nextSlotIndex >= slots.length) return null;
    var nextTime = getDateSlotTime(slots[nextSlotIndex]);
    if (nextTime && !hasDateMinuteKey(blockedMinuteKeys, nextTime)) return nextTime;
  }
  return null;
};
var getRowEdgeKeyboardNavigationTarget = function getRowEdgeKeyboardNavigationTarget(dateColumns, slotIndex, direction, blockedMinuteKeys) {
  var columnIndex = direction === 1 ? 0 : dateColumns.length - 1;
  while (columnIndex >= 0 && columnIndex < dateColumns.length) {
    var targetTime = getDateSlotTime(getDateColumnSlots(dateColumns[columnIndex])[slotIndex]);
    if (targetTime && !hasDateMinuteKey(blockedMinuteKeys, targetTime)) return targetTime;
    columnIndex += direction;
  }
  return null;
};
var getGridEdgeKeyboardNavigationTarget = function getGridEdgeKeyboardNavigationTarget(dateColumns, direction, blockedMinuteKeys) {
  var columnIndex = direction === 1 ? 0 : dateColumns.length - 1;
  while (columnIndex >= 0 && columnIndex < dateColumns.length) {
    var slots = getDateColumnSlots(dateColumns[columnIndex]);
    var slotIndex = direction === 1 ? 0 : slots.length - 1;
    while (slotIndex >= 0 && slotIndex < slots.length) {
      var targetTime = getDateSlotTime(slots[slotIndex]);
      if (targetTime && !hasDateMinuteKey(blockedMinuteKeys, targetTime)) return targetTime;
      slotIndex += direction;
    }
    columnIndex += direction;
  }
  return null;
};
export var getKeyboardNavigationTarget = function getKeyboardNavigationTarget(dateColumns, time, key, blockedMinuteKeys, controlKey) {
  if (blockedMinuteKeys === void 0) {
    blockedMinuteKeys = new SetConstructor();
  }
  if (controlKey === void 0) {
    controlKey = false;
  }
  var position = findDateSlotPosition(dateColumns, time);
  if (!position) return null;
  if (key === 'Home' || key === 'End') {
    var direction = key === 'Home' ? 1 : -1;
    return controlKey ? getGridEdgeKeyboardNavigationTarget(dateColumns, direction, blockedMinuteKeys) : getRowEdgeKeyboardNavigationTarget(dateColumns, position.slotIndex, direction, blockedMinuteKeys);
  }
  if (key === 'ArrowRight' || key === 'ArrowLeft') {
    return getHorizontalKeyboardNavigationTarget(dateColumns, position, key === 'ArrowRight' ? 1 : -1, blockedMinuteKeys);
  }
  if (key === 'ArrowDown') {
    return getVerticalKeyboardNavigationTarget(dateColumns[position.columnIndex], position.slotIndex, 1, blockedMinuteKeys);
  }
  if (key === 'ArrowUp') {
    return getVerticalKeyboardNavigationTarget(dateColumns[position.columnIndex], position.slotIndex, -1, blockedMinuteKeys);
  }
  return null;
};
var isKeyboardNavigationKey = function isKeyboardNavigationKey(key) {
  return key === 'ArrowRight' || key === 'ArrowLeft' || key === 'ArrowDown' || key === 'ArrowUp' || key === 'Home' || key === 'End';
};
var hasKeyboardControlModifier = function hasKeyboardControlModifier(event) {
  try {
    return Boolean(event && event.ctrlKey === true);
  } catch (_unused5) {
    return false;
  }
};
var hasUnsupportedKeyboardModifier = function hasUnsupportedKeyboardModifier(event) {
  try {
    return Boolean(event && (event.altKey === true || event.metaKey === true || event.shiftKey === true));
  } catch (_unused6) {
    return true;
  }
};
var isKeyboardSelectionKey = function isKeyboardSelectionKey(key) {
  return key === 'Enter' || key === ' ' || key === 'Spacebar';
};
var isPrimaryMouseButton = function isPrimaryMouseButton(event) {
  return !event || event.button == null || event.button === 0;
};
var dateKey = function dateKey(time) {
  return dateGetTime.call(time);
};
var getDateKey = function getDateKey(time) {
  var validDate = getValidDate(time);
  return validDate ? dateKey(validDate) : null;
};
var TOUCH_MOUSE_SUPPRESSION_MS = 500;
var Wrapper = styled.div(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["\n  box-sizing: border-box;\n  display: flex;\n  align-items: center;\n  width: 100%;\n  min-width: 0;\n  user-select: none;\n"])));
var Grid = styled.div(_templateObject2 || (_templateObject2 = _taggedTemplateLiteralLoose(["\n  box-sizing: border-box;\n  display: flex;\n  flex-direction: row;\n  align-items: stretch;\n  width: 100%;\n  min-width: 0;\n"])));
var Column = styled.div(_templateObject3 || (_templateObject3 = _taggedTemplateLiteralLoose(["\n  display: flex;\n  flex-direction: column;\n  justify-content: space-evenly;\n  flex: 1 1 0;\n  min-width: 0;\n"])));
var TimeColumn = styled(Column)(_templateObject4 || (_templateObject4 = _taggedTemplateLiteralLoose(["\n  flex: 0 0 52px;\n  max-width: 52px;\n  @media (max-width: 699px) {\n    flex-basis: 32px;\n    max-width: 32px;\n  }\n"])));
export var GridCell = styled.div(_templateObject5 || (_templateObject5 = _taggedTemplateLiteralLoose(["\n  box-sizing: border-box;\n  display: block;\n  align-self: stretch;\n  width: auto;\n  max-width: none;\n  min-width: 0;\n  max-height: none;\n  min-height: 0;\n  margin: ", ";\n  height: ", ";\n  padding: 0;\n  border: 0;\n  appearance: none;\n  -webkit-appearance: none;\n  background: transparent;\n  color: inherit;\n  ", "\n  font: inherit;\n  opacity: 1;\n  ", "\n  &:focus {\n    outline: 2px solid ", ";\n    outline-offset: 2px;\n    border-radius: 6px;\n  }\n  &:focus:not(:focus-visible) {\n    outline: none;\n  }\n  &:focus-visible {\n    outline: 2px solid ", ";\n    outline-offset: 2px;\n    border-radius: 6px;\n  }\n"])), function (props) {
  return toCssUnit(props.$margin);
}, function (props) {
  return toCssUnit(props.$height);
}, function (props) {
  return props.$interactive && "cursor: " + (props.$blocked ? 'not-allowed' : 'pointer') + ";";
}, function (props) {
  return props.$touchActionEnabled && 'touch-action: none;';
}, colors.blue, colors.blue);

// Style the Date Cell
var DateCell = styled.div(_templateObject6 || (_templateObject6 = _taggedTemplateLiteralLoose(["\n  width: 100%;\n  height: 100%;\n  border-radius: 4px;\n  transition:\n    background-color 120ms ease,\n    transform 120ms ease;\n  ", "\n  ", "\n  ", "\n  &:hover {\n    background-color: ", ";\n  }\n"])), function (props) {
  return props.$selected && !props.$blocked && "background-color: " + toCssColor(props.$selectedColor, colors.blue) + ";";
}, function (props) {
  return !props.$selected && !props.$blocked && "background-color: " + toCssColor(props.$unselectedColor, colors.paleBlue) + ";";
}, function (props) {
  return props.$blocked && "background-color: " + toCssColor(props.$blockedColor, colors.black) + ";";
}, function (props) {
  return props.$blocked ? toCssColor(props.$blockedColor, colors.black) : props.$selected ? toCssColor(props.$selectedColor, colors.blue) : toCssColor(props.$hoveredColor, colors.lightBlue);
});
var DateLabel = styled(Subtitle)(_templateObject7 || (_templateObject7 = _taggedTemplateLiteralLoose(["\n  height: 20px;\n  font-size: 19px;\n  line-height: 1;\n  margin: 0px;\n  margin-top: 5px;\n  padding: 0px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  @media (max-width: 699px) {\n    height: 15px;\n    font-size: 12px;\n  }\n"])));
var DayLabel = styled(Subtitle)(_templateObject8 || (_templateObject8 = _taggedTemplateLiteralLoose(["\n  height: 15px;\n  font-size: 10px;\n  line-height: 1;\n  margin: 0px;\n  padding: 0px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  @media (max-width: 699px) {\n    font-size: 8px;\n  }\n"])));
var TimeLabelCell = styled.div(_templateObject9 || (_templateObject9 = _taggedTemplateLiteralLoose(["\n  position: relative;\n  box-sizing: border-box;\n  width: 100%;\n  height: 40px;\n  padding-right: 15px;\n  display: flex;\n  justify-content: flex-end;\n  align-items: center;\n  color: rgb(112, 117, 122);\n  @media (max-width: 699px) {\n    padding-right: 6px;\n  }\n"])));
var TimeText = styled(Text)(_templateObject0 || (_templateObject0 = _taggedTemplateLiteralLoose(["\n  margin: 0;\n  font-size: 11px;\n  @media (max-width: 699px) {\n    font-size: 8px;\n  }\n  text-align: right;\n  text-transform: uppercase;\n"])));
export var preventScroll = function preventScroll(e) {
  preventDefault(e);
};
var preventDefault = function preventDefault(event) {
  if (!event) return;
  var preventDefaultHandler;
  try {
    preventDefaultHandler = event.preventDefault;
  } catch (_unused7) {
    return;
  }
  if (typeof preventDefaultHandler === 'function') {
    try {
      preventDefaultHandler.call(event);
    } catch (_unused8) {
      // Ignore non-standard event objects that expose throwing default prevention.
    }
  }
};
var getBrowserDocument = function getBrowserDocument() {
  try {
    if (typeof window === 'undefined') return null;
    var browserDocument = window.document;
    return browserDocument && typeof browserDocument === 'object' ? browserDocument : null;
  } catch (_unused9) {
    return null;
  }
};
var getParentElement = function getParentElement(target) {
  try {
    var parentElement = target.parentElement;
    return parentElement && typeof parentElement === 'object' ? parentElement : null;
  } catch (_unused0) {
    return null;
  }
};
var getOwnerDocument = function getOwnerDocument(target) {
  if (!target || typeof target !== 'object') return null;
  try {
    var ownerDocument = target.ownerDocument;
    return ownerDocument && typeof ownerDocument === 'object' ? ownerDocument : null;
  } catch (_unused1) {
    return null;
  }
};
var BookingSelector = /*#__PURE__*/function (_React$Component) {
  function BookingSelector(props) {
    var _this;
    _this = _React$Component.call(this, props) || this;
    _this.dates = void 0;
    _this.selectionSchemeHandlers = void 0;
    _this.cellToDate = void 0;
    _this.dateToCell = void 0;
    _this.touchScrollCells = void 0;
    _this.gridRef = void 0;
    _this.lastTouchEventTime = void 0;
    _this.blockedMinuteKeys = void 0;
    _this.selectedMinuteKeys = void 0;
    _this.documentMouseUpTarget = void 0;
    _this.renderTimeLabels = function () {
      var labels = [/*#__PURE__*/React.createElement(GridCell, {
        $height: "40",
        key: -1
      })]; // Ensures time labels start at correct location
      arrayForEach.call(getVisibleHours(_this.props.minTime, _this.props.maxTime), function (t) {
        labels.push(/*#__PURE__*/React.createElement(TimeLabelCell, {
          key: t
        }, /*#__PURE__*/React.createElement(TimeText, null, formatHour(t))));
      });
      return /*#__PURE__*/React.createElement(TimeColumn, {
        "aria-hidden": "true"
      }, labels);
    };
    _this.renderDateColumn = function (dateColumn, blockedMinuteKeys, selectedMinuteKeys) {
      return /*#__PURE__*/React.createElement(Column, {
        key: dateKey(dateColumn.day)
      }, /*#__PURE__*/React.createElement(GridCell, {
        $height: "50",
        $margin: _this.props.margin,
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement(DayLabel, null, formatDate(dateColumn.day, 'EEE').toUpperCase()), /*#__PURE__*/React.createElement(DateLabel, null, formatDateHeader(dateColumn.day, _this.props.dateFormat))), arrayMap.call(dateColumn.slots, function (slot) {
        return slot.time ? _this.renderDateCellWrapperWithLookups(slot.time, blockedMinuteKeys, selectedMinuteKeys) : _this.renderDateCellPlaceholder(dateColumn.day, slot.hour);
      }));
    };
    _this.renderDateCellPlaceholder = function (day, hour) {
      return /*#__PURE__*/React.createElement(GridCell, {
        $height: "40px",
        $margin: _this.props.margin,
        "aria-hidden": "true",
        key: dateKey(day) + "-" + hour
      });
    };
    _this.renderDateCellWrapper = function (time) {
      return _this.renderDateCellWrapperWithLookups(time, _this.blockedMinuteKeys, _this.selectedMinuteKeys);
    };
    _this.renderDateCellWrapperWithLookups = function (time, blockedMinuteKeys, selectedMinuteKeys) {
      var blocked = hasDateMinuteKey(blockedMinuteKeys, time);
      var selected = !blocked && hasDateMinuteKey(selectedMinuteKeys, time);
      var mouseStartHandler = function mouseStartHandler(event) {
        if (!blocked) _this.handleMouseDownEvent(time, event);
      };
      var touchStartHandler = function touchStartHandler() {
        if (!blocked) _this.handleTouchStartEvent(time);
      };
      var mouseEnterHandler = function mouseEnterHandler() {
        if (!blocked) _this.handleMouseEnterEvent(time);
      };
      var mouseUpHandler = function mouseUpHandler(event) {
        if (!blocked) _this.handleMouseUpEvent(time, event);
      };
      var currentDateCell = null;
      var refSetter = function refSetter(dateCell) {
        if (currentDateCell && currentDateCell !== dateCell) {
          _this.unregisterDateCell(currentDateCell);
        }
        if (dateCell) {
          _this.registerDateCell(dateCell, time, !blocked);
        }
        currentDateCell = dateCell;
      };
      return /*#__PURE__*/React.createElement(GridCell, {
        as: "button",
        className: "rgdp__grid-cell",
        type: "button",
        disabled: blocked,
        "aria-label": formatCellLabel(time, selected, blocked),
        "aria-pressed": selected,
        $height: "40px",
        $blocked: blocked,
        $interactive: true,
        $touchActionEnabled: !blocked,
        $margin: _this.props.margin,
        key: dateKey(time),
        ref: refSetter
        // Mouse handlers
        ,
        onMouseDown: mouseStartHandler,
        onMouseEnter: mouseEnterHandler,
        onMouseUp: mouseUpHandler
        // Touch handlers
        // Since touch events fire on the event where the touch-drag started, there's no point in passing
        // in the time parameter, instead these handlers will do their job using the default SyntheticEvent
        // parameters
        ,
        onTouchStart: touchStartHandler,
        onTouchMove: _this.handleTouchMoveEvent,
        onTouchEnd: _this.handleTouchEndEvent,
        onTouchCancel: _this.handleTouchCancelEvent,
        onKeyDown: function onKeyDown(event) {
          _this.handleCellKeyDownEvent(event, time, blocked);
        }
      }, _this.renderDateCell(time, selected, blocked));
    };
    _this.renderDateCell = function (time, selected, blocked) {
      if (typeof _this.props.renderDateCell === 'function') {
        return _this.props.renderDateCell(new DateConstructor(dateGetTime.call(time)), selected, blocked);
      }
      return /*#__PURE__*/React.createElement(DateCell, {
        $blocked: blocked,
        $selected: selected,
        $selectedColor: _this.props.selectedColor,
        $unselectedColor: _this.props.unselectedColor,
        $hoveredColor: _this.props.hoveredColor,
        $blockedColor: _this.props.blockedColor
      });
    };
    _this.cellToDate = new MapConstructor();
    _this.dateToCell = new MapConstructor();
    _this.touchScrollCells = new SetConstructor();
    _this.lastTouchEventTime = null;
    _this.documentMouseUpTarget = null;
    var selectionDraft = normalizeSelectionDraft(_this.props.selection);
    var selectionPropSignature = getDateMinuteSetSignature(_this.props.selection);
    var selectionPropListSignature = getDateListSignature(_this.props.selection);
    var blockedPropSignature = getDateMinuteSetSignature(_this.props.blocked);
    var dateGridPropSignature = getDateGridSignature(_this.props);
    var selectionSchemePropSignature = getSelectionScheme(_this.props.selectionScheme);
    _this.state = {
      selectionDraft: selectionDraft,
      selectionBase: selectionDraft,
      selectionPropSignature: selectionPropSignature,
      selectionPropListSignature: selectionPropListSignature,
      blockedPropSignature: blockedPropSignature,
      dateGridPropSignature: dateGridPropSignature,
      selectionSchemePropSignature: selectionSchemePropSignature,
      selectionType: null,
      selectionStart: null,
      isTouchDragging: false
    };
    _this.selectionSchemeHandlers = {
      linear: selectionSchemes.linear,
      square: selectionSchemes.square
    };
    _this.refreshInstanceLookups(_this.props, selectionDraft);
    _this.endSelection = _this.endSelection.bind(_this);
    _this.handleMouseDownEvent = _this.handleMouseDownEvent.bind(_this);
    _this.handleMouseUpEvent = _this.handleMouseUpEvent.bind(_this);
    _this.handleMouseEnterEvent = _this.handleMouseEnterEvent.bind(_this);
    _this.handleTouchStartEvent = _this.handleTouchStartEvent.bind(_this);
    _this.handleTouchMoveEvent = _this.handleTouchMoveEvent.bind(_this);
    _this.handleTouchEndEvent = _this.handleTouchEndEvent.bind(_this);
    _this.handleTouchCancelEvent = _this.handleTouchCancelEvent.bind(_this);
    _this.handleSelectionStartEvent = _this.handleSelectionStartEvent.bind(_this);
    _this.handleDocumentMouseUpEvent = _this.handleDocumentMouseUpEvent.bind(_this);
    _this.handleCellKeyDownEvent = _this.handleCellKeyDownEvent.bind(_this);
    return _this;
  }
  _inheritsLoose(BookingSelector, _React$Component);
  BookingSelector.getDerivedStateFromProps = function getDerivedStateFromProps(props, state) {
    var selectionPropSignature = getDateMinuteSetSignature(props.selection);
    var selectionPropListSignature = getDateListSignature(props.selection);
    var blockedPropSignature = getDateMinuteSetSignature(props.blocked);
    var dateGridPropSignature = getDateGridSignature(props);
    var selectionSchemePropSignature = getSelectionScheme(props.selectionScheme);
    var selectionIsActive = isSelectionType(state.selectionType) && getValidDate(state.selectionStart) != null;
    if (selectionPropSignature === state.selectionPropSignature && (selectionPropListSignature === state.selectionPropListSignature || selectionIsActive) && blockedPropSignature === state.blockedPropSignature && dateGridPropSignature === state.dateGridPropSignature && selectionSchemePropSignature === state.selectionSchemePropSignature) {
      return null;
    }
    var selectionDraft = normalizeSelectionDraft(props.selection);
    return {
      selectionDraft: selectionDraft,
      selectionBase: selectionDraft,
      selectionPropSignature: selectionPropSignature,
      selectionPropListSignature: selectionPropListSignature,
      blockedPropSignature: blockedPropSignature,
      dateGridPropSignature: dateGridPropSignature,
      selectionSchemePropSignature: selectionSchemePropSignature,
      selectionType: null,
      selectionStart: null,
      isTouchDragging: false
    };
  };
  var _proto = BookingSelector.prototype;
  _proto.componentDidMount = function componentDidMount() {
    // We need to add the endSelection event listener to the document itself in order
    // to catch the cases where the users ends their mouse-click somewhere besides
    // the date cells (in which case none of the DateCell's onMouseUp handlers would fire)
    //
    // This isn't necessary for touch events since the `touchend` event fires on
    // the element where the touch/drag started so it's always caught.
    this.syncDocumentMouseUpListener();
  };
  _proto.componentDidUpdate = function componentDidUpdate() {
    this.syncDocumentMouseUpListener();
    this.refreshInstanceLookups(this.props, this.state.selectionDraft);
  };
  _proto.componentWillUnmount = function componentWillUnmount() {
    this.removeDocumentMouseUpListener();
    this.cellToDate.forEach(function (value, dateCell) {
      if (dateCell && typeof dateCell.removeEventListener === 'function') {
        try {
          dateCell.removeEventListener('touchmove', preventScroll);
        } catch (_unused10) {
          // Ignore cleanup failures from stale or non-standard registered cells.
        }
      }
    });
    this.cellToDate.clear();
    this.dateToCell.clear();
    this.touchScrollCells.clear();
  };
  _proto.removeDocumentMouseUpListener = function removeDocumentMouseUpListener() {
    var browserDocument = this.documentMouseUpTarget;
    this.documentMouseUpTarget = null;
    if (!browserDocument || typeof browserDocument.removeEventListener !== 'function') return;
    try {
      browserDocument.removeEventListener('mouseup', this.handleDocumentMouseUpEvent);
    } catch (_unused11) {
      // Continue lifecycle cleanup even if the retained document cannot remove listeners.
    }
  };
  _proto.syncDocumentMouseUpListener = function syncDocumentMouseUpListener() {
    var browserDocument = this.getDocument();
    if (browserDocument === this.documentMouseUpTarget) return;
    this.removeDocumentMouseUpListener();
    if (!browserDocument || typeof browserDocument.addEventListener !== 'function') return;
    try {
      browserDocument.addEventListener('mouseup', this.handleDocumentMouseUpEvent);
      this.documentMouseUpTarget = browserDocument;
    } catch (_unused12) {
      // Continue lifecycle updates in non-standard hosts that cannot register document listeners.
    }
  };
  _proto.refreshInstanceLookups = function refreshInstanceLookups(props, selectionDraft) {
    this.dates = buildDates(props);
    this.blockedMinuteKeys = getDateMinuteKeySet(props.blocked);
    this.selectedMinuteKeys = getDateMinuteKeySet(selectionDraft);
  };
  _proto.clearDateCellLookup = function clearDateCellLookup(dateCell) {
    var _this2 = this;
    this.dateToCell.forEach(function (registeredCell, registeredTime) {
      if (registeredCell === dateCell) {
        _this2.dateToCell.delete(registeredTime);
      }
    });
  };
  _proto.clearDateCellTimeLookup = function clearDateCellTimeLookup(dateCell, time) {
    var registeredTime = getDateKey(time);
    if (registeredTime == null) {
      this.clearDateCellLookup(dateCell);
      return;
    }
    if (this.dateToCell.get(registeredTime) === dateCell) {
      this.dateToCell.delete(registeredTime);
    }
  };
  _proto.syncDateCellTouchMoveListener = function syncDateCellTouchMoveListener(dateCell, shouldPreventTouchScroll) {
    if (!dateCell) return;
    var isPreventingTouchScroll = this.touchScrollCells.has(dateCell);
    if (shouldPreventTouchScroll && !isPreventingTouchScroll) {
      if (typeof dateCell.addEventListener === 'function') {
        try {
          dateCell.addEventListener('touchmove', preventScroll, {
            passive: false
          });
          this.touchScrollCells.add(dateCell);
        } catch (_unused13) {
          // Leave the date registered even if this cell cannot accept touch listener options.
        }
      }
    } else if (!shouldPreventTouchScroll && isPreventingTouchScroll) {
      if (typeof dateCell.removeEventListener === 'function') {
        try {
          dateCell.removeEventListener('touchmove', preventScroll);
        } catch (_unused14) {
          // Continue clearing lookup state even when listener cleanup fails.
        }
      }
      this.touchScrollCells.delete(dateCell);
    }
  };
  _proto.registerDateCell = function registerDateCell(dateCell, time, shouldPreventTouchScroll) {
    if (shouldPreventTouchScroll === void 0) {
      shouldPreventTouchScroll = true;
    }
    if (!dateCell) return;
    var validTime = getValidDate(time);
    var previousTime = this.cellToDate.get(dateCell);
    if (this.cellToDate.has(dateCell) && previousTime) {
      this.clearDateCellTimeLookup(dateCell, previousTime);
    } else if (this.cellToDate.has(dateCell)) {
      this.clearDateCellLookup(dateCell);
    }
    this.syncDateCellTouchMoveListener(dateCell, shouldPreventTouchScroll && validTime != null);
    this.cellToDate.set(dateCell, validTime);
    if (validTime) {
      this.dateToCell.set(dateKey(validTime), dateCell);
    }
  };
  _proto.unregisterDateCell = function unregisterDateCell(dateCell) {
    if (!dateCell) return;
    var time = this.cellToDate.get(dateCell);
    if (!this.cellToDate.has(dateCell)) return;
    this.syncDateCellTouchMoveListener(dateCell, false);
    this.cellToDate.delete(dateCell);
    if (time) {
      this.clearDateCellTimeLookup(dateCell, time);
    } else {
      this.clearDateCellLookup(dateCell);
    }
  };
  _proto.isBlocked = function isBlocked(time) {
    return hasDateMinuteKey(this.blockedMinuteKeys, time);
  };
  _proto.isSelected = function isSelected(time) {
    return hasDateMinuteKey(this.selectedMinuteKeys, time);
  };
  _proto.getDocument = function getDocument() {
    return getOwnerDocument(this.gridRef) || getBrowserDocument();
  };
  _proto.getDateCellFromEventTarget = function getDateCellFromEventTarget(target) {
    if (!target || typeof target !== 'object') return null;
    var seenElements = new SetConstructor();
    var targetElement = this.cellToDate.has(target) ? target : getParentElement(target);
    while (targetElement) {
      if (seenElements.has(targetElement)) return null;
      seenElements.add(targetElement);
      if (this.cellToDate.has(targetElement)) return targetElement;
      if (targetElement === this.gridRef) return null;
      targetElement = getParentElement(targetElement);
    }
    return null;
  };
  _proto.handleDocumentMouseUpEvent = function handleDocumentMouseUpEvent(event) {
    if (this.state.selectionType === null) return;
    if (this.shouldIgnoreMouseEvent()) return;
    if (!isPrimaryMouseButton(event)) return;
    var dateCell = this.getDateCellFromEventTarget(event && event.target);
    var dateCellTime = dateCell ? this.cellToDate.get(dateCell) : null;
    if (dateCellTime && !this.isBlocked(dateCellTime)) return;
    if (this.state.selectionDraft === this.state.selectionBase) {
      this.updateAvailabilityDraft(this.state.selectionStart, this.endSelection);
      return;
    }
    this.endSelection();
  }

  // Performs a lookup into this.cellToDate to retrieve the Date that corresponds to
  // the cell where this touch event is right now. Note that this method will only work
  // if the event is a `touchmove` event since it's the only one that has a `touches` list.
;
  _proto.getTimeFromTouchEvent = function getTimeFromTouchEvent(event) {
    if (!event) return null;
    var touches = event.touches;
    if (!touches || touches.length === 0) return null;
    var touch = touches[0];
    if (!touch || !numberIsFinite(touch.clientX) || !numberIsFinite(touch.clientY)) return null;
    var browserDocument = this.getDocument();
    if (!browserDocument || typeof browserDocument.elementFromPoint !== 'function') return null;
    var clientX = touch.clientX,
      clientY = touch.clientY;
    var targetElement;
    try {
      targetElement = browserDocument.elementFromPoint(clientX, clientY);
    } catch (_unused15) {
      return null;
    }
    var dateCell = this.getDateCellFromEventTarget(targetElement);
    return dateCell ? this.cellToDate.get(dateCell) || null : null;
  };
  _proto.endSelection = function endSelection() {
    var hasValidSelectionType = isSelectionType(this.state.selectionType);
    var hasDanglingSelectionState = this.state.selectionType != null || this.state.selectionStart !== null || this.state.isTouchDragging;
    if (!hasValidSelectionType && !hasDanglingSelectionState) return;
    var nextSelection = hasValidSelectionType ? normalizeSelectionDraft(this.state.selectionDraft) : null;
    if (nextSelection) {
      this.setState({
        selectionDraft: nextSelection,
        selectionBase: nextSelection,
        selectionType: null,
        selectionStart: null,
        isTouchDragging: false
      });
      if (typeof this.props.onChange === 'function') {
        this.props.onChange(normalizeSelectionDraft(nextSelection));
      }
      return;
    }
    this.setState({
      selectionType: null,
      selectionStart: null,
      isTouchDragging: false
    });
  }

  // Given an ending Date, determines all the dates that should be selected in this draft
;
  _proto.updateAvailabilityDraft = function updateAvailabilityDraft(selectionEnd, callback) {
    var _this3 = this;
    var _this$state = this.state,
      selectionType = _this$state.selectionType,
      selectionStart = _this$state.selectionStart;
    var validSelectionStart = getValidDate(selectionStart);
    var validSelectionEnd = selectionEnd == null ? null : getValidDate(selectionEnd);
    if (!isSelectionType(selectionType) || !validSelectionStart || selectionEnd != null && !validSelectionEnd) {
      if (callback) callback();
      return;
    }
    var selectionSchemeHandler = this.selectionSchemeHandlers[getSelectionScheme(this.props.selectionScheme)];
    var availableSelection = arrayFilter.call(selectionSchemeHandler(validSelectionStart, validSelectionEnd, this.dates), function (time) {
      return !_this3.isBlocked(time);
    });
    var nextDraft = arrayFilter.call(normalizeSelectionDraft(this.state.selectionBase), function (time) {
      return !_this3.isBlocked(time);
    });
    if (selectionType === 'add') {
      nextDraft = uniqueDatesByMinute(concatDates(nextDraft, availableSelection));
    } else {
      var availableSelectionKeys = new SetConstructor(arrayMap.call(availableSelection, dateMinuteKey));
      nextDraft = arrayFilter.call(nextDraft, function (date) {
        return !availableSelectionKeys.has(dateMinuteKey(date));
      });
    }
    this.setState({
      selectionDraft: nextDraft
    }, callback);
  }

  // Isomorphic (mouse and touch) handler since starting a selection works the same way for both classes of user input
;
  _proto.handleSelectionStartEvent = function handleSelectionStartEvent(startTime) {
    var validStartTime = getValidDate(startTime);
    if (!validStartTime || this.isBlocked(validStartTime)) return;

    // Check if the startTime cell is selected/unselected to determine if this drag-select should
    // add values or remove values
    var timeSelected = this.isSelected(validStartTime);
    this.setState({
      selectionType: timeSelected ? 'remove' : 'add',
      selectionStart: validStartTime,
      selectionBase: this.state.selectionDraft
    });
  };
  _proto.recordTouchEvent = function recordTouchEvent() {
    this.lastTouchEventTime = getCurrentTimestamp();
  };
  _proto.shouldIgnoreMouseEvent = function shouldIgnoreMouseEvent() {
    if (this.lastTouchEventTime == null) return false;
    var elapsedTouchTime = getCurrentTimestamp() - this.lastTouchEventTime;
    return elapsedTouchTime >= 0 && elapsedTouchTime < TOUCH_MOUSE_SUPPRESSION_MS;
  };
  _proto.clearTouchDragState = function clearTouchDragState() {
    var shouldClearSelectionStart = this.state.selectionStart !== null && !isSelectionType(this.state.selectionType);
    if (!this.state.isTouchDragging && !shouldClearSelectionStart) return;
    this.setState({
      selectionStart: null,
      isTouchDragging: false
    });
  };
  _proto.handleMouseDownEvent = function handleMouseDownEvent(time, event) {
    if (!isPrimaryMouseButton(event)) return;
    if (this.shouldIgnoreMouseEvent()) return;
    this.handleSelectionStartEvent(time);
  };
  _proto.handleMouseEnterEvent = function handleMouseEnterEvent(time) {
    if (this.shouldIgnoreMouseEvent()) return;
    var validTime = getValidDate(time);
    if (!validTime) return;

    // Need to update selection draft on mouseup as well in order to catch the cases
    // where the user just clicks on a single cell (because no mouseenter events fire
    // in this scenario)
    this.updateAvailabilityDraft(validTime);
  };
  _proto.handleMouseUpEvent = function handleMouseUpEvent(time, event) {
    if (!isPrimaryMouseButton(event)) return;
    if (this.shouldIgnoreMouseEvent()) return;
    var validTime = getValidDate(time);
    if (!validTime) {
      if (this.state.selectionDraft === this.state.selectionBase) {
        this.updateAvailabilityDraft(this.state.selectionStart, this.endSelection);
      } else {
        this.endSelection();
      }
      return;
    }
    this.updateAvailabilityDraft(validTime, this.endSelection);
  };
  _proto.focusDateCell = function focusDateCell(time) {
    if (this.isBlocked(time)) return false;
    var key = getDateKey(time);
    if (key == null) return false;
    var dateCell = this.dateToCell.get(key);
    if (!dateCell || typeof dateCell.focus !== 'function') return false;
    try {
      dateCell.focus();
      return true;
    } catch (_unused16) {
      return false;
    }
  };
  _proto.handleCellKeyDownEvent = function handleCellKeyDownEvent(event, time, blocked) {
    var _this4 = this;
    if (blocked === void 0) {
      blocked = false;
    }
    var key = event && typeof event.key === 'string' ? event.key : '';
    var validTime = getValidDate(time);
    if (isKeyboardNavigationKey(key)) {
      if (!validTime) return;
      if ((key === 'Home' || key === 'End') && hasUnsupportedKeyboardModifier(event)) return;
      var navigationTarget = getKeyboardNavigationTarget(buildDateColumns(this.props), validTime, key, this.blockedMinuteKeys, hasKeyboardControlModifier(event));
      if (key === 'Home' || key === 'End') {
        if (navigationTarget && this.focusDateCell(navigationTarget)) preventDefault(event);
        return;
      }
      preventDefault(event);
      if (navigationTarget) this.focusDateCell(navigationTarget);
      return;
    }
    if (blocked || !validTime || !isKeyboardSelectionKey(key)) return;
    preventDefault(event);
    var timeSelected = this.isSelected(validTime);
    this.setState({
      selectionType: timeSelected ? 'remove' : 'add',
      selectionStart: validTime,
      selectionBase: this.state.selectionDraft
    }, function () {
      _this4.updateAvailabilityDraft(validTime, _this4.endSelection);
    });
  };
  _proto.handleTouchStartEvent = function handleTouchStartEvent(startTime) {
    this.recordTouchEvent();
    this.handleSelectionStartEvent(startTime);
  };
  _proto.handleTouchMoveEvent = function handleTouchMoveEvent(event) {
    this.recordTouchEvent();
    if (!isSelectionType(this.state.selectionType) || !getValidDate(this.state.selectionStart)) return;
    if (!this.state.isTouchDragging) {
      this.setState({
        isTouchDragging: true
      });
    }
    var cellTime = this.getTimeFromTouchEvent(event);
    if (cellTime && !this.isBlocked(cellTime)) {
      this.updateAvailabilityDraft(cellTime);
    }
  };
  _proto.handleTouchEndEvent = function handleTouchEndEvent() {
    var _this5 = this;
    this.recordTouchEvent();
    if (this.state.selectionType === null) {
      this.clearTouchDragState();
      return;
    }
    if (!this.state.isTouchDragging) {
      // Going down this branch means the user tapped but didn't drag -- which
      // means the availability draft hasn't yet been updated (since
      // handleTouchMoveEvent was never called) so we need to do it now
      this.updateAvailabilityDraft(null, function () {
        _this5.endSelection();
      });
    } else if (this.state.selectionDraft === this.state.selectionBase) {
      this.updateAvailabilityDraft(this.state.selectionStart, this.endSelection);
    } else {
      this.endSelection();
    }
  };
  _proto.handleTouchCancelEvent = function handleTouchCancelEvent() {
    this.recordTouchEvent();
    if (this.state.selectionType === null) {
      this.clearTouchDragState();
      return;
    }
    var restoredSelectionBase = normalizeSelectionDraft(this.state.selectionBase);
    this.setState({
      selectionDraft: restoredSelectionBase,
      selectionBase: restoredSelectionBase,
      selectionType: null,
      selectionStart: null,
      isTouchDragging: false
    });
  };
  _proto.render = function render() {
    var _this6 = this;
    var dateColumns = buildDateColumns(this.props);
    var blockedMinuteKeys = getDateMinuteKeySet(this.props.blocked);
    var selectedMinuteKeys = getDateMinuteKeySet(this.state.selectionDraft);
    var gridAriaDescribedBy = getNonEmptyString(this.props['aria-describedby']);
    var gridAriaLabelledBy = getNonEmptyString(this.props['aria-labelledby']);
    var gridAriaLabel = getNonEmptyString(this.props['aria-label']) || getNonEmptyString(this.props.ariaLabel) || DEFAULT_ARIA_LABEL;
    return /*#__PURE__*/React.createElement(Wrapper, {
      className: this.props.className,
      id: this.props.id,
      style: this.props.style
    }, /*#__PURE__*/React.createElement(Grid, {
      role: "group",
      "aria-describedby": gridAriaDescribedBy,
      "aria-label": gridAriaLabelledBy ? undefined : gridAriaLabel,
      "aria-labelledby": gridAriaLabelledBy,
      ref: function ref(el) {
        _this6.gridRef = el;
      }
    }, dateColumns.length > 0 && this.renderTimeLabels(), arrayMap.call(dateColumns, function (dateColumn) {
      return _this6.renderDateColumn(dateColumn, blockedMinuteKeys, selectedMinuteKeys);
    })));
  };
  return BookingSelector;
}(React.Component);
BookingSelector.defaultProps = {
  selection: [],
  blocked: [],
  selectionScheme: 'square',
  numDays: 7,
  minTime: 9,
  maxTime: 23,
  dateFormat: DEFAULT_DATE_FORMAT,
  margin: 3,
  selectedColor: colors.blue,
  unselectedColor: colors.paleBlue,
  hoveredColor: colors.lightBlue,
  blockedColor: colors.black,
  ariaLabel: DEFAULT_ARIA_LABEL,
  onChange: function onChange() {}
};
export { BookingSelector as default };