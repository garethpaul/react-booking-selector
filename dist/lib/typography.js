"use strict";

exports.__esModule = true;
exports.Text = exports.Subtitle = void 0;
var _colors = _interopRequireDefault(require("./colors.js"));
var _styled = _interopRequireDefault(require("./styled.js"));
var _templateObject, _templateObject2;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _taggedTemplateLiteralLoose(e, t) { return t || (t = e.slice(0)), e.raw = t, e; }
var Subtitle = exports.Subtitle = _styled.default.h2(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["\n  font-size: 20px;\n  font-weight: 400;\n  color: ", ";\n  text-align: ", ";\n\n  @media (max-width: 700px) {\n    font-size: 18px;\n  }\n"])), _colors.default.black, function (props) {
  return props.align || 'center';
});
var Text = exports.Text = _styled.default.p(_templateObject2 || (_templateObject2 = _taggedTemplateLiteralLoose(["\n  font-size: 14px;\n  font-weight: 300;\n  line-height: ", "px;\n  color: ", ";\n  margin: 5px 0;\n"])), 14 * 1.37, _colors.default.grey);