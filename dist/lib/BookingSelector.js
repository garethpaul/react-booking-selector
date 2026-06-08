'use strict';

exports.__esModule = true;
exports.preventScroll = exports.GridCell = undefined;

var _react = require('react');

var React = _interopRequireWildcard(_react);

var _styledComponents = require('styled-components');

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _add_hours = require('date-fns/add_hours');

var _add_hours2 = _interopRequireDefault(_add_hours);

var _add_days = require('date-fns/add_days');

var _add_days2 = _interopRequireDefault(_add_days);

var _start_of_day = require('date-fns/start_of_day');

var _start_of_day2 = _interopRequireDefault(_start_of_day);

var _is_same_minute = require('date-fns/is_same_minute');

var _is_same_minute2 = _interopRequireDefault(_is_same_minute);

var _format = require('date-fns/format');

var _format2 = _interopRequireDefault(_format);

var _typography = require('./typography');

var _colors = require('./colors');

var _colors2 = _interopRequireDefault(_colors);

var _selectionSchemes = require('./selection-schemes');

var _selectionSchemes2 = _interopRequireDefault(_selectionSchemes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Import only the methods we need from date-fns in order to keep build size small


var toCssUnit = function toCssUnit(value) {
  if (value == null) return '0px';
  if (typeof value === 'number') return value + 'px';
  return (/^-?\d+(\.\d+)?$/.test(value) ? value + 'px' : value
  );
};

var toDate = function toDate(value) {
  return value instanceof Date ? value : new Date(value.valueOf());
};

var normalizeDates = function normalizeDates(dates) {
  return dates.map(toDate);
};

var dateIsSameMinute = function dateIsSameMinute(a, b) {
  return (0, _is_same_minute2.default)(toDate(a), toDate(b));
};

var uniqueDatesByMinute = function uniqueDatesByMinute(dates) {
  return dates.reduce(function (acc, date) {
    if (acc.find(function (existingDate) {
      return dateIsSameMinute(existingDate, date);
    })) return acc;
    return [].concat(acc, [date]);
  }, []);
};

var buildDates = function buildDates(_ref) {
  var startDate = _ref.startDate,
      numDays = _ref.numDays,
      minTime = _ref.minTime,
      maxTime = _ref.maxTime;

  var startTime = (0, _start_of_day2.default)(startDate);
  var dates = [];
  for (var d = 0; d < numDays; d += 1) {
    var currentDay = [];
    for (var h = minTime; h <= maxTime; h += 1) {
      currentDay.push((0, _add_hours2.default)((0, _add_days2.default)(startTime, d), h));
    }
    dates.push(currentDay);
  }
  return dates;
};

var formatHour = function formatHour(hour) {
  var h = hour === 0 || hour === 12 || hour === 24 ? 12 : hour % 12;
  var abb = hour < 12 || hour === 24 ? 'am' : 'pm';
  return h + ' ' + abb;
};

var Wrapper = (0, _styledComponents2.default)('div').withConfig({
  displayName: 'BookingSelector__Wrapper',
  componentId: 'sc-1e1auar-0'
})(['display:flex;align-items:center;width:100%;user-select:none;']);

var Grid = (0, _styledComponents2.default)('div').withConfig({
  displayName: 'BookingSelector__Grid',
  componentId: 'sc-1e1auar-1'
})(['display:flex;flex-direction:row;align-items:stretch;width:100%;']);

var Column = (0, _styledComponents2.default)('div').withConfig({
  displayName: 'BookingSelector__Column',
  componentId: 'sc-1e1auar-2'
})(['display:flex;flex-direction:column;justify-content:space-evenly;flex-grow:1;']);

var GridCell = exports.GridCell = (0, _styledComponents2.default)('div').withConfig({
  displayName: 'BookingSelector__GridCell',
  componentId: 'sc-1e1auar-3'
})(['margin:', ';height:', ';touch-action:none;'], function (props) {
  return toCssUnit(props.margin);
}, function (props) {
  return toCssUnit(props.height);
});

// Style the Date Cell
var DateCell = (0, _styledComponents2.default)('div').withConfig({
  displayName: 'BookingSelector__DateCell',
  componentId: 'sc-1e1auar-4'
})(['width:100%;height:100%;border-radius:4px;transition:background-color 120ms ease,transform 120ms ease;', ' ', ' ', ' &:hover{cursor:', ';background-color:', ';}'], function (props) {
  return props.selected && !props.blocked && 'background-color: ' + props.selectedColor + ';';
}, function (props) {
  return !props.selected && !props.blocked && 'background-color: ' + props.unselectedColor + ';';
}, function (props) {
  return props.blocked && 'background-color: ' + props.blockedColor + ';';
}, function (props) {
  return props.blocked ? 'not-allowed' : 'pointer';
}, function (props) {
  return props.blocked ? props.blockedColor : props.hoveredColor;
});

var DateLabel = (0, _styledComponents2.default)(_typography.Subtitle).withConfig({
  displayName: 'BookingSelector__DateLabel',
  componentId: 'sc-1e1auar-5'
})(['height:15px;font-size:19px;margin:0px;margin-top:5px;padding:0px;@media (max-width:699px){font-size:10px;}']);

var DayLabel = (0, _styledComponents2.default)(_typography.Subtitle).withConfig({
  displayName: 'BookingSelector__DayLabel',
  componentId: 'sc-1e1auar-6'
})(['height:15px;font-size:10px;margin:0px;padding:0px;@media (max-width:699px){font-size:6px;}']);

var TimeLabelCell = (0, _styledComponents2.default)('div').withConfig({
  displayName: 'BookingSelector__TimeLabelCell',
  componentId: 'sc-1e1auar-7'
})(['position:relative;width:100%;height:40px;padding-right:15px;display:flex;justify-content:flex-end;align-items:center;color:rgb(112,117,122);']);

var TimeText = (0, _styledComponents2.default)(_typography.Text).withConfig({
  displayName: 'BookingSelector__TimeText',
  componentId: 'sc-1e1auar-8'
})(['margin:0;font-size:11px;@media (max-width:699px){font-size:7px;}text-align:right;text-transform:uppercase;']);

var preventScroll = exports.preventScroll = function preventScroll(e) {
  e.preventDefault();
};

var BookingSelector = function (_React$Component) {
  _inherits(BookingSelector, _React$Component);

  function BookingSelector(props) {
    _classCallCheck(this, BookingSelector);

    var _this = _possibleConstructorReturn(this, _React$Component.call(this, props));

    _this.renderTimeLabels = function () {
      var labels = [React.createElement(GridCell, { height: '40', key: -1 })]; // Ensures time labels start at correct location
      for (var t = _this.props.minTime; t <= _this.props.maxTime; t += 1) {
        labels.push(React.createElement(
          TimeLabelCell,
          { key: t },
          React.createElement(
            TimeText,
            null,
            formatHour(t)
          )
        ));
      }
      return React.createElement(
        Column,
        { margin: _this.props.margin },
        labels
      );
    };

    _this.renderDateColumn = function (dayOfTimes) {
      return React.createElement(
        Column,
        { key: dayOfTimes[0], margin: _this.props.margin },
        React.createElement(
          GridCell,
          { height: '50', margin: _this.props.margin },
          React.createElement(
            DayLabel,
            null,
            (0, _format2.default)(dayOfTimes[0], 'ddd').toUpperCase()
          ),
          React.createElement(
            DateLabel,
            null,
            (0, _format2.default)(dayOfTimes[0], _this.props.dateFormat)
          )
        ),
        dayOfTimes.map(function (time) {
          return _this.renderDateCellWrapper(time);
        })
      );
    };

    _this.renderDateCellWrapper = function (time) {
      var blocked = _this.isBlocked(time);
      var selected = _this.isSelected(time);
      var startHandler = function startHandler() {
        if (!blocked) _this.handleSelectionStartEvent(time);
      };
      var refSetter = function refSetter(dateCell) {
        if (dateCell) _this.cellToDate.set(dateCell, time);
      };

      return React.createElement(
        GridCell,
        {
          className: 'rgdp__grid-cell',
          role: 'button',
          'aria-disabled': blocked,
          'aria-pressed': selected,
          tabIndex: blocked ? -1 : 0,
          height: '40px',
          margin: _this.props.margin,
          key: time.toISOString(),
          innerRef: refSetter
          // Mouse handlers
          , onMouseDown: startHandler,
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
          , onTouchStart: startHandler,
          onTouchMove: _this.handleTouchMoveEvent,
          onTouchEnd: _this.handleTouchEndEvent,
          onKeyDown: function onKeyDown(event) {
            _this.handleCellKeyDownEvent(event, time, blocked);
          }
        },
        _this.renderDateCell(time, selected, blocked)
      );
    };

    _this.renderDateCell = function (time, selected, blocked) {
      /* WEEKEND
      if (formatDate(time, 'd') === 0) {
        return (
          <DateCell
            blocked={true}
            selected={false}
            innerRef={refSetter}
            selectedColor={this.props.unselectedColor}
            unselectedColor={this.props.selectedColor}
            hoveredColor={this.props.hoveredColor}
            blockedColor={this.props.blockedColor}
          />
        )
      }
      if (formatDate(time, 'd') === 6) {
        return (
          <DateCell
            blocked={true}
            selected={false}
            innerRef={refSetter}
            selectedColor={this.props.unselectedColor}
            unselectedColor={this.props.selectedColor}
            hoveredColor={this.props.hoveredColor}
            blockedColor={this.props.blockedColor}
          />
        )
      }
      */

      if (_this.props.renderDateCell) {
        return _this.props.renderDateCell(time, selected, blocked);
      }

      return React.createElement(DateCell, {
        blocked: blocked,
        selected: selected,
        selectedColor: _this.props.selectedColor,
        unselectedColor: _this.props.unselectedColor,
        hoveredColor: _this.props.hoveredColor,
        blockedColor: _this.props.blockedColor
      });
    };

    _this.dates = buildDates(props);
    _this.cellToDate = new Map();

    _this.state = {
      selectionDraft: normalizeDates(_this.props.selection),
      // eslint-disable-next-line react/no-unused-state
      selectionProp: _this.props.selection,
      selectionType: null,
      selectionStart: null,
      isTouchDragging: false
    };

    _this.selectionSchemeHandlers = {
      linear: _selectionSchemes2.default.linear,
      square: _selectionSchemes2.default.square
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

  BookingSelector.getDerivedStateFromProps = function getDerivedStateFromProps(props, state) {
    if (props.selection === state.selectionProp) return null;

    return {
      selectionDraft: normalizeDates(props.selection),
      selectionProp: props.selection
    };
  };

  BookingSelector.prototype.componentDidMount = function componentDidMount() {
    // We need to add the endSelection event listener to the document itself in order
    // to catch the cases where the users ends their mouse-click somewhere besides
    // the date cells (in which case none of the DateCell's onMouseUp handlers would fire)
    //
    // This isn't necessary for touch events since the `touchend` event fires on
    // the element where the touch/drag started so it's always caught.
    document.addEventListener('mouseup', this.handleDocumentMouseUpEvent);

    // Prevent page scrolling when user is dragging on the date cells
    this.cellToDate.forEach(function (value, dateCell) {
      if (dateCell && dateCell.addEventListener) {
        dateCell.addEventListener('touchmove', preventScroll, { passive: false });
      }
    });
  };

  BookingSelector.prototype.componentWillUnmount = function componentWillUnmount() {
    document.removeEventListener('mouseup', this.handleDocumentMouseUpEvent);
    this.cellToDate.forEach(function (value, dateCell) {
      if (dateCell && dateCell.removeEventListener) {
        dateCell.removeEventListener('touchmove', preventScroll);
      }
    });
  };

  BookingSelector.prototype.isBlocked = function isBlocked(time) {
    return Boolean(this.props.blocked.find(function (blockedTime) {
      return dateIsSameMinute(blockedTime, time);
    }));
  };

  BookingSelector.prototype.isSelected = function isSelected(time) {
    return Boolean(this.state.selectionDraft.find(function (selectedTime) {
      return dateIsSameMinute(selectedTime, time);
    }));
  };

  BookingSelector.prototype.handleDocumentMouseUpEvent = function handleDocumentMouseUpEvent(event) {
    if (this.state.selectionType === null) return;
    var gridRef = this.gridRef;
    var target = event.target;

    if (gridRef && target instanceof Node && gridRef.contains(target)) return;
    this.endSelection();
  };

  // Performs a lookup into this.cellToDate to retrieve the Date that corresponds to
  // the cell where this touch event is right now. Note that this method will only work
  // if the event is a `touchmove` event since it's the only one that has a `touches` list.


  BookingSelector.prototype.getTimeFromTouchEvent = function getTimeFromTouchEvent(event) {
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

  BookingSelector.prototype.endSelection = function endSelection() {
    if (this.state.selectionType !== null) {
      this.props.onChange(this.state.selectionDraft);
    }
    this.setState({
      selectionType: null,
      selectionStart: null
    });
  };

  // Given an ending Date, determines all the dates that should be selected in this draft


  BookingSelector.prototype.updateAvailabilityDraft = function updateAvailabilityDraft(selectionEnd, callback) {
    var _this2 = this;

    var _state = this.state,
        selectionType = _state.selectionType,
        selectionStart = _state.selectionStart;


    if (selectionType === null || selectionStart === null) return;

    var newSelection = [];
    if (selectionStart && selectionType) {
      newSelection = this.selectionSchemeHandlers[this.props.selectionScheme](selectionStart, selectionEnd, this.dates);
    }
    var availableSelection = newSelection.filter(function (time) {
      return !_this2.isBlocked(time);
    });
    var nextDraft = normalizeDates(this.props.selection);
    if (selectionType === 'add') {
      nextDraft = uniqueDatesByMinute([].concat(nextDraft, availableSelection));
    } else if (selectionType === 'remove') {
      nextDraft = nextDraft.filter(function (date) {
        return !availableSelection.find(function (selectedDate) {
          return dateIsSameMinute(date, selectedDate);
        });
      });
    }
    this.setState({ selectionDraft: nextDraft }, callback);
  };

  // Isomorphic (mouse and touch) handler since starting a selection works the same way for both classes of user input


  BookingSelector.prototype.handleSelectionStartEvent = function handleSelectionStartEvent(startTime) {
    if (this.isBlocked(startTime)) return;

    // Check if the startTime cell is selected/unselected to determine if this drag-select should
    // add values or remove values
    var timeSelected = this.props.selection.find(function (date) {
      return dateIsSameMinute(date, startTime);
    });
    this.setState({
      selectionType: timeSelected ? 'remove' : 'add',
      selectionStart: startTime
    });
  };

  BookingSelector.prototype.handleMouseEnterEvent = function handleMouseEnterEvent(time) {
    // Need to update selection draft on mouseup as well in order to catch the cases
    // where the user just clicks on a single cell (because no mouseenter events fire
    // in this scenario)
    this.updateAvailabilityDraft(time);
  };

  BookingSelector.prototype.handleMouseUpEvent = function handleMouseUpEvent(time) {
    this.updateAvailabilityDraft(time, this.endSelection);
  };

  BookingSelector.prototype.handleCellKeyDownEvent = function handleCellKeyDownEvent(event, time, blocked) {
    var _this3 = this;

    if (blocked || event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    var timeSelected = this.props.selection.find(function (date) {
      return dateIsSameMinute(date, time);
    });
    this.setState({
      selectionType: timeSelected ? 'remove' : 'add',
      selectionStart: time
    }, function () {
      _this3.updateAvailabilityDraft(time, _this3.endSelection);
    });
  };

  BookingSelector.prototype.handleTouchMoveEvent = function handleTouchMoveEvent(event) {
    this.setState({ isTouchDragging: true });
    var cellTime = this.getTimeFromTouchEvent(event);
    if (cellTime) {
      this.updateAvailabilityDraft(cellTime);
    }
  };

  BookingSelector.prototype.handleTouchEndEvent = function handleTouchEndEvent() {
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
    this.setState({ isTouchDragging: false });
  };

  BookingSelector.prototype.render = function render() {
    var _this5 = this;

    this.dates = buildDates(this.props);

    return React.createElement(
      Wrapper,
      null,
      React.createElement(
        Grid,
        {
          innerRef: function innerRef(el) {
            _this5.gridRef = el;
          }
        },
        this.renderTimeLabels(),
        this.dates.map(this.renderDateColumn)
      )
    );
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
  startDate: new Date(),
  dateFormat: 'D',
  margin: 3,
  selectedColor: _colors2.default.blue,
  unselectedColor: _colors2.default.paleBlue,
  hoveredColor: _colors2.default.lightBlue,
  blockedColor: _colors2.default.black,
  onChange: function onChange() {}
};
exports.default = BookingSelector;