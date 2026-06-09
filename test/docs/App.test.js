import React from 'react'
import { fireEvent, render, waitFor, within } from '@testing-library/react'

import { App } from '../../src/docs/App'

it('renders the demo content in a main landmark', () => {
  const { getByRole } = render(React.createElement(App))
  const main = getByRole('main')

  expect(within(main).getByRole('heading', { name: 'React Booking Selector' })).toBeInTheDocument()
})

it('renders the GitHub link as a safe external link', () => {
  const { getByRole } = render(React.createElement(App))
  const link = getByRole('link', { name: 'GitHub repository, opens in a new tab' })

  expect(link).toHaveAttribute('href', 'https://github.com/garethpaul/react-booking-selector')
  expect(link).toHaveAttribute('target', '_blank')
  expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  expect(link).toHaveStyleRule('outline', '2px solid #599af2', { modifier: ':focus' })
  expect(link).toHaveStyleRule('outline', 'none', { modifier: ':focus:not(:focus-visible)' })
  expect(link).toHaveStyleRule('outline', '2px solid #599af2', { modifier: ':focus-visible' })
})

it('updates the visible selection count when the demo grid changes', async () => {
  const { getByRole } = render(React.createElement(App))
  const status = getByRole('status')
  const slotGroup = getByRole('group', { name: 'Booking time slots' })
  const firstSlot = getByRole('button', { name: 'Available Monday, April 6, 2020 at 8 am' })

  expect(status).toHaveTextContent('0 selected - 3 blocked')
  expect(status).toHaveAttribute('id', 'booking-selector-demo-status')
  expect(status).toHaveAttribute('aria-atomic', 'true')
  expect(status).toHaveAttribute('aria-live', 'polite')
  expect(slotGroup).toHaveAttribute('aria-describedby', 'booking-selector-demo-status')
  expect(slotGroup).toHaveAccessibleDescription('0 selected - 3 blocked')

  fireEvent.mouseDown(firstSlot)
  fireEvent.mouseUp(firstSlot)

  await waitFor(() => {
    expect(status).toHaveTextContent('1 selected - 3 blocked')
  })
})
