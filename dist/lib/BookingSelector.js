"use strict";

exports.__esModule = true;
exports.preventScroll = exports.default = exports.GridCell = void 0;
var React = _interopRequireWildcard(require("react"));
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _dateFns = require("date-fns");
var _typography = require("./typography");
var _colors = _interopRequireDefault(require("./colors"));
var _selectionSchemes = _interopRequireDefault(require("./selection-schemes"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _inheritsLoose(t, o) { t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
var toCssUnit = function toCssUnit(value) {
  if (value == null) return '0px';
  if (typeof value === 'number') return value + "px";
  return /^-?\d+(\.\d+)?$/.test(value) ? value + "px" : value;
};
var toDate = function toDate(value) {
  return value instanceof Date ? value : new Date(value.valueOf());
};
var normalizeDates = function normalizeDates(dates) {
  return dates.map(toDate);
};
var dateIsSameMinute = function dateIsSameMinute(a, b) {
  return (0, _dateFns.isSameMinute)(toDate(a), toDate(b));
};
var uniqueDatesByMinute = function uniqueDatesByMinute(dates) {
  return dates.reduce(function (acc, date) {
    if (acc.find(function (existingDate) {
      return dateIsSameMinute(existingDate, date);
    })) return acc;
    return [].concat(acc, [date]);
  }, []);
};
var getStartDate = function getStartDate(startDate) {
  return startDate || new Date();
};
var buildDates = function buildDates(_ref) {
  var startDate = _ref.startDate,
    numDays = _ref.numDays,
    minTime = _ref.minTime,
    maxTime = _ref.maxTime;
  if (numDays <= 0 || minTime > maxTime) return [];
  var startTime = (0, _dateFns.startOfDay)(getStartDate(startDate));
  var dates = [];
  for (var d = 0; d < numDays; d += 1) {
    var currentDay = [];
    for (var h = minTime; h <= maxTime; h += 1) {
      currentDay.push((0, _dateFns.addHours)((0, _dateFns.addDays)(startTime, d), h));
    }
    dates.push(currentDay);
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
  return state + " " + (0, _dateFns.format)(time, 'EEEE, MMMM d, yyyy') + " at " + formatHour(time.getHours());
};
var dateKey = function dateKey(time) {
  return time.getTime();
};
var Wrapper = _styledComponents.default.div.withConfig({
  displayName: "BookingSelector__Wrapper",
  componentId: "sc-1e1auar-0"
})(["display:flex;align-items:center;width:100%;user-select:none;"]);
var Grid = _styledComponents.default.div.withConfig({
  displayName: "BookingSelector__Grid",
  componentId: "sc-1e1auar-1"
})(["display:flex;flex-direction:row;align-items:stretch;width:100%;"]);
var Column = _styledComponents.default.div.withConfig({
  displayName: "BookingSelector__Column",
  componentId: "sc-1e1auar-2"
})(["display:flex;flex-direction:column;justify-content:space-evenly;flex-grow:1;"]);
var GridCell = exports.GridCell = _styledComponents.default.div.withConfig({
  displayName: "BookingSelector__GridCell",
  componentId: "sc-1e1auar-3"
})(["margin:", ";height:", ";touch-action:none;&:focus{outline:none;}&:focus-visible{outline:2px solid ", ";outline-offset:2px;border-radius:6px;}"], function (props) {
  return toCssUnit(props.$margin);
}, function (props) {
  return toCssUnit(props.$height);
}, _colors.default.blue);

// Style the Date Cell
var DateCell = _styledComponents.default.div.withConfig({
  displayName: "BookingSelector__DateCell",
  componentId: "sc-1e1auar-4"
})(["width:100%;height:100%;border-radius:4px;transition:background-color 120ms ease,transform 120ms ease;", " ", " ", " &:hover{cursor:", ";background-color:", ";}"], function (props) {
  return props.$selected && !props.$blocked && "background-color: " + props.$selectedColor + ";";
}, function (props) {
  return !props.$selected && !props.$blocked && "background-color: " + props.$unselectedColor + ";";
}, function (props) {
  return props.$blocked && "background-color: " + props.$blockedColor + ";";
}, function (props) {
  return props.$blocked ? 'not-allowed' : 'pointer';
}, function (props) {
  return props.$blocked ? props.$blockedColor : props.$hoveredColor;
});
var DateLabel = (0, _styledComponents.default)(_typography.Subtitle).withConfig({
  displayName: "BookingSelector__DateLabel",
  componentId: "sc-1e1auar-5"
})(["height:15px;font-size:19px;margin:0px;margin-top:5px;padding:0px;@media (max-width:699px){font-size:10px;}"]);
var DayLabel = (0, _styledComponents.default)(_typography.Subtitle).withConfig({
  displayName: "BookingSelector__DayLabel",
  componentId: "sc-1e1auar-6"
})(["height:15px;font-size:10px;margin:0px;padding:0px;@media (max-width:699px){font-size:6px;}"]);
var TimeLabelCell = _styledComponents.default.div.withConfig({
  displayName: "BookingSelector__TimeLabelCell",
  componentId: "sc-1e1auar-7"
})(["position:relative;width:100%;height:40px;padding-right:15px;display:flex;justify-content:flex-end;align-items:center;color:rgb(112,117,122);"]);
var TimeText = (0, _styledComponents.default)(_typography.Text).withConfig({
  displayName: "BookingSelector__TimeText",
  componentId: "sc-1e1auar-8"
})(["margin:0;font-size:11px;@media (max-width:699px){font-size:7px;}text-align:right;text-transform:uppercase;"]);
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
    _this.renderTimeLabels = function () {
      var labels = [/*#__PURE__*/React.createElement(GridCell, {
        $height: "40",
        key: -1
      })]; // Ensures time labels start at correct location
      for (var t = _this.props.minTime; t <= _this.props.maxTime; t += 1) {
        labels.push(/*#__PURE__*/React.createElement(TimeLabelCell, {
          key: t
        }, /*#__PURE__*/React.createElement(TimeText, null, formatHour(t))));
      }
      return /*#__PURE__*/React.createElement(Column, null, labels);
    };
    _this.renderDateColumn = function (dayOfTimes) {
      return /*#__PURE__*/React.createElement(Column, {
        key: dayOfTimes[0].toISOString()
      }, /*#__PURE__*/React.createElement(GridCell, {
        $height: "50",
        $margin: _this.props.margin
      }, /*#__PURE__*/React.createElement(DayLabel, null, (0, _dateFns.format)(dayOfTimes[0], 'EEE').toUpperCase()), /*#__PURE__*/React.createElement(DateLabel, null, (0, _dateFns.format)(dayOfTimes[0], _this.props.dateFormat))), dayOfTimes.map(function (time) {
        return _this.renderDateCellWrapper(time);
      }));
    };
    _this.renderDateCellWrapper = function (time) {
      var blocked = _this.isBlocked(time);
      var selected = _this.isSelected(time);
      var startHandler = function startHandler() {
        if (!blocked) _this.handleSelectionStartEvent(time);
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
        className: "rgdp__grid-cell",
        role: "button",
        "aria-disabled": blocked,
        "aria-label": formatCellLabel(time, selected, blocked),
        "aria-pressed": selected,
        tabIndex: blocked ? -1 : 0,
        $height: "40px",
        $margin: _this.props.margin,
        key: time.toISOString(),
        ref: refSetter
        // Mouse handlers
        ,
        onMouseDown: startHandler,
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
        onTouchStart: startHandler,
        onTouchMove: _this.handleTouchMoveEvent,
        onTouchEnd: _this.handleTouchEndEvent,
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
    _this.dates = buildDates(props);
    _this.cellToDate = new Map();
    _this.dateToCell = new Map();
    var selectionDraft = normalizeDates(_this.props.selection);
    _this.state = {
      selectionDraft: selectionDraft,
      selectionBase: selectionDraft,
      // eslint-disable-next-line react/no-unused-state
      selectionProp: _this.props.selection,
      selectionType: null,
      selectionStart: null,
      isTouchDragging: false
    };
    _this.selectionSchemeHandlers = {
      linear: _selectionSchemes.default.linear,
      square: _selectionSchemes.default.square
    };
    _this.endSelection = _this.endSelection.bind(_this);
    _this.handleMouseUpEvent = _this.handleMouseUpEvent.bind(_this);
    _this.handleMouseEnterEvent = _this.handleMouseEnterEvent.bind(_this);
    _this.handleTouchMoveEvent = _this.handleTouchMoveEvent.bind(_this);
    _this.handleTouchEndEvent = _this.handleTouchEndEvent.bind(_this);
    _this.handleSelectionStartEvent = _this.handleSelectionStartEvent.bind(_this);
    _this.handleDocumentMouseUpEvent = _this.handleDocumentMouseUpEvent.bind(_this);
    _this.handleCellKeyDownEvent = _this.handleCellKeyDownEvent.bind(_this);
    return _this;
  }
  _inheritsLoose(BookingSelector, _React$Component);
  BookingSelector.getDerivedStateFromProps = function getDerivedStateFromProps(props, state) {
    if (props.selection === state.selectionProp) return null;
    var selectionDraft = normalizeDates(props.selection);
    return {
      selectionDraft: selectionDraft,
      selectionBase: selectionDraft,
      selectionProp: props.selection
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
    return Boolean(this.props.blocked.find(function (blockedTime) {
      return dateIsSameMinute(blockedTime, time);
    }));
  };
  _proto.isSelected = function isSelected(time) {
    return Boolean(this.state.selectionDraft.find(function (selectedTime) {
      return dateIsSameMinute(selectedTime, time);
    }));
  };
  _proto.handleDocumentMouseUpEvent = function handleDocumentMouseUpEvent(event) {
    if (this.state.selectionType === null) return;
    var gridRef = this.gridRef;
    var target = event.target;
    if (gridRef && target instanceof Node && gridRef.contains(target)) return;
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
      this.props.onChange(this.state.selectionDraft);
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
    var newSelection = [];
    if (selectionStart && selectionType) {
      var selectionSchemeHandler = this.selectionSchemeHandlers[this.props.selectionScheme] || this.selectionSchemeHandlers.square;
      newSelection = selectionSchemeHandler(selectionStart, selectionEnd, this.dates);
    }
    var availableSelection = newSelection.filter(function (time) {
      return !_this2.isBlocked(time);
    });
    var nextDraft = [].concat(this.state.selectionBase);
    if (selectionType === 'add') {
      nextDraft = uniqueDatesByMinute([].concat(nextDraft, availableSelection));
    } else if (selectionType === 'remove') {
      nextDraft = nextDraft.filter(function (date) {
        return !availableSelection.find(function (selectedDate) {
          return dateIsSameMinute(date, selectedDate);
        });
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
  _proto.handleMouseEnterEvent = function handleMouseEnterEvent(time) {
    // Need to update selection draft on mouseup as well in order to catch the cases
    // where the user just clicks on a single cell (because no mouseenter events fire
    // in this scenario)
    this.updateAvailabilityDraft(time);
  };
  _proto.handleMouseUpEvent = function handleMouseUpEvent(time) {
    this.updateAvailabilityDraft(time, this.endSelection);
  };
  _proto.getKeyboardNavigationTarget = function getKeyboardNavigationTarget(time, key) {
    if (key === 'ArrowRight') return (0, _dateFns.addDays)(time, 1);
    if (key === 'ArrowLeft') return (0, _dateFns.addDays)(time, -1);
    if (key === 'ArrowDown') return (0, _dateFns.addHours)(time, 1);
    if (key === 'ArrowUp') return (0, _dateFns.addHours)(time, -1);
    return null;
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
    var navigationTarget = this.getKeyboardNavigationTarget(time, event.key);
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
  _proto.handleTouchMoveEvent = function handleTouchMoveEvent(event) {
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
    if (!this.state.isTouchDragging) {
      // Going down this branch means the user tapped but didn't drag -- which
      // means the availability draft hasn't yet been updated (since
      // handleTouchMoveEvent was never called) so we need to do it now
      this.updateAvailabilityDraft(null, function () {
        _this4.endSelection();
      });
    } else {
      this.endSelection();
    }
    this.setState({
      isTouchDragging: false
    });
  };
  _proto.render = function render() {
    var _this5 = this;
    this.dates = buildDates(this.props);
    return /*#__PURE__*/React.createElement(Wrapper, null, /*#__PURE__*/React.createElement(Grid, {
      ref: function ref(el) {
        _this5.gridRef = el;
      }
    }, this.renderTimeLabels(), this.dates.map(this.renderDateColumn)));
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
  dateFormat: 'd',
  margin: 3,
  selectedColor: _colors.default.blue,
  unselectedColor: _colors.default.paleBlue,
  hoveredColor: _colors.default.lightBlue,
  blockedColor: _colors.default.black,
  onChange: function onChange() {}
};