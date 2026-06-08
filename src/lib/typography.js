// @flow

import colors from './colors.js'
import styled from './styled.js'

export const Subtitle = styled.h2`
  font-size: 20px;
  font-weight: 400;
  color: ${colors.black};
  text-align: ${props => props.align || 'center'};

  @media (max-width: 700px) {
    font-size: 18px;
  }
`

export const Text = styled.p`
  font-size: 14px;
  font-weight: 300;
  line-height: ${14 * 1.37}px;
  color: ${colors.grey};
  margin: 5px 0;
`
