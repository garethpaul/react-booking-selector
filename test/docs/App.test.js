import React from 'react'
import { render } from '@testing-library/react'

import { App } from '../../src/docs/App'

it('renders the GitHub link as a safe external link', () => {
  const { getByRole } = render(React.createElement(App))
  const link = getByRole('link', { name: 'GitHub' })

  expect(link).toHaveAttribute('href', 'https://github.com/garethpaul/react-booking-selector')
  expect(link).toHaveAttribute('target', '_blank')
  expect(link).toHaveAttribute('rel', 'noopener noreferrer')
})
