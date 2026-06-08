"use strict";

exports.__esModule = true;
exports.Text = exports.Subtitle = void 0;
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _colors = _interopRequireDefault(require("./colors"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
var Subtitle = exports.Subtitle = _styledComponents.default.h2.withConfig({
  displayName: "typography__Subtitle",
  componentId: "sc-1j23juc-0"
})(["font-size:20px;font-weight:400;color:", ";text-align:", ";@media (max-width:700px){font-size:18px;}"], _colors.default.black, function (props) {
  return props.align || 'center';
});
var Text = exports.Text = _styledComponents.default.p.withConfig({
  displayName: "typography__Text",
  componentId: "sc-1j23juc-1"
})(["font-size:14px;font-weight:300;line-height:", "px;color:", ";margin:5px 0;"], 14 * 1.37, _colors.default.grey);