import React, { act } from 'react'
import { addDays, addHours, startOfDay } from 'date-fns'
import { fireEvent, render, waitFor } from '@testing-library/react'

import BookingSelector, { preventScroll } from '../../src/lib/BookingSelector'

const startDate = new Date('2018-01-01T00:00:00.000')

const getTestSchedule = () => [addHours(startOfDay(startDate), 12), addHours(addDays(startOfDay(startDate), 1), 13)]

const renderSelector = (props = {}) => {
  const instanceRef = React.createRef()
  const utils = render(<BookingSelector {...props} ref={instanceRef} />)
  return {
    ...utils,
    get instance() {
      return instanceRef.current
    },
    rerenderWithProps(nextProps) {
      utils.rerender(<BookingSelector {...nextProps} ref={instanceRef} />)
    }
  }
}

const setStateAsync = (instance, state) =>
  act(async () => {
    instance.setState(state)
  })

const clickCell = cell => {
  fireEvent.mouseDown(cell)
  fireEvent.mouseUp(cell)
}

beforeEach(() => {
  document.elementFromPoint = jest.fn()
})

afterEach(() => {
  jest.useRealTimers()
})

describe('snapshot tests', () => {
  it('renders correctly with default render logic', () => {
    const { container } = renderSelector({
      selection: getTestSchedule(),
      startDate,
      numDays: 5,
      onChange: () => undefined
    })

    expect(container.firstChild).toMatchSnapshot()
  })

  it('renders correctly with custom render prop', () => {
    const customDateCellRenderer = (date, selected) => (
      <div className={`${selected && 'selected'} test-date-cell-renderer`}>{date.toDateString()}</div>
    )

    const { container } = renderSelector({
      selection: getTestSchedule(),
      startDate,
      numDays: 5,
      onChange: () => undefined,
      renderDateCell: customDateCellRenderer
    })

    expect(container.firstChild).toMatchSnapshot()
  })
})

it('getTimeFromTouchEvent returns the time for that cell', () => {
  const { instance } = renderSelector()
  const mainSpy = jest.spyOn(instance, 'getTimeFromTouchEvent')
  const mockCellTime = new Date()
  const mockEvent = {
    touches: [{ clientX: 1, clientY: 2 }]
  }
  const mockElement = {}
  document.elementFromPoint.mockReturnValue(mockElement)
  const cellToDateSpy = jest.spyOn(instance.cellToDate, 'get').mockReturnValue(mockCellTime)

  instance.getTimeFromTouchEvent(mockEvent)

  expect(document.elementFromPoint).toHaveBeenCalledWith(mockEvent.touches[0].clientX, mockEvent.touches[0].clientY)
  expect(cellToDateSpy).toHaveBeenCalled()
  expect(mainSpy).toHaveReturnedWith(mockCellTime)

  mainSpy.mockRestore()
  cellToDateSpy.mockRestore()
})

it('endSelection calls the onChange prop and resets selection state', async () => {
  const changeSpy = jest.fn()
  const { instance } = renderSelector({ onChange: changeSpy })
  const setStateSpy = jest.spyOn(instance, 'setState')

  await setStateAsync(instance, { selectionType: 'add' })
  act(() => {
    instance.endSelection()
  })

  expect(changeSpy).toHaveBeenCalledWith(instance.state.selectionDraft)
  expect(setStateSpy).toHaveBeenCalledWith({
    selectionType: null,
    selectionStart: null
  })

  setStateSpy.mockRestore()
})

describe('mouse handlers', () => {
  const spies = {}

  beforeEach(() => {
    spies.onMouseDown = jest.spyOn(BookingSelector.prototype, 'handleSelectionStartEvent')
    spies.onMouseEnter = jest.spyOn(BookingSelector.prototype, 'handleMouseEnterEvent')
    spies.onMouseUp = jest.spyOn(BookingSelector.prototype, 'handleMouseUpEvent')
  })

  test.each([
    ['onMouseDown', cell => fireEvent.mouseDown(cell)],
    ['onMouseEnter', cell => fireEvent.mouseEnter(cell)],
    ['onMouseUp', cell => fireEvent.mouseUp(cell)]
  ])('calls the handler for %s', (name, fireHandler) => {
    const { container } = renderSelector()
    const cell = container.querySelector('[role="button"]')

    fireHandler(cell)

    expect(spies[name]).toHaveBeenCalled()
  })

  afterEach(() => {
    Object.keys(spies).forEach(spyName => {
      spies[spyName].mockRestore()
    })
  })
})

describe('touch handlers', () => {
  const spies = {}
  const mockEvent = {
    touches: [{ clientX: 1, clientY: 2 }, { clientX: 100, clientY: 200 }]
  }

  beforeEach(() => {
    spies.onTouchStart = jest.spyOn(BookingSelector.prototype, 'handleSelectionStartEvent')
    spies.onTouchMove = jest.spyOn(BookingSelector.prototype, 'handleTouchMoveEvent')
    spies.onTouchEnd = jest.spyOn(BookingSelector.prototype, 'handleTouchEndEvent')
  })

  test.each([
    ['onTouchStart', cell => fireEvent.touchStart(cell)],
    ['onTouchMove', cell => fireEvent.touchMove(cell, mockEvent)],
    ['onTouchEnd', cell => fireEvent.touchEnd(cell)]
  ])('calls the handler for %s', (name, fireHandler) => {
    const { container } = renderSelector()
    const cell = container.querySelector('[role="button"]')

    fireHandler(cell)

    expect(spies[name]).toHaveBeenCalled()
  })

  afterEach(() => {
    Object.keys(spies).forEach(spyName => {
      spies[spyName].mockRestore()
    })
  })
})

it('handleTouchMoveEvent updates the availability draft', () => {
  const mockCellTime = new Date()
  const getTimeSpy = jest.spyOn(BookingSelector.prototype, 'getTimeFromTouchEvent').mockReturnValue(mockCellTime)
  const updateDraftSpy = jest.spyOn(BookingSelector.prototype, 'updateAvailabilityDraft')
  const { instance } = renderSelector()

  act(() => {
    instance.handleTouchMoveEvent({})
  })

  expect(updateDraftSpy).toHaveBeenCalledWith(mockCellTime)

  getTimeSpy.mockRestore()
  updateDraftSpy.mockRestore()
})

describe('updateAvailabilityDraft', () => {
  it.each([
    ['add', 1],
    ['remove', 1],
    ['add', -1],
    ['remove', -1]
  ])(
    'updateAvailabilityDraft handles addition and removals, for forward and reversed drags',
    async (type, amount) => {
      const start = addHours(startDate, 5)
      const end = addHours(start, amount)
      const outOfRangeOne = addHours(start, amount + 5)

      const { instance } = renderSelector({
        selection: type === 'remove' ? [start, end, outOfRangeOne] : [outOfRangeOne],
        startDate: start,
        numDays: 5,
        minTime: 0,
        maxTime: 23
      })

      await setStateAsync(instance, {
        selectionType: type,
        selectionStart: start
      })

      await act(async () => {
        instance.updateAvailabilityDraft(end)
      })

      expect(instance.state.selectionDraft).toEqual(expect.arrayContaining([]))
    }
  )

  it('updateAvailabilityDraft handles a single cell click correctly', async () => {
    const { instance } = renderSelector()
    const start = startDate

    await setStateAsync(instance, {
      selectionType: 'add',
      selectionStart: start
    })

    await act(async () => {
      instance.updateAvailabilityDraft(null)
    })

    expect(instance.state.selectionDraft).toEqual([start])
  })

  it('keeps blocked cells out of selection drafts', async () => {
    const start = addHours(startDate, 5)
    const blocked = addHours(start, 1)
    const { instance } = renderSelector({
      startDate: start,
      numDays: 1,
      minTime: 5,
      maxTime: 6,
      blocked: [blocked]
    })

    await setStateAsync(instance, {
      selectionType: 'add',
      selectionStart: start
    })

    await act(async () => {
      instance.updateAvailabilityDraft(blocked)
    })

    expect(instance.state.selectionDraft).toEqual([start])
  })

  it('preserves the visible draft when adding another cell before parent rerender', () => {
    const changeSpy = jest.fn()
    const { container } = renderSelector({ onChange: changeSpy, startDate, numDays: 1, minTime: 9, maxTime: 10 })
    const [firstCell, secondCell] = Array.from(container.querySelectorAll('[role="button"]'))

    clickCell(firstCell)
    clickCell(secondCell)

    expect(changeSpy).toHaveBeenLastCalledWith([addHours(startOfDay(startDate), 9), addHours(startOfDay(startDate), 10)])
  })

  it('removes a visibly selected draft cell before parent rerender', () => {
    const changeSpy = jest.fn()
    const { container } = renderSelector({ onChange: changeSpy, startDate, numDays: 1, minTime: 9, maxTime: 9 })
    const cell = container.querySelector('[role="button"]')

    clickCell(cell)
    clickCell(cell)

    expect(changeSpy).toHaveBeenLastCalledWith([])
  })
})

describe('componentDidMount', () => {
  it('runs properly on a full mount', () => {
    renderSelector()
  })

  it('attaches non-passive touchmove listeners as date cells mount', () => {
    const addSpy = jest.spyOn(HTMLElement.prototype, 'addEventListener')

    renderSelector({ startDate, numDays: 1, minTime: 9, maxTime: 9 })

    expect(addSpy).toHaveBeenCalledWith('touchmove', preventScroll, { passive: false })
    addSpy.mockRestore()
  })
})

describe('componentWillUnmount', () => {
  it('removes the mouseup event listener', () => {
    const removeSpy = jest.spyOn(document, 'removeEventListener')
    const { instance, unmount } = renderSelector()
    const endSelectionMethod = instance.handleDocumentMouseUpEvent

    unmount()

    expect(removeSpy).toHaveBeenCalledWith('mouseup', endSelectionMethod)
    removeSpy.mockRestore()
  })

  it('removes the touchmove event listeners from the date cells', () => {
    const { instance, unmount } = renderSelector()
    const mockDateCell = {
      removeEventListener: jest.fn()
    }
    instance.cellToDate.set(mockDateCell, new Date())

    unmount()

    expect(mockDateCell.removeEventListener).toHaveBeenCalledWith('touchmove', expect.anything())
  })
})

describe('prop updates', () => {
  it('makes the selection prop override the existing selection draft', () => {
    const rendered = renderSelector()
    const nextSelection = [startDate]

    rendered.rerenderWithProps({ selection: nextSelection })

    expect(rendered.instance.state.selectionDraft).toEqual(nextSelection)
  })

  it('rebuilds the date grid when range props change', () => {
    const rendered = renderSelector({ startDate, numDays: 1, minTime: 9, maxTime: 10 })

    rendered.rerenderWithProps({ startDate, numDays: 2, minTime: 8, maxTime: 9 })

    expect(rendered.instance.dates).toHaveLength(2)
    expect(rendered.instance.dates[0]).toHaveLength(2)
  })

  it('uses the current day when startDate is omitted', () => {
    const currentDate = new Date('2032-05-15T12:00:00.000Z')
    jest.useFakeTimers()
    jest.setSystemTime(currentDate)

    const rendered = renderSelector({ numDays: 1, minTime: 9, maxTime: 9 })

    expect(rendered.instance.dates).toEqual([[addHours(startOfDay(currentDate), 9)]])
  })

  it('removes stale touchmove listeners when date cells remount', () => {
    const rendered = renderSelector({ startDate, numDays: 1, minTime: 9, maxTime: 9 })
    const cell = rendered.container.querySelector('[role="button"]')
    const removeSpy = jest.spyOn(cell, 'removeEventListener')

    rendered.rerenderWithProps({
      startDate: addDays(startDate, 1),
      numDays: 1,
      minTime: 9,
      maxTime: 9
    })

    expect(removeSpy).toHaveBeenCalledWith('touchmove', preventScroll)
    expect(rendered.instance.cellToDate.has(cell)).toBe(false)
    removeSpy.mockRestore()
  })
})

describe('blocked cells', () => {
  it('cannot start a selection', () => {
    const { instance } = renderSelector({ blocked: [startDate] })

    act(() => {
      instance.handleSelectionStartEvent(startDate)
    })

    expect(instance.state.selectionType).toBe(null)
    expect(instance.state.selectionStart).toBe(null)
  })
})

describe('cell accessibility', () => {
  it('labels cells with their state and time', () => {
    const selected = addHours(startOfDay(startDate), 9)
    const blocked = addHours(startOfDay(startDate), 10)
    const { getByRole } = renderSelector({
      selection: [selected],
      blocked: [blocked],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 11
    })

    expect(getByRole('button', { name: 'Selected Monday, January 1, 2018 at 9 am' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(getByRole('button', { name: 'Blocked Monday, January 1, 2018 at 10 am' })).toHaveAttribute(
      'aria-disabled',
      'true'
    )
    expect(getByRole('button', { name: 'Available Monday, January 1, 2018 at 11 am' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })
})

describe('keyboard interaction', () => {
  it('toggles a focused cell with Enter', async () => {
    const changeSpy = jest.fn()
    const { container } = renderSelector({ onChange: changeSpy })
    const cell = container.querySelector('[role="button"]')

    fireEvent.keyDown(cell, { key: 'Enter' })

    await waitFor(() => {
      expect(changeSpy).toHaveBeenCalled()
    })
  })

  it('moves focus between adjacent cells with arrow keys', () => {
    const { getByRole } = renderSelector({ startDate, numDays: 2, minTime: 9, maxTime: 10 })
    const mondayNine = getByRole('button', { name: 'Available Monday, January 1, 2018 at 9 am' })
    const mondayTen = getByRole('button', { name: 'Available Monday, January 1, 2018 at 10 am' })
    const tuesdayNine = getByRole('button', { name: 'Available Tuesday, January 2, 2018 at 9 am' })
    const tuesdayTen = getByRole('button', { name: 'Available Tuesday, January 2, 2018 at 10 am' })

    mondayNine.focus()
    fireEvent.keyDown(mondayNine, { key: 'ArrowRight' })
    expect(tuesdayNine).toHaveFocus()

    fireEvent.keyDown(tuesdayNine, { key: 'ArrowDown' })
    expect(tuesdayTen).toHaveFocus()

    fireEvent.keyDown(tuesdayTen, { key: 'ArrowLeft' })
    expect(mondayTen).toHaveFocus()

    fireEvent.keyDown(mondayTen, { key: 'ArrowUp' })
    expect(mondayNine).toHaveFocus()
  })

  it('does not move focus to blocked cells with arrow keys', () => {
    const blocked = addHours(addDays(startOfDay(startDate), 1), 9)
    const { getByRole } = renderSelector({ blocked: [blocked], startDate, numDays: 2, minTime: 9, maxTime: 9 })
    const mondayNine = getByRole('button', { name: 'Available Monday, January 1, 2018 at 9 am' })

    mondayNine.focus()
    fireEvent.keyDown(mondayNine, { key: 'ArrowRight' })

    expect(mondayNine).toHaveFocus()
  })
})

describe('preventScroll', () => {
  it('prevents the event default', () => {
    const event = {
      preventDefault: jest.fn()
    }
    preventScroll(event)
    expect(event.preventDefault).toHaveBeenCalled()
  })
})
