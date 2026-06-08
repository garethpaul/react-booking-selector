const loadStyledWithMock = mock => {
  jest.resetModules()
  jest.doMock('styled-components', () => mock)
  const styled = require('../../src/lib/styled').default
  jest.dontMock('styled-components')
  return styled
}

describe('styled-components interop', () => {
  it('uses a callable CommonJS export directly', () => {
    const styledFactory = jest.fn()

    expect(loadStyledWithMock(styledFactory)).toBe(styledFactory)
  })

  it('uses a callable default property from namespace-shaped exports', () => {
    const styledFactory = jest.fn()

    expect(loadStyledWithMock({ default: styledFactory })).toBe(styledFactory)
  })

  it('falls back to a callable styled property from ESM namespace-shaped exports', () => {
    const styledFactory = jest.fn()

    expect(loadStyledWithMock({ styled: styledFactory })).toBe(styledFactory)
  })
})
