var _templateObject, _templateObject2;
function _taggedTemplateLiteralLoose(e, t) { return t || (t = e.slice(0)), e.raw = t, e; }
import colors from './colors.js';
import styled from './styled.js';
export var Subtitle = styled.h2(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["\n  font-size: 20px;\n  font-weight: 400;\n  color: ", ";\n  text-align: ", ";\n\n  @media (max-width: 700px) {\n    font-size: 18px;\n  }\n"])), colors.black, function (props) {
  return props.align || 'center';
});
export var Text = styled.p(_templateObject2 || (_templateObject2 = _taggedTemplateLiteralLoose(["\n  font-size: 14px;\n  font-weight: 300;\n  line-height: ", "px;\n  color: ", ";\n  margin: 5px 0;\n"])), 14 * 1.37, colors.grey);