'use strict';

var _templateObject = _taggedTemplateLiteralLoose(['\n  body {\n    font-family: sans-serif;\n  }\n\n  * {\n    box-sizing: border-box;\n  }\n'], ['\n  body {\n    font-family: sans-serif;\n  }\n\n  * {\n    box-sizing: border-box;\n  }\n']);

var _react = require('react');

var React = _interopRequireWildcard(_react);

var _styledComponents = require('styled-components');

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _reactDom = require('react-dom');

var ReactDOM = _interopRequireWildcard(_reactDom);

var _lib = require('../lib');

var _lib2 = _interopRequireDefault(_lib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _taggedTemplateLiteralLoose(strings, raw) { strings.raw = raw; return strings; }
// eslint-disable-next-line


// eslint-disable-next-line
(0, _styledComponents.injectGlobal)(_templateObject);

var MainDiv = (0, _styledComponents2.default)('div').withConfig({
  displayName: 'App__MainDiv',
  componentId: 'sc-1bti9fu-0'
})(['display:flex;flex-direction:column;align-items:center;']);

var IntroText = (0, _styledComponents2.default)('div').withConfig({
  displayName: 'App__IntroText',
  componentId: 'sc-1bti9fu-1'
})(['width:100%;text-align:center;']);

var ScheduleSelectorCard = (0, _styledComponents2.default)('div').withConfig({
  displayName: 'App__ScheduleSelectorCard',
  componentId: 'sc-1bti9fu-2'
})(['border-radius:25px;box-shadow:10px 2px 30px rgba(0,0,0,0.15);padding:20px;width:90%;max-width:800px;& > *{flex-grow:1;}']);

var Links = (0, _styledComponents2.default)('div').withConfig({
  displayName: 'App__Links',
  componentId: 'sc-1bti9fu-3'
})(['display:flex;margin-top:20px;']);

var ExternalLink = (0, _styledComponents2.default)('a').withConfig({
  displayName: 'App__ExternalLink',
  componentId: 'sc-1bti9fu-4'
})(['background-color:', ';color:white;padding:10px;border-radius:3px;cursor:pointer;text-decoration:none;margin:5px;'], function (props) {
  return props.color;
});

var App = function (_React$Component) {
  _inherits(App, _React$Component);

  function App() {
    var _temp, _this, _ret;

    _classCallCheck(this, App);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _React$Component.call.apply(_React$Component, [this].concat(args))), _this), _this.state = { schedule: [] }, _this.handleDateChange = function (newSchedule) {
      _this.setState({ schedule: newSchedule });
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  App.prototype.render = function render() {
    return React.createElement(
      MainDiv,
      null,
      React.createElement(
        IntroText,
        null,
        React.createElement(
          'h1',
          null,
          'React Schedule Selector'
        ),
        React.createElement(
          'p',
          null,
          'Tap to select one time or drag to select multiple times at once.'
        )
      ),
      React.createElement(
        ScheduleSelectorCard,
        null,
        React.createElement(_lib2.default, {
          minTime: 12,
          maxTime: 20,
          numDays: 7,
          selection: this.state.schedule,
          onChange: this.handleDateChange
        })
      ),
      React.createElement(
        Links,
        null,
        React.createElement(
          ExternalLink,
          { color: '#24292e', href: 'https://github.com/bibekg/react-schedule-selector' },
          'GitHub'
        ),
        React.createElement(
          ExternalLink,
          { color: '#cb3838', href: 'https://npmjs.com/package/react-schedule-selector' },
          'NPM'
        ),
        React.createElement(
          ExternalLink,
          { color: '#292929', href: 'https://medium.com/@bibekg/react-schedule-selector-6cd5bf1f4968' },
          'Medium'
        )
      )
    );
  };

  return App;
}(React.Component);

// flow-disable-next-line


ReactDOM.render(React.createElement(App, null), document.getElementById('app'));