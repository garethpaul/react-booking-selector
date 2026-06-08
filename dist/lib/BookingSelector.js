"use strict";

exports.__esModule = true;
exports.preventScroll = exports.default = exports.GridCell = void 0;
var React = _interopRequireWildcard(require("react"));
var _addDays = require("date-fns/addDays");
var _addHours = require("date-fns/addHours");
var _format = require("date-fns/format");
var _isValid = require("date-fns/isValid");
var _startOfDay = require("date-fns/startOfDay");
var _styled = _interopRequireDefault(require("./styled.js"));
var _typography = require("./typography.js");
var _colors = _interopRequireDefault(require("./colors.js"));
var _index = _interopRequireDefault(require("./selection-schemes/index.js"));
var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5, _templateObject6, _templateObject7, _templateObject8, _templateObject9, _templateObject0;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _inheritsLoose(t, o) { t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _taggedTemplateLiteralLoose(e, t) { return t || (t = e.slice(0)), e.raw = t, e; }
var DEFAULT_DATE_FORMAT = 'd';
var toCssUnit = function toCssUnit(value) {
  if (value == null) return '0px';
  if (typeof value === 'number') return value + "px";
  return /^-?\d+(\.\d+)?$/.test(value) ? value + "px" : value;
};
var invalidDate = function invalidDate() {
  return new Date(NaN);
};
var toDate = function toDate(value) {
  if (value == null) return invalidDate();
  if (value instanceof Date) return new Date(value.getTime());
  if (typeof value === 'string' || typeof value === 'number') return new Date(value);
  if (typeof value !== 'object') return invalidDate();
  try {
    var primitiveValue = value.valueOf();
    return typeof primitiveValue === 'number' ? new Date(primitiveValue) : invalidDate();
  } catch (_unused) {
    return invalidDate();
  }
};
var normalizeDates = function normalizeDates(dates) {
  return (Array.isArray(dates) ? dates : []).map(toDate).filter(_isValid.isValid);
};
var dateMinuteKey = function dateMinuteKey(value) {
  return Math.floor(value.getTime() / 60000);
};
var hasDateMinuteKey = function hasDateMinuteKey(dateMinuteKeys, time) {
  return dateMinuteKeys.has(dateMinuteKey(time));
};
var getDatesSignature = function getDatesSignature(dates) {
  return normalizeDates(dates).map(dateMinuteKey).join('|');
};
var getDateMinuteSetSignature = function getDateMinuteSetSignature(dates) {
  return Array.from(new Set(normalizeDates(dates).map(dateMinuteKey))).sort(function (a, b) {
    return a - b;
  }).join('|');
};
var getDateMinuteKeySet = function getDateMinuteKeySet(dates) {
  return new Set(normalizeDates(dates).map(dateMinuteKey));
};
var uniqueDatesByMinute = function uniqueDatesByMinute(dates) {
  var dateMinuteKeys = new Set();
  var uniqueDates = [];
  dates.forEach(function (date) {
    var key = dateMinuteKey(date);
    if (dateMinuteKeys.has(key)) return;
    dateMinuteKeys.add(key);
    uniqueDates.push(date);
  });
  return uniqueDates;
};
var getStartDate = function getStartDate(startDate) {
  return startDate && (0, _isValid.isValid)(startDate) ? startDate : new Date();
};
var isWholeNumber = function isWholeNumber(value) {
  return Number.isFinite(value) && Math.floor(value) === value;
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
var buildDates = function buildDates(_ref) {
  var startDate = _ref.startDate,
    numDays = _ref.numDays,
    minTime = _ref.minTime,
    maxTime = _ref.maxTime;
  if (!isWholeNumber(numDays) || numDays <= 0) return [];
  var startTime = (0, _startOfDay.startOfDay)(getStartDate(startDate));
  var visibleHours = getVisibleHours(minTime, maxTime);
  if (visibleHours.length === 0) return [];
  var dates = [];
  var _loop = function _loop(d) {
    var currentDay = [];
    visibleHours.forEach(function (h) {
      currentDay.push((0, _addHours.addHours)((0, _addDays.addDays)(startTime, d), h));
    });
    dates.push(currentDay);
  };
  for (var d = 0; d < numDays; d += 1) {
    _loop(d);
  }
  return dates;
};
var formatHour = function formatHour(hour) {
  var h = hour === 0 || hour === 12 || hour === 24 ? 12 : hour % 12;
  var abb = hour < 12 || hour === 24 ? 'am' : 'pm';
  return h + " " + abb;
};
var formatCellLabel = function formatCellLabel(time, selected, blocked) {
  var state = blocked ? 'Blocked' : selected ? 'Selected' : 'Available';
  return state + " " + (0, _format.format)(time, 'EEEE, MMMM d, yyyy') + " at " + formatHour(time.getHours());
};
var formatDateHeader = function formatDateHeader(time, dateFormat) {
  try {
    return (0, _format.format)(time, dateFormat);
  } catch (_unused2) {
    return (0, _format.format)(time, DEFAULT_DATE_FORMAT);
  }
};
var getKeyboardNavigationTarget = function getKeyboardNavigationTarget(time, key) {
  if (key === 'ArrowRight') return (0, _addDays.addDays)(time, 1);
  if (key === 'ArrowLeft') return (0, _addDays.addDays)(time, -1);
  if (key === 'ArrowDown') return (0, _addHours.addHours)(time, 1);
  if (key === 'ArrowUp') return (0, _addHours.addHours)(time, -1);
  return null;
};
var dateKey = function dateKey(time) {
  return time.getTime();
};
var TOUCH_MOUSE_SUPPRESSION_MS = 500;
var Wrapper = _styled.default.div(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["\n  display: flex;\n  align-items: center;\n  width: 100%;\n  user-select: none;\n"])));
var Grid = _styled.default.div(_templateObject2 || (_templateObject2 = _taggedTemplateLiteralLoose(["\n  display: flex;\n  flex-direction: row;\n  align-items: stretch;\n  width: 100%;\n"])));
var Column = _styled.default.div(_templateObject3 || (_templateObject3 = _taggedTemplateLiteralLoose(["\n  display: flex;\n  flex-direction: column;\n  justify-content: space-evenly;\n  flex: 1 1 0;\n  min-width: 0;\n"])));
var TimeColumn = (0, _styled.default)(Column)(_templateObject4 || (_templateObject4 = _taggedTemplateLiteralLoose(["\n  flex: 0 0 52px;\n  max-width: 52px;\n  @media (max-width: 699px) {\n    flex-basis: 32px;\n    max-width: 32px;\n  }\n"])));
var GridCell = exports.GridCell = _styled.default.div(_templateObject5 || (_templateObject5 = _taggedTemplateLiteralLoose(["\n  box-sizing: border-box;\n  display: block;\n  align-self: stretch;\n  width: auto;\n  max-width: none;\n  min-width: 0;\n  max-height: none;\n  min-height: 0;\n  margin: ", ";\n  height: ", ";\n  padding: 0;\n  border: 0;\n  appearance: none;\n  background: transparent;\n  color: inherit;\n  ", "\n  font: inherit;\n  opacity: 1;\n  ", "\n  &:focus {\n    outline: none;\n  }\n  &:focus-visible {\n    outline: 2px solid ", ";\n    outline-offset: 2px;\n    border-radius: 6px;\n  }\n"])), function (props) {
  return toCssUnit(props.$margin);
}, function (props) {
  return toCssUnit(props.$height);
}, function (props) {
  return props.$interactive && "cursor: " + (props.$blocked ? 'not-allowed' : 'pointer') + ";";
}, function (props) {
  return props.$interactive && 'touch-action: none;';
}, _colors.default.blue);

// Style the Date Cell
var DateCell = _styled.default.div(_templateObject6 || (_templateObject6 = _taggedTemplateLiteralLoose(["\n  width: 100%;\n  height: 100%;\n  border-radius: 4px;\n  transition:\n    background-color 120ms ease,\n    transform 120ms ease;\n  ", "\n  ", "\n  ", "\n  &:hover {\n    background-color: ", ";\n  }\n"])), function (props) {
  return props.$selected && !props.$blocked && "background-color: " + props.$selectedColor + ";";
}, function (props) {
  return !props.$selected && !props.$blocked && "background-color: " + props.$unselectedColor + ";";
}, function (props) {
  return props.$blocked && "background-color: " + props.$blockedColor + ";";
}, function (props) {
  return props.$blocked ? props.$blockedColor : props.$selected ? props.$selectedColor : props.$hoveredColor;
});
var DateLabel = (0, _styled.default)(_typography.Subtitle)(_templateObject7 || (_templateObject7 = _taggedTemplateLiteralLoose(["\n  height: 15px;\n  font-size: 19px;\n  line-height: 1;\n  margin: 0px;\n  margin-top: 5px;\n  padding: 0px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  @media (max-width: 699px) {\n    font-size: 12px;\n  }\n"])));
var DayLabel = (0, _styled.default)(_typography.Subtitle)(_templateObject8 || (_templateObject8 = _taggedTemplateLiteralLoose(["\n  height: 15px;\n  font-size: 10px;\n  line-height: 1;\n  margin: 0px;\n  padding: 0px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  @media (max-width: 699px) {\n    font-size: 8px;\n  }\n"])));
var TimeLabelCell = _styled.default.div(_templateObject9 || (_templateObject9 = _taggedTemplateLiteralLoose(["\n  position: relative;\n  box-sizing: border-box;\n  width: 100%;\n  height: 40px;\n  padding-right: 15px;\n  display: flex;\n  justify-content: flex-end;\n  align-items: center;\n  color: rgb(112, 117, 122);\n  @media (max-width: 699px) {\n    padding-right: 6px;\n  }\n"])));
var TimeText = (0, _styled.default)(_typography.Text)(_templateObject0 || (_templateObject0 = _taggedTemplateLiteralLoose(["\n  margin: 0;\n  font-size: 11px;\n  @media (max-width: 699px) {\n    font-size: 8px;\n  }\n  text-align: right;\n  text-transform: uppercase;\n"])));
var preventScroll = exports.preventScroll = function preventScroll(e) {
  e.preventDefault();
};
var BookingSelector = exports.default = /*#__PURE__*/function (_React$Component) {
  function BookingSelector(props) {
    var _this;
    _this = _React$Component.call(this, props) || this;
    _this.dates = void 0;
    _this.selectionSchemeHandlers = void 0;
    _this.cellToDate = void 0;
    _this.dateToCell = void 0;
    _this.gridRef = void 0;
    _this.lastTouchEventTime = void 0;
    _this.blockedMinuteKeys = void 0;
    _this.selectedMinuteKeys = void 0;
    _this.renderTimeLabels = function () {
      var labels = [/*#__PURE__*/React.createElement(GridCell, {
        $height: "40",
        key: -1
      })]; // Ensures time labels start at correct location
      getVisibleHours(_this.props.minTime, _this.props.maxTime).forEach(function (t) {
        labels.push(/*#__PURE__*/React.createElement(TimeLabelCell, {
          key: t
        }, /*#__PURE__*/React.createElement(TimeText, null, formatHour(t))));
      });
      return /*#__PURE__*/React.createElement(TimeColumn, {
        "aria-hidden": "true"
      }, labels);
    };
    _this.renderDateColumn = function (dayOfTimes, blockedMinuteKeys, selectedMinuteKeys) {
      return /*#__PURE__*/React.createElement(Column, {
        key: dayOfTimes[0].toISOString()
      }, /*#__PURE__*/React.createElement(GridCell, {
        $height: "50",
        $margin: _this.props.margin,
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement(DayLabel, null, (0, _format.format)(dayOfTimes[0], 'EEE').toUpperCase()), /*#__PURE__*/React.createElement(DateLabel, null, formatDateHeader(dayOfTimes[0], _this.props.dateFormat))), dayOfTimes.map(function (time) {
        return _this.renderDateCellWrapperWithLookups(time, blockedMinuteKeys, selectedMinuteKeys);
      }));
    };
    _this.renderDateCellWrapper = function (time) {
      return _this.renderDateCellWrapperWithLookups(time, _this.blockedMinuteKeys, _this.selectedMinuteKeys);
    };
    _this.renderDateCellWrapperWithLookups = function (time, blockedMinuteKeys, selectedMinuteKeys) {
      var blocked = hasDateMinuteKey(blockedMinuteKeys, time);
      var selected = !blocked && hasDateMinuteKey(selectedMinuteKeys, time);
      var mouseStartHandler = function mouseStartHandler() {
        if (!blocked) _this.handleMouseDownEvent(time);
      };
      var touchStartHandler = function touchStartHandler() {
        if (!blocked) _this.handleTouchStartEvent(time);
      };
      var currentDateCell = null;
      var refSetter = function refSetter(dateCell) {
        if (currentDateCell && currentDateCell !== dateCell) {
          _this.unregisterDateCell(currentDateCell);
        }
        if (dateCell) {
          _this.registerDateCell(dateCell, time);
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
        $margin: _this.props.margin,
        key: time.toISOString(),
        ref: refSetter
        // Mouse handlers
        ,
        onMouseDown: mouseStartHandler,
        onMouseEnter: function onMouseEnter() {
          _this.handleMouseEnterEvent(time);
        },
        onMouseUp: function onMouseUp() {
          _this.handleMouseUpEvent(time);
        }
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
      if (_this.props.renderDateCell) {
        return _this.props.renderDateCell(time, selected, blocked);
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
    _this.cellToDate = new Map();
    _this.dateToCell = new Map();
    _this.lastTouchEventTime = 0;
    var selectionDraft = normalizeDates(_this.props.selection);
    var selectionPropSignature = getDatesSignature(_this.props.selection);
    var blockedPropSignature = getDateMinuteSetSignature(_this.props.blocked);
    _this.state = {
      selectionDraft: selectionDraft,
      selectionBase: selectionDraft,
      selectionPropSignature: selectionPropSignature,
      blockedPropSignature: blockedPropSignature,
      selectionType: null,
      selectionStart: null,
      isTouchDragging: false
    };
    _this.selectionSchemeHandlers = {
      linear: _index.default.linear,
      square: _index.default.square
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
    var selectionPropSignature = getDatesSignature(props.selection);
    var blockedPropSignature = getDateMinuteSetSignature(props.blocked);
    if (selectionPropSignature === state.selectionPropSignature && blockedPropSignature === state.blockedPropSignature) {
      return null;
    }
    var selectionDraft = normalizeDates(props.selection);
    return {
      selectionDraft: selectionDraft,
      selectionBase: selectionDraft,
      selectionPropSignature: selectionPropSignature,
      blockedPropSignature: blockedPropSignature,
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
    document.addEventListener('mouseup', this.handleDocumentMouseUpEvent);
  };
  _proto.componentDidUpdate = function componentDidUpdate() {
    this.refreshInstanceLookups(this.props, this.state.selectionDraft);
  };
  _proto.componentWillUnmount = function componentWillUnmount() {
    document.removeEventListener('mouseup', this.handleDocumentMouseUpEvent);
    this.cellToDate.forEach(function (value, dateCell) {
      if (dateCell && dateCell.removeEventListener) {
        dateCell.removeEventListener('touchmove', preventScroll);
      }
    });
    this.cellToDate.clear();
    this.dateToCell.clear();
  };
  _proto.refreshInstanceLookups = function refreshInstanceLookups(props, selectionDraft) {
    this.dates = buildDates(props);
    this.blockedMinuteKeys = getDateMinuteKeySet(props.blocked);
    this.selectedMinuteKeys = new Set(selectionDraft.map(dateMinuteKey));
  };
  _proto.registerDateCell = function registerDateCell(dateCell, time) {
    var previousTime = this.cellToDate.get(dateCell);
    if (!this.cellToDate.has(dateCell)) {
      dateCell.addEventListener('touchmove', preventScroll, {
        passive: false
      });
    } else if (previousTime) {
      this.dateToCell.delete(dateKey(previousTime));
    }
    this.cellToDate.set(dateCell, time);
    this.dateToCell.set(dateKey(time), dateCell);
  };
  _proto.unregisterDateCell = function unregisterDateCell(dateCell) {
    var time = this.cellToDate.get(dateCell);
    if (!this.cellToDate.has(dateCell)) return;
    dateCell.removeEventListener('touchmove', preventScroll);
    this.cellToDate.delete(dateCell);
    if (time) this.dateToCell.delete(dateKey(time));
  };
  _proto.isBlocked = function isBlocked(time) {
    return hasDateMinuteKey(this.blockedMinuteKeys, time);
  };
  _proto.isSelected = function isSelected(time) {
    return hasDateMinuteKey(this.selectedMinuteKeys, time);
  };
  _proto.getDateCellFromEventTarget = function getDateCellFromEventTarget(target) {
    if (!(target instanceof Node)) return null;
    var targetElement = target instanceof HTMLElement ? target : target.parentElement;
    while (targetElement) {
      if (this.cellToDate.has(targetElement)) return targetElement;
      if (targetElement === this.gridRef) return null;
      targetElement = targetElement.parentElement;
    }
    return null;
  };
  _proto.handleDocumentMouseUpEvent = function handleDocumentMouseUpEvent(event) {
    if (this.state.selectionType === null) return;
    if (this.shouldIgnoreMouseEvent()) return;
    var dateCell = this.getDateCellFromEventTarget(event.target);
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
    var touches = event.touches;
    if (!touches || touches.length === 0) return null;
    var _touches$ = touches[0],
      clientX = _touches$.clientX,
      clientY = _touches$.clientY;
    var targetElement = document.elementFromPoint(clientX, clientY);
    while (targetElement) {
      var cellTime = this.cellToDate.get(targetElement);
      if (cellTime) return cellTime;
      if (targetElement === this.gridRef) return null;
      targetElement = targetElement.parentElement;
    }
    return null;
  };
  _proto.endSelection = function endSelection() {
    if (this.state.selectionType !== null) {
      this.props.onChange(normalizeDates(this.state.selectionDraft));
    }
    this.setState({
      selectionType: null,
      selectionStart: null
    });
  }

  // Given an ending Date, determines all the dates that should be selected in this draft
;
  _proto.updateAvailabilityDraft = function updateAvailabilityDraft(selectionEnd, callback) {
    var _this2 = this;
    var _this$state = this.state,
      selectionType = _this$state.selectionType,
      selectionStart = _this$state.selectionStart;
    if (selectionType === null || selectionStart === null) return;
    var selectionSchemeHandler = this.selectionSchemeHandlers[this.props.selectionScheme] || this.selectionSchemeHandlers.square;
    var availableSelection = selectionSchemeHandler(selectionStart, selectionEnd, this.dates).filter(function (time) {
      return !_this2.isBlocked(time);
    });
    var nextDraft = uniqueDatesByMinute(this.state.selectionBase.filter(function (time) {
      return !_this2.isBlocked(time);
    }));
    if (selectionType === 'add') {
      nextDraft = uniqueDatesByMinute([].concat(nextDraft, availableSelection));
    } else {
      var availableSelectionKeys = new Set(availableSelection.map(dateMinuteKey));
      nextDraft = nextDraft.filter(function (date) {
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
    if (this.isBlocked(startTime)) return;

    // Check if the startTime cell is selected/unselected to determine if this drag-select should
    // add values or remove values
    var timeSelected = this.isSelected(startTime);
    this.setState({
      selectionType: timeSelected ? 'remove' : 'add',
      selectionStart: startTime,
      selectionBase: this.state.selectionDraft
    });
  };
  _proto.recordTouchEvent = function recordTouchEvent() {
    this.lastTouchEventTime = Date.now();
  };
  _proto.shouldIgnoreMouseEvent = function shouldIgnoreMouseEvent() {
    return this.lastTouchEventTime > 0 && Date.now() - this.lastTouchEventTime < TOUCH_MOUSE_SUPPRESSION_MS;
  };
  _proto.handleMouseDownEvent = function handleMouseDownEvent(time) {
    if (this.shouldIgnoreMouseEvent()) return;
    this.handleSelectionStartEvent(time);
  };
  _proto.handleMouseEnterEvent = function handleMouseEnterEvent(time) {
    if (this.shouldIgnoreMouseEvent()) return;

    // Need to update selection draft on mouseup as well in order to catch the cases
    // where the user just clicks on a single cell (because no mouseenter events fire
    // in this scenario)
    this.updateAvailabilityDraft(time);
  };
  _proto.handleMouseUpEvent = function handleMouseUpEvent(time) {
    if (this.shouldIgnoreMouseEvent()) return;
    this.updateAvailabilityDraft(time, this.endSelection);
  };
  _proto.focusDateCell = function focusDateCell(time) {
    if (this.isBlocked(time)) return false;
    var dateCell = this.dateToCell.get(dateKey(time));
    if (!dateCell) return false;
    dateCell.focus();
    return true;
  };
  _proto.handleCellKeyDownEvent = function handleCellKeyDownEvent(event, time, blocked) {
    var _this3 = this;
    var navigationTarget = getKeyboardNavigationTarget(time, event.key);
    if (navigationTarget) {
      event.preventDefault();
      this.focusDateCell(navigationTarget);
      return;
    }
    if (blocked || event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    var timeSelected = this.isSelected(time);
    this.setState({
      selectionType: timeSelected ? 'remove' : 'add',
      selectionStart: time,
      selectionBase: this.state.selectionDraft
    }, function () {
      _this3.updateAvailabilityDraft(time, _this3.endSelection);
    });
  };
  _proto.handleTouchStartEvent = function handleTouchStartEvent(startTime) {
    this.recordTouchEvent();
    this.handleSelectionStartEvent(startTime);
  };
  _proto.handleTouchMoveEvent = function handleTouchMoveEvent(event) {
    this.recordTouchEvent();
    this.setState({
      isTouchDragging: true
    });
    var cellTime = this.getTimeFromTouchEvent(event);
    if (cellTime) {
      this.updateAvailabilityDraft(cellTime);
    }
  };
  _proto.handleTouchEndEvent = function handleTouchEndEvent() {
    var _this4 = this;
    this.recordTouchEvent();
    if (!this.state.isTouchDragging) {
      // Going down this branch means the user tapped but didn't drag -- which
      // means the availability draft hasn't yet been updated (since
      // handleTouchMoveEvent was never called) so we need to do it now
      this.updateAvailabilityDraft(null, function () {
        _this4.endSelection();
      });
    } else if (this.state.selectionDraft === this.state.selectionBase) {
      this.updateAvailabilityDraft(this.state.selectionStart, this.endSelection);
    } else {
      this.endSelection();
    }
    this.setState({
      isTouchDragging: false
    });
  };
  _proto.handleTouchCancelEvent = function handleTouchCancelEvent() {
    this.recordTouchEvent();
    if (this.state.selectionType === null) {
      this.setState({
        isTouchDragging: false
      });
      return;
    }
    this.setState({
      selectionDraft: this.state.selectionBase,
      selectionType: null,
      selectionStart: null,
      isTouchDragging: false
    });
  };
  _proto.render = function render() {
    var _this5 = this;
    var dates = buildDates(this.props);
    var blockedMinuteKeys = getDateMinuteKeySet(this.props.blocked);
    var selectedMinuteKeys = new Set(this.state.selectionDraft.map(dateMinuteKey));
    return /*#__PURE__*/React.createElement(Wrapper, null, /*#__PURE__*/React.createElement(Grid, {
      role: "group",
      "aria-label": "Booking time slots",
      ref: function ref(el) {
        _this5.gridRef = el;
      }
    }, this.renderTimeLabels(), dates.map(function (dayOfTimes) {
      return _this5.renderDateColumn(dayOfTimes, blockedMinuteKeys, selectedMinuteKeys);
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
  selectedColor: _colors.default.blue,
  unselectedColor: _colors.default.paleBlue,
  hoveredColor: _colors.default.lightBlue,
  blockedColor: _colors.default.black,
  onChange: function onChange() {}
};