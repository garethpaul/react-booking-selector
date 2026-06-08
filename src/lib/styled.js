// @flow

import styledComponents from 'styled-components'

const styled =
  typeof styledComponents === 'function'
    ? styledComponents
    : styledComponents && typeof styledComponents.default === 'function'
      ? styledComponents.default
      : styledComponents.styled

export default styled
