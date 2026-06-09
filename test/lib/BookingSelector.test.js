import React, { act } from 'react'
import { addDays, addHours, format as formatDate, startOfDay } from 'date-fns'
import { createEvent, fireEvent, render, waitFor, within } from '@testing-library/react'

import BookingSelector, {
  buildDateColumns,
  buildDates,
  getKeyboardNavigationTarget,
  preventScroll,
} from '../../src/lib/BookingSelector'
import colors from '../../src/lib/colors'

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
    },
  }
}

const setStateAsync = (instance, state) =>
  act(async () => {
    instance.setState(state)
  })

const clickCell = (cell) => {
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
      onChange: () => undefined,
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
      renderDateCell: customDateCellRenderer,
    })

    expect(container.firstChild).toMatchSnapshot()
  })

  it('passes selected and blocked state to custom renderers', () => {
    const selected = addHours(startOfDay(startDate), 9)
    const blocked = addHours(startOfDay(startDate), 10)
    const customDateCellRenderer = (date, selectedCell, blockedCell) => (
      <span data-testid={`slot-${date.getHours()}`} data-selected={selectedCell} data-blocked={blockedCell} />
    )

    const { getByTestId } = renderSelector({
      selection: [selected],
      blocked: [blocked],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 10,
      renderDateCell: customDateCellRenderer,
    })

    expect(getByTestId('slot-9')).toHaveAttribute('data-selected', 'true')
    expect(getByTestId('slot-9')).toHaveAttribute('data-blocked', 'false')
    expect(getByTestId('slot-10')).toHaveAttribute('data-selected', 'false')
    expect(getByTestId('slot-10')).toHaveAttribute('data-blocked', 'true')
  })

  it('falls back to default cells when the custom renderer is not callable', () => {
    const { getByRole } = renderSelector({
      renderDateCell: true,
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 9,
    })

    expect(getByRole('button', { name: 'Available Monday, January 1, 2018 at 9 am' })).toBeInTheDocument()
  })

  it('isolates custom renderer date mutations from grid behavior', async () => {
    const changeSpy = jest.fn()
    const selected = addHours(startOfDay(startDate), 9)
    const mutatingDateCellRenderer = (date) => {
      date.setHours(17)
      return <span>{date.getHours()}</span>
    }
    const { getByRole } = renderSelector({
      onChange: changeSpy,
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 9,
      renderDateCell: mutatingDateCellRenderer,
    })
    const cell = getByRole('button', { name: 'Available Monday, January 1, 2018 at 9 am' })

    clickCell(cell)

    await waitFor(() => {
      expect(changeSpy).toHaveBeenCalledWith([selected])
    })
  })
})

it('getTimeFromTouchEvent returns the time for that cell', () => {
  const { instance } = renderSelector()
  const mainSpy = jest.spyOn(instance, 'getTimeFromTouchEvent')
  const mockCellTime = new Date()
  const mockEvent = {
    touches: [{ clientX: 1, clientY: 2 }],
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

it('getTimeFromTouchEvent returns null when the touch is inside the grid but not on a date cell', () => {
  const { getByText, instance } = renderSelector({ startDate, numDays: 1, minTime: 9, maxTime: 9 })
  document.elementFromPoint.mockReturnValue(getByText('9 am'))

  expect(instance.getTimeFromTouchEvent({ touches: [{ clientX: 1, clientY: 2 }] })).toBe(null)
})

it('getTimeFromTouchEvent returns null when there are no touches', () => {
  const { instance } = renderSelector()

  expect(instance.getTimeFromTouchEvent(null)).toBe(null)
  expect(instance.getTimeFromTouchEvent({ touches: [] })).toBe(null)
  expect(instance.getTimeFromTouchEvent({})).toBe(null)
  expect(document.elementFromPoint).not.toHaveBeenCalled()
})

it('getTimeFromTouchEvent returns null for malformed touch coordinates', () => {
  const { instance } = renderSelector()

  expect(instance.getTimeFromTouchEvent({ touches: [null] })).toBe(null)
  expect(instance.getTimeFromTouchEvent({ touches: [{ clientX: NaN, clientY: 2 }] })).toBe(null)
  expect(instance.getTimeFromTouchEvent({ touches: [{ clientX: 1, clientY: Infinity }] })).toBe(null)
  expect(document.elementFromPoint).not.toHaveBeenCalled()
})

it('getTimeFromTouchEvent returns null when hit testing is unavailable', () => {
  const { instance } = renderSelector()
  const elementFromPoint = document.elementFromPoint
  document.elementFromPoint = undefined

  try {
    expect(instance.getTimeFromTouchEvent({ touches: [{ clientX: 1, clientY: 2 }] })).toBe(null)
  } finally {
    document.elementFromPoint = elementFromPoint
  }
})

it('endSelection calls the onChange prop and resets selection state', async () => {
  const changeSpy = jest.fn()
  const { instance } = renderSelector({ onChange: changeSpy })
  const setStateSpy = jest.spyOn(instance, 'setState')

  await setStateAsync(instance, { selectionType: 'add' })
  act(() => {
    instance.endSelection()
  })

  expect(changeSpy).toHaveBeenCalledWith([])
  expect(setStateSpy).toHaveBeenCalledWith({
    selectionType: null,
    selectionStart: null,
    isTouchDragging: false,
  })

  setStateSpy.mockRestore()
})

it('queues the selection reset before calling onChange', async () => {
  const changeSpy = jest.fn()
  const { instance } = renderSelector({ onChange: changeSpy })
  const setStateSpy = jest.spyOn(instance, 'setState')

  await setStateAsync(instance, { selectionType: 'add' })
  act(() => {
    instance.endSelection()
  })

  expect(setStateSpy.mock.invocationCallOrder[0]).toBeLessThan(changeSpy.mock.invocationCallOrder[0])

  setStateSpy.mockRestore()
})

it('endSelection does not call onChange when no selection is active', () => {
  const changeSpy = jest.fn()
  const { instance } = renderSelector({ onChange: changeSpy })
  const setStateSpy = jest.spyOn(instance, 'setState')

  act(() => {
    instance.endSelection()
  })

  expect(changeSpy).not.toHaveBeenCalled()
  expect(setStateSpy).not.toHaveBeenCalled()

  setStateSpy.mockRestore()
})

it('endSelection clears partially dangling idle state without calling onChange', async () => {
  const changeSpy = jest.fn()
  const { instance } = renderSelector({ onChange: changeSpy })

  await setStateAsync(instance, {
    selectionStart: startDate,
    isTouchDragging: true,
  })

  act(() => {
    instance.endSelection()
  })

  expect(instance.state.selectionType).toBe(null)
  expect(instance.state.selectionStart).toBe(null)
  expect(instance.state.isTouchDragging).toBe(false)
  expect(changeSpy).not.toHaveBeenCalled()
})

it('endSelection clears malformed active selection types without calling onChange', async () => {
  const changeSpy = jest.fn()
  const selected = addHours(startOfDay(startDate), 9)
  const { instance } = renderSelector({ onChange: changeSpy })

  await setStateAsync(instance, {
    selectionDraft: [selected],
    selectionType: 'toggle',
    selectionStart: selected,
  })

  act(() => {
    instance.endSelection()
  })

  expect(instance.state.selectionType).toBe(null)
  expect(instance.state.selectionStart).toBe(null)
  expect(changeSpy).not.toHaveBeenCalled()
})

it('endSelection passes cloned selection dates to onChange', async () => {
  const changeSpy = jest.fn()
  const selected = addHours(startOfDay(startDate), 9)
  const { instance } = renderSelector({ onChange: changeSpy })

  await setStateAsync(instance, { selectionDraft: [selected], selectionType: 'add' })
  act(() => {
    instance.endSelection()
  })

  const [nextSelection] = changeSpy.mock.calls[0]
  expect(nextSelection).toEqual([selected])
  expect(nextSelection).not.toBe(instance.state.selectionDraft)
  expect(nextSelection[0]).not.toBe(instance.state.selectionDraft[0])
})

it('endSelection ignores non-callable onChange props', async () => {
  const selected = addHours(startOfDay(startDate), 9)
  const { instance } = renderSelector({ onChange: true })

  await setStateAsync(instance, { selectionDraft: [selected], selectionType: 'add' })

  expect(() => {
    act(() => {
      instance.endSelection()
    })
  }).not.toThrow()
  expect(instance.state.selectionType).toBe(null)
})

it('endSelection emits minute-unique selection dates', async () => {
  const changeSpy = jest.fn()
  const selected = addHours(startOfDay(startDate), 9)
  const duplicateSameMinute = new Date(selected.getTime() + 30000)
  const { instance } = renderSelector({ onChange: changeSpy })

  await setStateAsync(instance, { selectionDraft: [selected, duplicateSameMinute], selectionType: 'add' })
  act(() => {
    instance.endSelection()
  })

  const [nextSelection] = changeSpy.mock.calls[0]
  expect(nextSelection).toEqual([selected])
  expect(nextSelection[0]).not.toBe(selected)
})

it('keeps internal selection state isolated from onChange mutations', async () => {
  const selected = addHours(startOfDay(startDate), 9)
  const changeSpy = jest.fn((nextSelection) => {
    nextSelection[0].setHours(10)
    nextSelection.pop()
  })
  const { instance } = renderSelector({ onChange: changeSpy })

  await setStateAsync(instance, { selectionDraft: [selected], selectionType: 'add' })
  act(() => {
    instance.endSelection()
  })

  expect(instance.state.selectionDraft).toEqual([addHours(startOfDay(startDate), 9)])
})

describe('mouse handlers', () => {
  const spies = {}

  beforeEach(() => {
    spies.onMouseDown = jest.spyOn(BookingSelector.prototype, 'handleSelectionStartEvent')
    spies.onMouseEnter = jest.spyOn(BookingSelector.prototype, 'handleMouseEnterEvent')
    spies.onMouseUp = jest.spyOn(BookingSelector.prototype, 'handleMouseUpEvent')
  })

  test.each([
    ['onMouseDown', (cell) => fireEvent.mouseDown(cell)],
    ['onMouseEnter', (cell) => fireEvent.mouseEnter(cell)],
    ['onMouseUp', (cell) => fireEvent.mouseUp(cell)],
  ])('calls the handler for %s', (name, fireHandler) => {
    const { container } = renderSelector()
    const cell = container.querySelector('button.rgdp__grid-cell')

    fireHandler(cell)

    expect(spies[name]).toHaveBeenCalled()
  })

  it('selects cells while mouse dragging', async () => {
    const changeSpy = jest.fn()
    const { container } = renderSelector({ onChange: changeSpy, startDate, numDays: 1, minTime: 9, maxTime: 10 })
    const [firstCell, secondCell] = Array.from(container.querySelectorAll('button.rgdp__grid-cell'))

    fireEvent.mouseDown(firstCell)
    fireEvent.mouseEnter(secondCell)
    fireEvent.mouseUp(secondCell)

    await waitFor(() => {
      expect(changeSpy).toHaveBeenCalledWith([addHours(startOfDay(startDate), 9), addHours(startOfDay(startDate), 10)])
    })
  })

  it('ignores non-primary mouse button selections', () => {
    const changeSpy = jest.fn()
    const { container, instance } = renderSelector({
      onChange: changeSpy,
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 9,
    })
    const cell = container.querySelector('button.rgdp__grid-cell')

    fireEvent.mouseDown(cell, { button: 2 })
    fireEvent.mouseEnter(cell)
    fireEvent.mouseUp(cell, { button: 2 })

    expect(changeSpy).not.toHaveBeenCalled()
    expect(instance.state.selectionType).toBe(null)
    expect(cell).toHaveAttribute('aria-pressed', 'false')
  })

  it('treats missing mouse button metadata as primary input', async () => {
    const changeSpy = jest.fn()
    const selected = addHours(startOfDay(startDate), 9)
    const { instance } = renderSelector({
      onChange: changeSpy,
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 9,
    })

    act(() => {
      instance.handleMouseDownEvent(selected, {})
    })
    expect(instance.state.selectionType).toBe('add')

    act(() => {
      instance.handleMouseUpEvent(selected)
    })

    await waitFor(() => {
      expect(changeSpy).toHaveBeenCalledWith([selected])
    })
  })

  it('ignores malformed selection start times', () => {
    const { instance } = renderSelector({ startDate, numDays: 1, minTime: 9, maxTime: 9 })

    expect(() => {
      instance.handleSelectionStartEvent({ getTime: true })
      instance.handleMouseDownEvent(new Date(NaN))
      instance.handleTouchStartEvent('not-a-date')
    }).not.toThrow()
    expect(instance.state.selectionType).toBe(null)
    expect(instance.state.selectionStart).toBe(null)
  })

  it('ignores malformed mouse enter endpoints', async () => {
    const selected = addHours(startOfDay(startDate), 9)
    const { instance } = renderSelector({ startDate, numDays: 1, minTime: 9, maxTime: 10 })

    await setStateAsync(instance, {
      selectionType: 'add',
      selectionStart: selected,
      selectionBase: [],
      selectionDraft: [],
    })
    const updateDraftSpy = jest.spyOn(instance, 'updateAvailabilityDraft')

    instance.handleMouseEnterEvent(new Date(NaN))

    expect(updateDraftSpy).not.toHaveBeenCalled()
    expect(instance.state.selectionDraft).toEqual([])
    updateDraftSpy.mockRestore()
  })

  it('finalizes the start cell when mouseup has a malformed endpoint', async () => {
    const changeSpy = jest.fn()
    const selected = addHours(startOfDay(startDate), 9)
    const emptyDraft = []
    const { instance } = renderSelector({ onChange: changeSpy, startDate, numDays: 1, minTime: 9, maxTime: 10 })

    await setStateAsync(instance, {
      selectionType: 'add',
      selectionStart: selected,
      selectionBase: emptyDraft,
      selectionDraft: emptyDraft,
    })
    await act(async () => {
      instance.handleMouseUpEvent(new Date(NaN))
    })

    expect(changeSpy).toHaveBeenCalledWith([selected])
    expect(instance.state.selectionType).toBe(null)
  })

  it('ends an updated draft when mouseup has a malformed endpoint', async () => {
    const changeSpy = jest.fn()
    const selected = addHours(startOfDay(startDate), 9)
    const added = addHours(startOfDay(startDate), 10)
    const { instance } = renderSelector({ onChange: changeSpy, startDate, numDays: 1, minTime: 9, maxTime: 10 })

    await setStateAsync(instance, {
      selectionType: 'add',
      selectionStart: selected,
      selectionBase: [],
      selectionDraft: [selected, added],
    })
    await act(async () => {
      instance.handleMouseUpEvent(new Date(NaN))
    })

    expect(changeSpy).toHaveBeenCalledWith([selected, added])
    expect(instance.state.selectionType).toBe(null)
  })

  it('finishes incomplete active mouse selections when no draft update can run', async () => {
    const changeSpy = jest.fn()
    const selected = addHours(startOfDay(startDate), 9)
    const { instance } = renderSelector({ onChange: changeSpy })

    await setStateAsync(instance, {
      selectionDraft: [selected],
      selectionType: 'add',
      selectionStart: null,
    })

    act(() => {
      instance.handleMouseUpEvent(selected)
    })

    expect(instance.state.selectionType).toBe(null)
    expect(instance.state.selectionStart).toBe(null)
    expect(instance.state.isTouchDragging).toBe(false)
    expect(changeSpy).toHaveBeenCalledWith([selected])
  })

  it('does not end an active drag from a non-primary cell mouseup', async () => {
    const changeSpy = jest.fn()
    const { container, instance } = renderSelector({
      onChange: changeSpy,
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 10,
    })
    const [firstCell, secondCell] = Array.from(container.querySelectorAll('button.rgdp__grid-cell'))

    fireEvent.mouseDown(firstCell)
    fireEvent.mouseEnter(secondCell)
    fireEvent.mouseUp(secondCell, { button: 1 })

    expect(changeSpy).not.toHaveBeenCalled()
    expect(instance.state.selectionType).toBe('add')

    fireEvent.mouseUp(secondCell)

    await waitFor(() => {
      expect(changeSpy).toHaveBeenCalledWith([addHours(startOfDay(startDate), 9), addHours(startOfDay(startDate), 10)])
    })
  })

  it('ends a drag when the mouse is released outside the grid', async () => {
    const changeSpy = jest.fn()
    const { container } = renderSelector({ onChange: changeSpy, startDate, numDays: 1, minTime: 9, maxTime: 10 })
    const [firstCell, secondCell] = Array.from(container.querySelectorAll('button.rgdp__grid-cell'))

    fireEvent.mouseDown(firstCell)
    fireEvent.mouseEnter(secondCell)
    fireEvent.mouseUp(document.body)

    await waitFor(() => {
      expect(changeSpy).toHaveBeenCalledWith([addHours(startOfDay(startDate), 9), addHours(startOfDay(startDate), 10)])
    })
  })

  it('does not end an active drag from a non-primary document mouseup', async () => {
    const changeSpy = jest.fn()
    const { container, instance } = renderSelector({
      onChange: changeSpy,
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 10,
    })
    const [firstCell, secondCell] = Array.from(container.querySelectorAll('button.rgdp__grid-cell'))

    fireEvent.mouseDown(firstCell)
    fireEvent.mouseEnter(secondCell)
    fireEvent.mouseUp(document.body, { button: 2 })

    expect(changeSpy).not.toHaveBeenCalled()
    expect(instance.state.selectionType).toBe('add')

    fireEvent.mouseUp(document.body)

    await waitFor(() => {
      expect(changeSpy).toHaveBeenCalledWith([addHours(startOfDay(startDate), 9), addHours(startOfDay(startDate), 10)])
    })
  })

  it('ends active document mouse selections without event target metadata', async () => {
    const changeSpy = jest.fn()
    const selected = addHours(startOfDay(startDate), 9)
    const { instance } = renderSelector({ onChange: changeSpy, startDate, numDays: 1, minTime: 9, maxTime: 9 })

    await setStateAsync(instance, {
      selectionDraft: [selected],
      selectionBase: [],
      selectionType: 'add',
      selectionStart: selected,
    })
    act(() => {
      instance.handleDocumentMouseUpEvent(null)
    })

    expect(changeSpy).toHaveBeenCalledWith([selected])
    expect(instance.state.selectionType).toBe(null)
  })

  it('selects the start cell when the mouse is released outside before entering another cell', async () => {
    const changeSpy = jest.fn()
    const { container } = renderSelector({ onChange: changeSpy, startDate, numDays: 1, minTime: 9, maxTime: 9 })
    const cell = container.querySelector('button.rgdp__grid-cell')

    fireEvent.mouseDown(cell)
    fireEvent.mouseUp(document.body)

    await waitFor(() => {
      expect(changeSpy).toHaveBeenCalledWith([addHours(startOfDay(startDate), 9)])
    })
  })

  it('ends a drag when the mouse is released on a grid label', async () => {
    const changeSpy = jest.fn()
    const { container, getByText, instance } = renderSelector({
      onChange: changeSpy,
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 10,
    })
    const [firstCell, secondCell] = Array.from(container.querySelectorAll('button.rgdp__grid-cell'))

    fireEvent.mouseDown(firstCell)
    fireEvent.mouseEnter(secondCell)
    fireEvent.mouseUp(getByText('9 am'))

    await waitFor(() => {
      expect(changeSpy).toHaveBeenCalledWith([addHours(startOfDay(startDate), 9), addHours(startOfDay(startDate), 10)])
    })
    expect(instance.state.selectionType).toBe(null)
  })

  it('ends a drag when the mouse is released on a blocked cell', async () => {
    const changeSpy = jest.fn()
    const blocked = addHours(startOfDay(startDate), 10)
    const { getByRole, instance } = renderSelector({
      onChange: changeSpy,
      blocked: [blocked],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 10,
    })
    const availableCell = getByRole('button', { name: 'Available Monday, January 1, 2018 at 9 am' })
    const blockedCell = getByRole('button', { name: 'Blocked Monday, January 1, 2018 at 10 am' })

    fireEvent.mouseDown(availableCell)
    fireEvent.mouseUp(blockedCell)

    await waitFor(() => {
      expect(changeSpy).toHaveBeenCalledWith([addHours(startOfDay(startDate), 9)])
    })
    expect(instance.state.selectionType).toBe(null)
  })

  afterEach(() => {
    Object.keys(spies).forEach((spyName) => {
      spies[spyName].mockRestore()
    })
  })
})

describe('touch handlers', () => {
  const spies = {}
  const mockEvent = {
    touches: [
      { clientX: 1, clientY: 2 },
      { clientX: 100, clientY: 200 },
    ],
  }

  beforeEach(() => {
    spies.onTouchStart = jest.spyOn(BookingSelector.prototype, 'handleSelectionStartEvent')
    spies.onTouchMove = jest.spyOn(BookingSelector.prototype, 'handleTouchMoveEvent')
    spies.onTouchEnd = jest.spyOn(BookingSelector.prototype, 'handleTouchEndEvent')
    spies.onTouchCancel = jest.spyOn(BookingSelector.prototype, 'handleTouchCancelEvent')
  })

  test.each([
    ['onTouchStart', (cell) => fireEvent.touchStart(cell)],
    ['onTouchMove', (cell) => fireEvent.touchMove(cell, mockEvent)],
    ['onTouchEnd', (cell) => fireEvent.touchEnd(cell)],
    ['onTouchCancel', (cell) => fireEvent.touchCancel(cell)],
  ])('calls the handler for %s', (name, fireHandler) => {
    const { container } = renderSelector()
    const cell = container.querySelector('button.rgdp__grid-cell')

    fireHandler(cell)

    expect(spies[name]).toHaveBeenCalled()
  })

  it('toggles a tapped cell', async () => {
    const changeSpy = jest.fn()
    const { container } = renderSelector({ onChange: changeSpy, startDate, numDays: 1, minTime: 9, maxTime: 9 })
    const cell = container.querySelector('button.rgdp__grid-cell')

    fireEvent.touchStart(cell)
    fireEvent.touchEnd(cell)

    await waitFor(() => {
      expect(changeSpy).toHaveBeenCalledWith([addHours(startOfDay(startDate), 9)])
    })
  })

  it('ignores compatibility mouse events after a touch tap', async () => {
    const changeSpy = jest.fn()
    const { container } = renderSelector({ onChange: changeSpy, startDate, numDays: 1, minTime: 9, maxTime: 9 })
    const cell = container.querySelector('button.rgdp__grid-cell')

    fireEvent.touchStart(cell)
    fireEvent.touchEnd(cell)

    await waitFor(() => {
      expect(changeSpy).toHaveBeenCalledWith([addHours(startOfDay(startDate), 9)])
    })

    fireEvent.mouseEnter(cell)
    fireEvent.mouseDown(cell)
    fireEvent.mouseUp(cell)

    expect(changeSpy).toHaveBeenCalledTimes(1)
  })

  it('ignores document mouseup compatibility events after touch start', async () => {
    const changeSpy = jest.fn()
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1000)
    const { container } = renderSelector({ onChange: changeSpy, startDate, numDays: 1, minTime: 9, maxTime: 9 })
    const cell = container.querySelector('button.rgdp__grid-cell')

    try {
      fireEvent.touchStart(cell)
      fireEvent.mouseUp(document.body)

      expect(changeSpy).not.toHaveBeenCalled()
      expect(cell).toHaveAttribute('aria-pressed', 'false')

      fireEvent.touchEnd(cell)

      await waitFor(() => {
        expect(changeSpy).toHaveBeenCalledWith([addHours(startOfDay(startDate), 9)])
      })
      expect(changeSpy).toHaveBeenCalledTimes(1)
    } finally {
      nowSpy.mockRestore()
    }
  })

  it('allows mouse events after the touch suppression window', async () => {
    const changeSpy = jest.fn()
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1000)
    const { container } = renderSelector({ onChange: changeSpy, startDate, numDays: 1, minTime: 9, maxTime: 9 })
    const cell = container.querySelector('button.rgdp__grid-cell')

    try {
      fireEvent.touchStart(cell)
      fireEvent.touchEnd(cell)

      await waitFor(() => {
        expect(changeSpy).toHaveBeenCalledWith([addHours(startOfDay(startDate), 9)])
      })

      nowSpy.mockReturnValue(1501)
      fireEvent.mouseDown(cell)
      fireEvent.mouseUp(cell)

      await waitFor(() => {
        expect(changeSpy).toHaveBeenLastCalledWith([])
      })
    } finally {
      nowSpy.mockRestore()
    }
  })

  it('does not suppress mouse events when the clock moves backwards after a touch event', () => {
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1000)
    const { instance } = renderSelector()

    try {
      instance.recordTouchEvent()
      nowSpy.mockReturnValue(900)

      expect(instance.shouldIgnoreMouseEvent()).toBe(false)
    } finally {
      nowSpy.mockRestore()
    }
  })

  it('selects cells while touch dragging', async () => {
    const changeSpy = jest.fn()
    const { container } = renderSelector({ onChange: changeSpy, startDate, numDays: 1, minTime: 9, maxTime: 10 })
    const [firstCell, secondCell] = Array.from(container.querySelectorAll('button.rgdp__grid-cell'))
    document.elementFromPoint.mockReturnValue(secondCell)

    fireEvent.touchStart(firstCell)
    fireEvent.touchMove(firstCell, mockEvent)
    fireEvent.touchEnd(firstCell)

    await waitFor(() => {
      expect(changeSpy).toHaveBeenCalledWith([addHours(startOfDay(startDate), 9), addHours(startOfDay(startDate), 10)])
    })
  })

  it('queues touch drag cleanup before calling onChange', () => {
    const changeSpy = jest.fn()
    const { container, instance } = renderSelector({
      onChange: changeSpy,
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 10,
    })
    const [firstCell, secondCell] = Array.from(container.querySelectorAll('button.rgdp__grid-cell'))
    const setStateSpy = jest.spyOn(instance, 'setState')
    document.elementFromPoint.mockReturnValue(secondCell)

    fireEvent.touchStart(firstCell)
    fireEvent.touchMove(firstCell, mockEvent)
    fireEvent.touchEnd(firstCell)

    expect(changeSpy).toHaveBeenCalledWith([addHours(startOfDay(startDate), 9), addHours(startOfDay(startDate), 10)])
    expect(setStateSpy.mock.invocationCallOrder[setStateSpy.mock.invocationCallOrder.length - 1]).toBeLessThan(
      changeSpy.mock.invocationCallOrder[0],
    )
    expect(setStateSpy).toHaveBeenLastCalledWith({
      selectionType: null,
      selectionStart: null,
      isTouchDragging: false,
    })

    setStateSpy.mockRestore()
  })

  it('selects the start cell when a touch drag ends before entering another cell', async () => {
    const changeSpy = jest.fn()
    const { container } = renderSelector({ onChange: changeSpy, startDate, numDays: 1, minTime: 9, maxTime: 9 })
    const cell = container.querySelector('button.rgdp__grid-cell')
    document.elementFromPoint.mockReturnValue(document.body)

    fireEvent.touchStart(cell)
    fireEvent.touchMove(cell, mockEvent)
    fireEvent.touchEnd(cell)

    await waitFor(() => {
      expect(changeSpy).toHaveBeenCalledWith([addHours(startOfDay(startDate), 9)])
    })
  })

  it('ignores blocked cells as touch drag endpoints', async () => {
    const changeSpy = jest.fn()
    const blocked = addHours(startOfDay(startDate), 10)
    const { getByRole, instance } = renderSelector({
      blocked: [blocked],
      onChange: changeSpy,
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 10,
    })
    const firstCell = getByRole('button', { name: 'Available Monday, January 1, 2018 at 9 am' })
    const blockedCell = getByRole('button', { name: 'Blocked Monday, January 1, 2018 at 10 am' })
    document.elementFromPoint.mockReturnValue(blockedCell)

    fireEvent.touchStart(firstCell)
    fireEvent.touchMove(firstCell, mockEvent)

    expect(instance.state.selectionDraft).toEqual([])

    fireEvent.touchEnd(firstCell)

    await waitFor(() => {
      expect(changeSpy).toHaveBeenCalledWith([addHours(startOfDay(startDate), 9)])
    })
  })

  it('ignores late touch moves after controlled props cancel the selection', () => {
    const changeSpy = jest.fn()
    const controlledSelection = addHours(startOfDay(startDate), 10)
    const rendered = renderSelector({ onChange: changeSpy, startDate, numDays: 1, minTime: 9, maxTime: 10 })
    const [firstCell, secondCell] = Array.from(rendered.container.querySelectorAll('button.rgdp__grid-cell'))
    document.elementFromPoint.mockReturnValue(secondCell)
    const getTimeSpy = jest.spyOn(rendered.instance, 'getTimeFromTouchEvent')

    fireEvent.touchStart(firstCell)
    rendered.rerenderWithProps({
      onChange: changeSpy,
      selection: [controlledSelection],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 10,
    })
    fireEvent.touchMove(firstCell, mockEvent)

    expect(rendered.instance.state.selectionDraft).toEqual([controlledSelection])
    expect(rendered.instance.state.selectionType).toBe(null)
    expect(rendered.instance.state.isTouchDragging).toBe(false)
    expect(getTimeSpy).not.toHaveBeenCalled()
    expect(changeSpy).not.toHaveBeenCalled()

    getTimeSpy.mockRestore()
  })

  it('ignores late touch ends after controlled props cancel the selection', () => {
    const changeSpy = jest.fn()
    const controlledSelection = addHours(startOfDay(startDate), 10)
    const rendered = renderSelector({ onChange: changeSpy, startDate, numDays: 1, minTime: 9, maxTime: 10 })
    const [firstCell] = Array.from(rendered.container.querySelectorAll('button.rgdp__grid-cell'))

    fireEvent.touchStart(firstCell)
    rendered.rerenderWithProps({
      onChange: changeSpy,
      selection: [controlledSelection],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 10,
    })
    const updateDraftSpy = jest.spyOn(rendered.instance, 'updateAvailabilityDraft')
    const endSelectionSpy = jest.spyOn(rendered.instance, 'endSelection')
    fireEvent.touchEnd(firstCell)

    expect(rendered.instance.state.selectionDraft).toEqual([controlledSelection])
    expect(rendered.instance.state.selectionType).toBe(null)
    expect(rendered.instance.state.isTouchDragging).toBe(false)
    expect(updateDraftSpy).not.toHaveBeenCalled()
    expect(endSelectionSpy).not.toHaveBeenCalled()
    expect(changeSpy).not.toHaveBeenCalled()

    updateDraftSpy.mockRestore()
    endSelectionSpy.mockRestore()
  })

  it('cancels touch drags without committing the draft', () => {
    const changeSpy = jest.fn()
    const selected = addHours(startOfDay(startDate), 9)
    const { getByRole, instance } = renderSelector({
      onChange: changeSpy,
      selection: [selected],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 10,
    })
    const selectedCell = getByRole('button', { name: 'Selected Monday, January 1, 2018 at 9 am' })
    const availableCell = getByRole('button', { name: 'Available Monday, January 1, 2018 at 10 am' })
    document.elementFromPoint.mockReturnValue(availableCell)

    fireEvent.touchStart(selectedCell)
    fireEvent.touchMove(selectedCell, mockEvent)

    expect(instance.state.selectionDraft).toEqual([])

    fireEvent.touchCancel(selectedCell)

    expect(changeSpy).not.toHaveBeenCalled()
    expect(instance.state.selectionDraft).toEqual([selected])
    expect(instance.state.selectionType).toBe(null)
    expect(instance.state.selectionStart).toBe(null)
    expect(instance.state.isTouchDragging).toBe(false)
    expect(selectedCell).toHaveAttribute('aria-pressed', 'true')
  })

  afterEach(() => {
    Object.keys(spies).forEach((spyName) => {
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
    instance.setState({ selectionType: 'add', selectionStart: mockCellTime })
  })
  act(() => {
    instance.handleTouchMoveEvent({})
  })

  expect(updateDraftSpy).toHaveBeenCalledWith(mockCellTime)
  expect(instance.state.isTouchDragging).toBe(true)

  getTimeSpy.mockRestore()
  updateDraftSpy.mockRestore()
})

it('handleTouchMoveEvent avoids redundant drag-state updates while already dragging', async () => {
  const getTimeSpy = jest.spyOn(BookingSelector.prototype, 'getTimeFromTouchEvent').mockReturnValue(null)
  const { instance } = renderSelector()

  await setStateAsync(instance, {
    selectionType: 'add',
    selectionStart: startDate,
    isTouchDragging: true,
  })
  const setStateSpy = jest.spyOn(instance, 'setState')

  act(() => {
    instance.handleTouchMoveEvent({})
  })

  expect(setStateSpy).not.toHaveBeenCalled()

  setStateSpy.mockRestore()
  getTimeSpy.mockRestore()
})

it.each([
  { label: 'touch end', cleanupTouch: (instance) => instance.handleTouchEndEvent() },
  { label: 'touch cancel', cleanupTouch: (instance) => instance.handleTouchCancelEvent() },
])('avoids redundant idle drag-state cleanup on $label', ({ cleanupTouch }) => {
  const { instance } = renderSelector()
  const setStateSpy = jest.spyOn(instance, 'setState')

  act(() => {
    cleanupTouch(instance)
  })

  expect(setStateSpy).not.toHaveBeenCalled()

  setStateSpy.mockRestore()
})

it.each([
  { label: 'touch end', cleanupTouch: (instance) => instance.handleTouchEndEvent() },
  { label: 'touch cancel', cleanupTouch: (instance) => instance.handleTouchCancelEvent() },
])('clears dangling idle drag state on $label', async ({ cleanupTouch }) => {
  const { instance } = renderSelector()

  await setStateAsync(instance, { isTouchDragging: true })
  act(() => {
    cleanupTouch(instance)
  })

  expect(instance.state.isTouchDragging).toBe(false)
})

describe('updateAvailabilityDraft', () => {
  it.each([
    ['add', 1],
    ['remove', 1],
    ['add', -1],
    ['remove', -1],
  ])('updateAvailabilityDraft handles addition and removals, for forward and reversed drags', async (type, amount) => {
    const start = addHours(startDate, 5)
    const end = addHours(start, amount)
    const outOfRangeOne = addHours(start, amount + 5)
    const selectedRange = amount > 0 ? [start, end] : [end, start]
    const expectedSelection = type === 'add' ? [outOfRangeOne, ...selectedRange] : [outOfRangeOne]

    const { instance } = renderSelector({
      selection: type === 'remove' ? [start, end, outOfRangeOne] : [outOfRangeOne],
      startDate: start,
      numDays: 5,
      minTime: 0,
      maxTime: 23,
    })

    await setStateAsync(instance, {
      selectionType: type,
      selectionStart: start,
    })

    await act(async () => {
      instance.updateAvailabilityDraft(end)
    })

    expect(instance.state.selectionDraft).toEqual(expectedSelection)
  })

  it('updateAvailabilityDraft handles a single cell click correctly', async () => {
    const { instance } = renderSelector()
    const start = startDate

    await setStateAsync(instance, {
      selectionType: 'add',
      selectionStart: start,
    })

    await act(async () => {
      instance.updateAvailabilityDraft(null)
    })

    expect(instance.state.selectionDraft).toEqual([start])
  })

  it('ignores malformed draft endpoints without changing the visible draft', async () => {
    const callback = jest.fn()
    const selected = addHours(startDate, 5)
    const { instance } = renderSelector()

    await setStateAsync(instance, {
      selectionDraft: [selected],
      selectionType: 'add',
      selectionStart: selected,
    })

    await act(async () => {
      instance.updateAvailabilityDraft(new Date(NaN), callback)
    })

    expect(instance.state.selectionDraft).toEqual([selected])
    expect(callback).toHaveBeenCalled()
  })

  it('ignores malformed active selection types without changing the visible draft', async () => {
    const callback = jest.fn()
    const selected = addHours(startDate, 5)
    const { instance } = renderSelector()

    await setStateAsync(instance, {
      selectionDraft: [selected],
      selectionType: 'toggle',
      selectionStart: selected,
      selectionBase: [],
    })

    await act(async () => {
      instance.updateAvailabilityDraft(selected, callback)
    })

    expect(instance.state.selectionDraft).toEqual([selected])
    expect(callback).toHaveBeenCalled()
  })

  it('keeps blocked cells out of selection drafts', async () => {
    const start = addHours(startDate, 5)
    const blocked = addHours(start, 1)
    const { instance } = renderSelector({
      startDate: start,
      numDays: 1,
      minTime: 5,
      maxTime: 6,
      blocked: [blocked],
    })

    await setStateAsync(instance, {
      selectionType: 'add',
      selectionStart: start,
    })

    await act(async () => {
      instance.updateAvailabilityDraft(blocked)
    })

    expect(instance.state.selectionDraft).toEqual([start])
  })

  it('removes blocked values from the selection base before building a draft', async () => {
    const blocked = addHours(startOfDay(startDate), 9)
    const available = addHours(startOfDay(startDate), 10)
    const { instance } = renderSelector({
      selection: [blocked],
      blocked: [blocked],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 10,
    })

    await setStateAsync(instance, {
      selectionType: 'add',
      selectionStart: available,
      selectionBase: [blocked],
    })

    await act(async () => {
      instance.updateAvailabilityDraft(available)
    })

    expect(instance.state.selectionDraft).toEqual([available])
  })

  it('removes malformed values from the selection base before building a draft', async () => {
    const existing = addHours(startOfDay(startDate), 9)
    const added = addHours(startOfDay(startDate), 10)
    const existingSameMinute = new Date(existing.getTime() + 30000)
    const { instance } = renderSelector({ startDate, numDays: 1, minTime: 9, maxTime: 10 })

    await setStateAsync(instance, {
      selectionDraft: [existing],
      selectionType: 'add',
      selectionStart: added,
      selectionBase: [{ getTime: true }, new Date(NaN), existing, existingSameMinute],
    })

    await act(async () => {
      instance.updateAvailabilityDraft(added)
    })

    expect(instance.state.selectionDraft).toEqual([existing, added])
  })

  it('removes duplicate values from the selection base before removing dates', async () => {
    const duplicate = addHours(startOfDay(startDate), 9)
    const removed = addHours(startOfDay(startDate), 10)
    const duplicateSameMinute = new Date(duplicate.getTime() + 30000)
    const { instance } = renderSelector({
      selection: [duplicate, duplicateSameMinute, removed],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 10,
    })

    await setStateAsync(instance, {
      selectionType: 'remove',
      selectionStart: removed,
      selectionBase: [duplicate, duplicateSameMinute, removed],
    })

    await act(async () => {
      instance.updateAvailabilityDraft(removed)
    })

    expect(instance.state.selectionDraft).toEqual([duplicate])
  })

  it('falls back to square selection for unknown selection schemes', async () => {
    const start = addHours(startOfDay(startDate), 9)
    const end = addHours(startOfDay(startDate), 10)
    const { instance } = renderSelector({
      selectionScheme: 'unknown',
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 10,
    })

    await setStateAsync(instance, {
      selectionType: 'add',
      selectionStart: start,
    })

    await act(async () => {
      instance.updateAvailabilityDraft(end)
    })

    expect(instance.state.selectionDraft).toEqual([start, end])
  })

  it('falls back to square selection without coercing malformed selection schemes', async () => {
    const mondayNine = addHours(startOfDay(startDate), 9)
    const mondayTen = addHours(startOfDay(startDate), 10)
    const tuesdayNine = addHours(addDays(startOfDay(startDate), 1), 9)
    const tuesdayTen = addHours(addDays(startOfDay(startDate), 1), 10)
    const { instance } = renderSelector({
      selectionScheme: {
        toString() {
          throw new Error('Unexpected selection scheme coercion')
        },
      },
      startDate,
      numDays: 2,
      minTime: 9,
      maxTime: 10,
    })

    expect(instance.state.selectionSchemePropSignature).toBe('square')

    await setStateAsync(instance, {
      selectionType: 'add',
      selectionStart: mondayTen,
    })

    await act(async () => {
      instance.updateAvailabilityDraft(tuesdayNine)
    })

    expect(instance.state.selectionDraft).toEqual([mondayNine, mondayTen, tuesdayNine, tuesdayTen])
  })

  it('preserves the visible draft when adding another cell before parent rerender', () => {
    const changeSpy = jest.fn()
    const { container } = renderSelector({ onChange: changeSpy, startDate, numDays: 1, minTime: 9, maxTime: 10 })
    const [firstCell, secondCell] = Array.from(container.querySelectorAll('button.rgdp__grid-cell'))

    clickCell(firstCell)
    clickCell(secondCell)

    expect(changeSpy).toHaveBeenLastCalledWith([
      addHours(startOfDay(startDate), 9),
      addHours(startOfDay(startDate), 10),
    ])
  })

  it('removes a visibly selected draft cell before parent rerender', () => {
    const changeSpy = jest.fn()
    const { container } = renderSelector({ onChange: changeSpy, startDate, numDays: 1, minTime: 9, maxTime: 9 })
    const cell = container.querySelector('button.rgdp__grid-cell')

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

  it('does not suppress touch scrolling from blocked cells', () => {
    const addSpy = jest.spyOn(HTMLElement.prototype, 'addEventListener')
    const blocked = addHours(startOfDay(startDate), 9)
    const { getByRole } = renderSelector({
      blocked: [blocked],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 9,
    })
    const blockedCell = getByRole('button', { name: 'Blocked Monday, January 1, 2018 at 9 am' })

    expect(addSpy).not.toHaveBeenCalledWith('touchmove', preventScroll, { passive: false })
    expect(blockedCell).toHaveStyleRule('cursor', 'not-allowed')
    expect(blockedCell).not.toHaveStyleRule('touch-action', 'none')
    addSpy.mockRestore()
  })

  it('updates date lookup maps when a mounted date cell receives a new time', () => {
    const { instance } = renderSelector()
    const cell = document.createElement('div')
    const addSpy = jest.spyOn(cell, 'addEventListener')
    const firstTime = addHours(startOfDay(startDate), 9)
    const secondTime = addHours(startOfDay(startDate), 10)

    instance.registerDateCell(cell, firstTime)
    instance.registerDateCell(cell, secondTime)

    expect(addSpy).toHaveBeenCalledTimes(1)
    expect(instance.dateToCell.has(firstTime.getTime())).toBe(false)
    expect(instance.dateToCell.get(secondTime.getTime())).toBe(cell)
    addSpy.mockRestore()
  })

  it('removes touchmove prevention when a registered cell becomes blocked', () => {
    const { instance } = renderSelector()
    const cell = document.createElement('div')
    const removeSpy = jest.spyOn(cell, 'removeEventListener')
    const time = addHours(startOfDay(startDate), 9)

    instance.registerDateCell(cell, time)
    instance.registerDateCell(cell, time, false)

    expect(removeSpy).toHaveBeenCalledWith('touchmove', preventScroll)
    expect(instance.cellToDate.get(cell)).toEqual(time)
    expect(instance.dateToCell.get(time.getTime())).toBe(cell)
    expect(instance.touchScrollCells.has(cell)).toBe(false)
    removeSpy.mockRestore()
  })

  it('registers date cells even when touchmove listeners cannot be attached', () => {
    const { instance } = renderSelector()
    const cell = { addEventListener: true, removeEventListener: jest.fn() }
    const time = addHours(startOfDay(startDate), 9)

    expect(() => {
      instance.registerDateCell(cell, time)
    }).not.toThrow()
    expect(instance.cellToDate.get(cell)).toEqual(time)
    expect(instance.dateToCell.get(time.getTime())).toBe(cell)
    expect(instance.touchScrollCells.has(cell)).toBe(false)
  })

  it('treats malformed date cell times as untracked placeholders', () => {
    const { instance } = renderSelector()
    const cell = document.createElement('div')
    const removeSpy = jest.spyOn(cell, 'removeEventListener')
    const time = addHours(startOfDay(startDate), 9)

    instance.registerDateCell(cell, time)
    instance.registerDateCell(cell, { getTime: true })
    document.elementFromPoint.mockReturnValue(cell)

    expect(removeSpy).toHaveBeenCalledWith('touchmove', preventScroll)
    expect(instance.cellToDate.get(cell)).toBe(null)
    expect(instance.dateToCell.has(time.getTime())).toBe(false)
    expect(Array.from(instance.dateToCell.values())).not.toContain(cell)
    expect(instance.touchScrollCells.has(cell)).toBe(false)
    expect(instance.getTimeFromTouchEvent({ touches: [{ clientX: 1, clientY: 2 }] })).toBe(null)

    removeSpy.mockRestore()
  })

  it('ignores nullish date cells during registration cleanup', () => {
    const { instance } = renderSelector()
    const time = addHours(startOfDay(startDate), 7)

    expect(() => {
      instance.registerDateCell(null, time)
      instance.unregisterDateCell(null)
    }).not.toThrow()
    expect(instance.cellToDate.has(null)).toBe(false)
    expect(instance.dateToCell.has(time.getTime())).toBe(false)
  })

  it('ignores nullish date cells when syncing touchmove listeners', () => {
    const { instance } = renderSelector()

    expect(() => {
      instance.syncDateCellTouchMoveListener(null, true)
    }).not.toThrow()
    expect(instance.touchScrollCells.has(null)).toBe(false)
  })

  it('unregisters date cells even when touchmove listeners cannot be removed', () => {
    const { instance } = renderSelector()
    const cell = { addEventListener: jest.fn(), removeEventListener: true }
    const time = addHours(startOfDay(startDate), 9)

    instance.registerDateCell(cell, time)

    expect(instance.touchScrollCells.has(cell)).toBe(true)
    expect(() => {
      instance.unregisterDateCell(cell)
    }).not.toThrow()
    expect(instance.cellToDate.has(cell)).toBe(false)
    expect(instance.dateToCell.has(time.getTime())).toBe(false)
    expect(instance.touchScrollCells.has(cell)).toBe(false)
  })

  it('keeps newer date lookup entries when an older cell unregisters the same time', () => {
    const { instance } = renderSelector()
    const firstCell = document.createElement('div')
    const secondCell = document.createElement('div')
    const time = addHours(startOfDay(startDate), 9)

    instance.registerDateCell(firstCell, time)
    instance.registerDateCell(secondCell, time)
    instance.unregisterDateCell(firstCell)

    expect(instance.cellToDate.has(firstCell)).toBe(false)
    expect(instance.touchScrollCells.has(firstCell)).toBe(false)
    expect(instance.cellToDate.get(secondCell)).toEqual(time)
    expect(instance.dateToCell.get(time.getTime())).toBe(secondCell)
  })

  it('keeps newer date lookup entries when an older cell re-registers away from a shared time', () => {
    const { instance } = renderSelector()
    const firstCell = document.createElement('div')
    const secondCell = document.createElement('div')
    const firstTime = addHours(startOfDay(startDate), 9)
    const secondTime = addHours(startOfDay(startDate), 10)

    instance.registerDateCell(firstCell, firstTime)
    instance.registerDateCell(secondCell, firstTime)
    instance.registerDateCell(firstCell, secondTime)

    expect(instance.dateToCell.get(firstTime.getTime())).toBe(secondCell)
    expect(instance.dateToCell.get(secondTime.getTime())).toBe(firstCell)
  })

  it('removes stale date lookup entries when a mounted cell has no previous time', () => {
    const { instance } = renderSelector()
    const cell = document.createElement('div')
    const addSpy = jest.spyOn(cell, 'addEventListener')
    const staleTime = addHours(startOfDay(startDate), 8)
    const nextTime = addHours(startOfDay(startDate), 9)
    instance.cellToDate.set(cell, null)
    instance.dateToCell.set(staleTime.getTime(), cell)

    instance.registerDateCell(cell, nextTime)

    expect(addSpy).toHaveBeenCalledWith('touchmove', preventScroll, { passive: false })
    expect(instance.dateToCell.has(staleTime.getTime())).toBe(false)
    expect(instance.dateToCell.get(nextTime.getTime())).toBe(cell)
    expect(instance.touchScrollCells.has(cell)).toBe(true)
    addSpy.mockRestore()
  })

  it('clears stale date lookup entries when a mounted cell has a malformed previous time', () => {
    const { instance } = renderSelector()
    const cell = document.createElement('div')
    const staleTime = addHours(startOfDay(startDate), 8)
    const nextTime = addHours(startOfDay(startDate), 9)
    instance.cellToDate.set(cell, { getTime: true })
    instance.dateToCell.set(staleTime.getTime(), cell)

    expect(() => {
      instance.registerDateCell(cell, nextTime)
    }).not.toThrow()
    expect(instance.dateToCell.has(staleTime.getTime())).toBe(false)
    expect(instance.cellToDate.get(cell)).toEqual(nextTime)
    expect(instance.dateToCell.get(nextTime.getTime())).toBe(cell)
  })

  it('finds a registered date cell from SVG content inside it', () => {
    const { instance } = renderSelector()
    const cell = document.createElement('div')
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    cell.appendChild(svg)
    instance.registerDateCell(cell, startDate)

    expect(instance.getDateCellFromEventTarget(svg)).toBe(cell)
  })

  it('returns null for mouseup targets outside the DOM node tree', () => {
    const { instance } = renderSelector()

    expect(instance.getDateCellFromEventTarget(null)).toBe(null)
  })

  it('returns null when DOM constructors are unavailable', () => {
    const { instance } = renderSelector()
    const nodeConstructor = window.Node
    const htmlElementConstructor = window.HTMLElement

    window.Node = undefined
    window.HTMLElement = undefined

    try {
      expect(instance.getDateCellFromEventTarget(document.createElement('div'))).toBe(null)
    } finally {
      window.Node = nodeConstructor
      window.HTMLElement = htmlElementConstructor
    }
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
      removeEventListener: jest.fn(),
    }
    instance.cellToDate.set(mockDateCell, new Date())
    instance.dateToCell.set(startDate.getTime(), mockDateCell)

    unmount()

    expect(mockDateCell.removeEventListener).toHaveBeenCalledWith('touchmove', expect.anything())
    expect(instance.cellToDate.size).toBe(0)
    expect(instance.dateToCell.size).toBe(0)
  })

  it('ignores registered date cell entries that cannot remove listeners', () => {
    const { instance, unmount } = renderSelector()
    const mockDateCell = {}
    instance.cellToDate.set(mockDateCell, new Date())

    expect(() => {
      unmount()
    }).not.toThrow()
    expect(instance.cellToDate.size).toBe(0)
  })

  it('ignores registered date cell entries with non-callable listener cleanup', () => {
    const { instance, unmount } = renderSelector()
    const mockDateCell = { removeEventListener: true }
    instance.cellToDate.set(mockDateCell, new Date())

    expect(() => {
      unmount()
    }).not.toThrow()
    expect(instance.cellToDate.size).toBe(0)
  })

  it('unregisters cells even when no previous time is tracked', () => {
    const { instance } = renderSelector()
    const cell = document.createElement('div')
    const removeSpy = jest.spyOn(cell, 'removeEventListener')
    const staleTime = addHours(startOfDay(startDate), 8)
    instance.registerDateCell(cell, staleTime)
    instance.cellToDate.set(cell, null)
    instance.dateToCell.set(staleTime.getTime(), cell)

    instance.unregisterDateCell(cell)

    expect(removeSpy).toHaveBeenCalledWith('touchmove', preventScroll)
    expect(instance.cellToDate.has(cell)).toBe(false)
    expect(instance.dateToCell.has(staleTime.getTime())).toBe(false)
    removeSpy.mockRestore()
  })

  it('keeps date-cell lookups stable when React StrictMode remounts refs', () => {
    const instanceRef = React.createRef()
    const rendered = render(
      <React.StrictMode>
        <BookingSelector ref={instanceRef} startDate={startDate} numDays={1} minTime={9} maxTime={9} />
      </React.StrictMode>,
    )
    const instance = instanceRef.current

    expect(rendered.getByRole('button', { name: 'Available Monday, January 1, 2018 at 9 am' })).toBeInTheDocument()
    expect(instance.cellToDate.size).toBe(1)
    expect(instance.dateToCell.size).toBe(1)
    expect(instance.touchScrollCells.size).toBe(1)

    rendered.unmount()

    expect(instance.cellToDate.size).toBe(0)
    expect(instance.dateToCell.size).toBe(0)
    expect(instance.touchScrollCells.size).toBe(0)
  })
})

describe('prop updates', () => {
  it('makes the selection prop override the existing selection draft', () => {
    const rendered = renderSelector()
    const nextSelection = [startDate]

    rendered.rerenderWithProps({ selection: nextSelection })

    expect(rendered.instance.state.selectionDraft).toEqual(nextSelection)
  })

  it('cancels active selections when selection props change', () => {
    const changeSpy = jest.fn()
    const externalSelection = addHours(startOfDay(startDate), 10)
    const rendered = renderSelector({ onChange: changeSpy, startDate, numDays: 1, minTime: 9, maxTime: 10 })
    const [firstCell] = Array.from(rendered.container.querySelectorAll('button.rgdp__grid-cell'))

    fireEvent.mouseDown(firstCell)
    expect(rendered.instance.state.selectionType).toBe('add')

    rendered.rerenderWithProps({
      onChange: changeSpy,
      selection: [externalSelection],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 10,
    })

    expect(rendered.instance.state.selectionDraft).toEqual([externalSelection])
    expect(rendered.instance.state.selectionType).toBe(null)
    expect(rendered.instance.state.selectionStart).toBe(null)
    expect(rendered.instance.state.isTouchDragging).toBe(false)

    fireEvent.mouseUp(firstCell)

    expect(changeSpy).not.toHaveBeenCalled()
  })

  it('cancels active selections and restores controlled selection when blocked props change', () => {
    const changeSpy = jest.fn()
    const controlledSelection = addHours(startOfDay(startDate), 10)
    const newlyBlocked = addHours(startOfDay(startDate), 9)
    const rendered = renderSelector({
      onChange: changeSpy,
      selection: [controlledSelection],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 10,
    })
    const [firstCell] = Array.from(rendered.container.querySelectorAll('button.rgdp__grid-cell'))

    fireEvent.mouseDown(firstCell)
    fireEvent.mouseEnter(firstCell)
    expect(rendered.instance.state.selectionType).toBe('add')
    expect(rendered.instance.state.selectionDraft).toEqual([controlledSelection, newlyBlocked])

    rendered.rerenderWithProps({
      onChange: changeSpy,
      selection: [controlledSelection],
      blocked: [newlyBlocked],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 10,
    })

    expect(rendered.instance.state.selectionDraft).toEqual([controlledSelection])
    expect(rendered.instance.state.selectionBase).toEqual([controlledSelection])
    expect(rendered.instance.state.selectionType).toBe(null)
    expect(rendered.instance.state.selectionStart).toBe(null)

    fireEvent.mouseUp(rendered.getByRole('button', { name: 'Blocked Monday, January 1, 2018 at 9 am' }))

    expect(changeSpy).not.toHaveBeenCalled()
  })

  it('keeps active selections when blocked props keep the same minute set', () => {
    const changeSpy = jest.fn()
    const selected = addHours(startOfDay(startDate), 9)
    const blockedOne = addHours(startOfDay(startDate), 11)
    const blockedTwo = addHours(startOfDay(startDate), 12)
    const rendered = renderSelector({
      onChange: changeSpy,
      blocked: [blockedOne, blockedTwo],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 12,
    })
    const [firstCell] = Array.from(rendered.container.querySelectorAll('button.rgdp__grid-cell'))

    fireEvent.mouseDown(firstCell)
    fireEvent.mouseEnter(firstCell)

    rendered.rerenderWithProps({
      onChange: changeSpy,
      blocked: [blockedTwo, new Date(blockedOne.getTime() + 30000), blockedOne],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 12,
    })

    expect(rendered.instance.state.selectionDraft).toEqual([selected])
    expect(rendered.instance.state.selectionBase).toEqual([])
    expect(rendered.instance.state.selectionType).toBe('add')
    expect(rendered.instance.state.selectionStart).toEqual(selected)

    fireEvent.mouseUp(firstCell)

    expect(changeSpy).toHaveBeenCalledWith([selected])
  })

  it('keeps active selections when selection props keep the same minute set', () => {
    const changeSpy = jest.fn()
    const selectedOne = addHours(startOfDay(startDate), 9)
    const selectedTwo = addHours(startOfDay(startDate), 10)
    const selectedThree = addHours(startOfDay(startDate), 11)
    const rendered = renderSelector({
      onChange: changeSpy,
      selection: [selectedTwo, selectedOne],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 11,
    })
    const thirdCell = rendered.getByRole('button', { name: 'Available Monday, January 1, 2018 at 11 am' })

    fireEvent.mouseDown(thirdCell)
    fireEvent.mouseEnter(thirdCell)

    rendered.rerenderWithProps({
      onChange: changeSpy,
      selection: [selectedOne, new Date(selectedTwo.getTime() + 30000), selectedTwo],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 11,
    })

    expect(rendered.instance.state.selectionDraft).toEqual([selectedTwo, selectedOne, selectedThree])
    expect(rendered.instance.state.selectionBase).toEqual([selectedTwo, selectedOne])
    expect(rendered.instance.state.selectionType).toBe('add')
    expect(rendered.instance.state.selectionStart).toEqual(selectedThree)

    fireEvent.mouseUp(rendered.getByRole('button', { name: 'Selected Monday, January 1, 2018 at 11 am' }))

    expect(changeSpy).toHaveBeenCalledWith([selectedTwo, selectedOne, selectedThree])
  })

  it('updates idle selection drafts when controlled selection order changes', () => {
    const selectedOne = addHours(startOfDay(startDate), 9)
    const selectedTwo = addHours(startOfDay(startDate), 10)
    const rendered = renderSelector({
      selection: [selectedTwo, selectedOne],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 10,
    })

    rendered.rerenderWithProps({
      selection: [selectedOne, selectedTwo],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 10,
    })

    expect(rendered.instance.state.selectionDraft).toEqual([selectedOne, selectedTwo])
    expect(rendered.instance.state.selectionBase).toEqual([selectedOne, selectedTwo])
  })

  it('updates idle selection drafts when controlled selection values change inside the same minute', async () => {
    const changeSpy = jest.fn()
    const firstSelectedValue = addHours(startOfDay(startDate), 9)
    const nextSelectedValue = new Date(firstSelectedValue.getTime() + 30000)
    const added = addHours(startOfDay(startDate), 10)
    const rendered = renderSelector({
      onChange: changeSpy,
      selection: [firstSelectedValue],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 10,
    })

    rendered.rerenderWithProps({
      onChange: changeSpy,
      selection: [nextSelectedValue],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 10,
    })

    expect(rendered.instance.state.selectionDraft).toEqual([nextSelectedValue])
    expect(rendered.instance.state.selectionBase).toEqual([nextSelectedValue])

    clickCell(rendered.getByRole('button', { name: 'Available Monday, January 1, 2018 at 10 am' }))

    await waitFor(() => {
      expect(changeSpy).toHaveBeenCalledWith([nextSelectedValue, added])
    })
  })

  it('does not treat malformed selection modes as active during controlled prop updates', async () => {
    const firstSelectedValue = addHours(startOfDay(startDate), 9)
    const nextSelectedValue = new Date(firstSelectedValue.getTime() + 30000)
    const rendered = renderSelector({
      selection: [firstSelectedValue],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 9,
    })

    await setStateAsync(rendered.instance, {
      selectionType: 'toggle',
      selectionStart: null,
      isTouchDragging: false,
    })
    rendered.rerenderWithProps({
      selection: [nextSelectedValue],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 9,
    })

    expect(rendered.instance.state.selectionDraft).toEqual([nextSelectedValue])
    expect(rendered.instance.state.selectionBase).toEqual([nextSelectedValue])
    expect(rendered.instance.state.selectionType).toBe(null)
  })

  it('ignores malformed selection draft entries during render and lookup refresh', async () => {
    const selected = addHours(startOfDay(startDate), 9)
    const rendered = renderSelector({ startDate, numDays: 1, minTime: 9, maxTime: 9 })

    await setStateAsync(rendered.instance, {
      selectionDraft: [{ getTime: true }, new Date(NaN), selected],
    })

    expect(rendered.getByRole('button', { name: 'Selected Monday, January 1, 2018 at 9 am' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(rendered.instance.selectedMinuteKeys).toEqual(new Set([Math.floor(selected.getTime() / 60000)]))
  })

  it('cancels active selections when grid range props change', () => {
    const changeSpy = jest.fn()
    const selected = addHours(startOfDay(startDate), 9)
    const rendered = renderSelector({ onChange: changeSpy, startDate, numDays: 1, minTime: 9, maxTime: 10 })
    const [firstCell] = Array.from(rendered.container.querySelectorAll('button.rgdp__grid-cell'))

    fireEvent.mouseDown(firstCell)
    fireEvent.mouseEnter(firstCell)
    expect(rendered.instance.state.selectionType).toBe('add')
    expect(rendered.instance.state.selectionDraft).toEqual([selected])

    rendered.rerenderWithProps({
      onChange: changeSpy,
      startDate: addDays(startDate, 1),
      numDays: 1,
      minTime: 9,
      maxTime: 10,
    })

    expect(rendered.instance.state.selectionDraft).toEqual([])
    expect(rendered.instance.state.selectionBase).toEqual([])
    expect(rendered.instance.state.selectionType).toBe(null)
    expect(rendered.instance.state.selectionStart).toBe(null)
    expect(rendered.instance.state.isTouchDragging).toBe(false)

    fireEvent.mouseUp(rendered.getByRole('button', { name: 'Available Tuesday, January 2, 2018 at 9 am' }))

    expect(changeSpy).not.toHaveBeenCalled()
  })

  it('cancels active selections when the selection scheme changes', () => {
    const changeSpy = jest.fn()
    const selected = addHours(startOfDay(startDate), 9)
    const rendered = renderSelector({
      onChange: changeSpy,
      selectionScheme: 'square',
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 10,
    })
    const [firstCell] = Array.from(rendered.container.querySelectorAll('button.rgdp__grid-cell'))

    fireEvent.mouseDown(firstCell)
    fireEvent.mouseEnter(firstCell)
    expect(rendered.instance.state.selectionType).toBe('add')
    expect(rendered.instance.state.selectionDraft).toEqual([selected])

    rendered.rerenderWithProps({
      onChange: changeSpy,
      selectionScheme: 'linear',
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 10,
    })

    expect(rendered.instance.state.selectionDraft).toEqual([])
    expect(rendered.instance.state.selectionBase).toEqual([])
    expect(rendered.instance.state.selectionSchemePropSignature).toBe('linear')
    expect(rendered.instance.state.selectionType).toBe(null)
    expect(rendered.instance.state.selectionStart).toBe(null)
    expect(rendered.instance.state.isTouchDragging).toBe(false)

    fireEvent.mouseUp(rendered.getByRole('button', { name: 'Available Monday, January 1, 2018 at 9 am' }))

    expect(changeSpy).not.toHaveBeenCalled()
  })

  it('clones selection dates from props', () => {
    const selected = addHours(startOfDay(startDate), 9)
    const rendered = renderSelector({ selection: [selected], startDate, numDays: 1, minTime: 9, maxTime: 9 })

    selected.setHours(10)

    expect(rendered.instance.state.selectionDraft).toEqual([addHours(startOfDay(startDate), 9)])
  })

  it('reports malformed dates as neither blocked nor selected', () => {
    const rendered = renderSelector({
      selection: [addHours(startOfDay(startDate), 9)],
      blocked: [addHours(startOfDay(startDate), 10)],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 10,
    })

    expect(rendered.instance.isBlocked({ getTime: true })).toBe(false)
    expect(rendered.instance.isSelected({ getTime: true })).toBe(false)
    expect(rendered.instance.isBlocked(new Date(NaN))).toBe(false)
    expect(rendered.instance.isSelected(new Date(NaN))).toBe(false)
  })

  it('deduplicates selection props at minute precision', () => {
    const selected = addHours(startOfDay(startDate), 9)
    const duplicateSameMinute = new Date(selected.getTime() + 30000)
    const rendered = renderSelector({
      selection: [selected, duplicateSameMinute],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 9,
    })

    expect(rendered.instance.state.selectionDraft).toEqual([selected])
    expect(rendered.getByRole('button', { name: 'Selected Monday, January 1, 2018 at 9 am' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('detects selection prop updates when the array is mutated in place', () => {
    const selection = []
    const rendered = renderSelector({ selection })

    selection.push(startDate)
    rendered.rerenderWithProps({ selection })

    expect(rendered.instance.state.selectionDraft).toEqual([startDate])
  })

  it('detects blocked prop updates when the array is mutated in place', () => {
    const blocked = []
    const blockedSlot = addHours(startOfDay(startDate), 9)
    const rendered = renderSelector({ blocked, startDate, numDays: 1, minTime: 9, maxTime: 9 })

    blocked.push(blockedSlot)
    rendered.rerenderWithProps({ blocked, startDate, numDays: 1, minTime: 9, maxTime: 9 })

    expect(rendered.getByRole('button', { name: 'Blocked Monday, January 1, 2018 at 9 am' })).toBeDisabled()
  })

  it('keeps the visible draft when unchanged selection props rerender', () => {
    const selection = []
    const rendered = renderSelector({ selection, startDate, numDays: 1, minTime: 9, maxTime: 9 })
    const cell = rendered.container.querySelector('button.rgdp__grid-cell')

    clickCell(cell)
    rendered.rerenderWithProps({ selection, startDate, numDays: 1, minTime: 9, maxTime: 9 })

    expect(rendered.instance.state.selectionDraft).toEqual([addHours(startOfDay(startDate), 9)])
  })

  it('rebuilds the date grid when range props change', () => {
    const rendered = renderSelector({ startDate, numDays: 1, minTime: 9, maxTime: 10 })

    rendered.rerenderWithProps({ startDate, numDays: 2, minTime: 8, maxTime: 9 })

    expect(rendered.instance.dates).toHaveLength(2)
    expect(rendered.instance.dates[0]).toHaveLength(2)
  })

  it('keeps visible hours stable across daylight-saving-time boundaries', () => {
    const start = new Date(2024, 2, 9)
    const dateColumns = buildDateColumns(
      {
        startDate: start,
        numDays: 3,
        minTime: 9,
        maxTime: 9,
      },
      (day, hour) => new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, 0, 0, 0),
    )

    expect(dateColumns.map((dateColumn) => dateColumn.slots[0].time.getHours())).toEqual([9, 9, 9])
  })

  it('marks nonexistent daylight-saving-time hours as placeholders instead of duplicate slots', () => {
    const start = new Date(2024, 2, 10)
    const dateGridProps = {
      startDate: start,
      numDays: 1,
      minTime: 1,
      maxTime: 3,
    }
    const createTime = (day, hour) => {
      const visibleHour = hour === 2 ? 3 : hour
      return new Date(day.getFullYear(), day.getMonth(), day.getDate(), visibleHour, 0, 0, 0)
    }
    const dateColumns = buildDateColumns(dateGridProps, createTime)

    expect(dateColumns[0].slots.map((slot) => [slot.hour, slot.time ? slot.time.getHours() : null])).toEqual([
      [1, 1],
      [2, null],
      [3, 3],
    ])
    expect(buildDates(dateGridProps, createTime)[0].map((time) => time.getHours())).toEqual([1, 3])
  })

  it('marks non-Date custom time values as placeholders', () => {
    const start = new Date(2024, 2, 10)
    const dateGridProps = {
      startDate: start,
      numDays: 1,
      minTime: 1,
      maxTime: 3,
    }
    const createTime = (day, hour) => {
      if (hour === 2) return null
      return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, 0, 0, 0)
    }
    const dateColumns = buildDateColumns(dateGridProps, createTime)

    expect(dateColumns[0].slots.map((slot) => [slot.hour, slot.time ? slot.time.getHours() : null])).toEqual([
      [1, 1],
      [2, null],
      [3, 3],
    ])
    expect(buildDates(dateGridProps, createTime)[0].map((time) => time.getHours())).toEqual([1, 3])
  })

  it('marks custom time creation errors as placeholders', () => {
    const start = new Date(2024, 2, 10)
    const dateGridProps = {
      startDate: start,
      numDays: 1,
      minTime: 1,
      maxTime: 3,
    }
    const createTime = (day, hour) => {
      if (hour === 2) throw new Error('Missing local hour')
      return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, 0, 0, 0)
    }
    const dateColumns = buildDateColumns(dateGridProps, createTime)

    expect(dateColumns[0].slots.map((slot) => [slot.hour, slot.time ? slot.time.getHours() : null])).toEqual([
      [1, 1],
      [2, null],
      [3, 3],
    ])
    expect(buildDates(dateGridProps, createTime)[0].map((time) => time.getHours())).toEqual([1, 3])
  })

  it('renders nonexistent daylight-saving-time hours as placeholders instead of duplicate slots', () => {
    const start = new Date(2024, 2, 10)
    const host = renderSelector({ startDate: start, numDays: 1, minTime: 1, maxTime: 3 })
    const [dateColumn] = buildDateColumns(
      {
        startDate: start,
        numDays: 1,
        minTime: 1,
        maxTime: 3,
      },
      (day, hour) => {
        const visibleHour = hour === 2 ? 3 : hour
        return new Date(day.getFullYear(), day.getMonth(), day.getDate(), visibleHour, 0, 0, 0)
      },
    )
    const rendered = render(
      <div>
        {host.instance.renderTimeLabels()}
        {host.instance.renderDateColumn(dateColumn, new Set(), new Set())}
      </div>,
    )
    const renderedGrid = within(rendered.container)

    expect(rendered.container.querySelectorAll('button.rgdp__grid-cell')).toHaveLength(2)
    expect(renderedGrid.getByText('2 am').closest('[aria-hidden="true"]')).toBeInTheDocument()
    expect(renderedGrid.getByRole('button', { name: 'Available Sunday, March 10, 2024 at 1 am' })).toBeInTheDocument()
    expect(renderedGrid.queryByRole('button', { name: 'Available Sunday, March 10, 2024 at 2 am' })).toBe(null)
    expect(renderedGrid.getAllByRole('button', { name: 'Available Sunday, March 10, 2024 at 3 am' })).toHaveLength(1)

    host.unmount()
    rendered.unmount()
  })

  it('renders real date slots across daylight-saving-time boundaries', () => {
    const rendered = renderSelector({
      startDate: new Date(2024, 2, 9),
      numDays: 3,
      minTime: 9,
      maxTime: 9,
    })

    expect(rendered.instance.dates.map((dayOfTimes) => dayOfTimes[0].getHours())).toEqual([9, 9, 9])
    expect(rendered.getByRole('button', { name: 'Available Saturday, March 9, 2024 at 9 am' })).toBeInTheDocument()
    expect(rendered.getByRole('button', { name: 'Available Sunday, March 10, 2024 at 9 am' })).toBeInTheDocument()
    expect(rendered.getByRole('button', { name: 'Available Monday, March 11, 2024 at 9 am' })).toBeInTheDocument()
    expect(rendered.queryByRole('button', { name: 'Available Sunday, March 10, 2024 at 10 am' })).toBe(null)
  })

  it('keeps horizontal keyboard navigation on the rendered row when a daylight-saving-time hour is missing', () => {
    const dateColumns = buildDateColumns(
      {
        startDate: new Date(2024, 2, 9),
        numDays: 2,
        minTime: 1,
        maxTime: 3,
      },
      (day, hour) => {
        const visibleHour = day.getDate() === 10 && hour === 2 ? 3 : hour
        return new Date(day.getFullYear(), day.getMonth(), day.getDate(), visibleHour, 0, 0, 0)
      },
    )
    const saturdayTwo = dateColumns[0].slots[1].time
    const saturdayThree = dateColumns[0].slots[2].time
    const sundayThree = dateColumns[1].slots[2].time

    expect(getKeyboardNavigationTarget(dateColumns, saturdayTwo, 'ArrowRight')).toBe(null)
    expect(getKeyboardNavigationTarget(dateColumns, saturdayThree, 'ArrowRight')).toBe(sundayThree)
    expect(getKeyboardNavigationTarget(dateColumns, saturdayTwo, 'ArrowLeft')).toBe(null)
    expect(getKeyboardNavigationTarget(dateColumns, new Date(2040, 0, 1), 'ArrowRight')).toBe(null)
    expect(getKeyboardNavigationTarget(dateColumns, saturdayTwo, 'Escape')).toBe(null)
  })

  it('skips sparse horizontal keyboard navigation cells', () => {
    const mondayNine = addHours(startOfDay(startDate), 9)
    const tuesdayNine = addHours(addDays(startOfDay(startDate), 1), 9)
    const thursdayNine = addHours(addDays(startOfDay(startDate), 3), 9)
    const dateColumns = [
      { day: startDate, slots: [{ hour: 9, time: mondayNine }] },
      undefined,
      { day: addDays(startDate, 2), slots: [] },
      { day: addDays(startDate, 3), slots: [{ hour: 9, time: thursdayNine }] },
    ]
    const sparseBeforeTarget = [undefined, { day: addDays(startDate, 1), slots: [{ hour: 9, time: tuesdayNine }] }]

    expect(getKeyboardNavigationTarget(dateColumns, mondayNine, 'ArrowRight')).toBe(thursdayNine)
    expect(getKeyboardNavigationTarget(sparseBeforeTarget, tuesdayNine, 'ArrowLeft')).toBe(null)
  })

  it('skips malformed keyboard navigation slot lists and entries', () => {
    const mondayNine = addHours(startOfDay(startDate), 9)
    const mondayNoon = addHours(startOfDay(startDate), 12)
    const thursdayNine = addHours(addDays(startOfDay(startDate), 3), 9)
    const dateColumns = [
      {
        day: startDate,
        slots: [
          { hour: 9, time: mondayNine },
          undefined,
          { hour: 10, time: new Date(NaN) },
          { hour: 11, time: 'not-a-date' },
          { hour: 12, time: mondayNoon },
        ],
      },
      { day: addDays(startDate, 1), slots: null },
      { day: addDays(startDate, 2), slots: [{ hour: 9, time: new Date(NaN) }] },
      { day: addDays(startDate, 3), slots: [{ hour: 9, time: thursdayNine }] },
    ]

    expect(getKeyboardNavigationTarget(dateColumns, mondayNine, 'ArrowRight')).toBe(thursdayNine)
    expect(getKeyboardNavigationTarget(dateColumns, mondayNine, 'ArrowDown')).toBe(mondayNoon)
    expect(getKeyboardNavigationTarget([{ day: startDate, slots: null }], mondayNine, 'ArrowRight')).toBe(null)
    expect(getKeyboardNavigationTarget(dateColumns, { getTime: true }, 'ArrowRight')).toBe(null)
    expect(getKeyboardNavigationTarget(dateColumns, new Date(NaN), 'ArrowRight')).toBe(null)
  })

  it('skips placeholder rows when vertically navigating daylight-saving-time gaps', () => {
    const dateColumns = buildDateColumns(
      {
        startDate: new Date(2024, 2, 10),
        numDays: 1,
        minTime: 1,
        maxTime: 3,
      },
      (day, hour) => {
        const visibleHour = hour === 2 ? 3 : hour
        return new Date(day.getFullYear(), day.getMonth(), day.getDate(), visibleHour, 0, 0, 0)
      },
    )
    const one = dateColumns[0].slots[0].time
    const three = dateColumns[0].slots[2].time

    expect(getKeyboardNavigationTarget(dateColumns, one, 'ArrowDown')).toBe(three)
    expect(getKeyboardNavigationTarget(dateColumns, three, 'ArrowUp')).toBe(one)
    expect(getKeyboardNavigationTarget(dateColumns, one, 'ArrowUp')).toBe(null)
    expect(getKeyboardNavigationTarget(dateColumns, three, 'ArrowDown')).toBe(null)
  })

  it('renders no date cells when the time range has no slots', () => {
    const rendered = renderSelector({ startDate, numDays: 2, minTime: 10, maxTime: 9 })

    expect(rendered.instance.dates).toEqual([])
    expect(rendered.container.querySelectorAll('button.rgdp__grid-cell')).toHaveLength(0)
  })

  it('renders no orphaned time labels when there are no date columns', () => {
    const rendered = renderSelector({ startDate, numDays: 0, minTime: 9, maxTime: 10 })

    expect(rendered.instance.dates).toEqual([])
    expect(rendered.container.querySelectorAll('button.rgdp__grid-cell')).toHaveLength(0)
    expect(rendered.container).not.toHaveTextContent('9 am')
    expect(rendered.container).not.toHaveTextContent('10 am')
  })

  it('renders no date cells when time range values are outside 0 to 23', () => {
    const rendered = renderSelector({ startDate, numDays: 2, minTime: -1, maxTime: 24 })

    expect(rendered.instance.dates).toEqual([])
    expect(rendered.container.querySelectorAll('button.rgdp__grid-cell')).toHaveLength(0)
    expect(rendered.container).not.toHaveTextContent('-1 am')
  })

  it('renders no date cells when range values are fractional', () => {
    const rendered = renderSelector({ startDate, numDays: 1.5, minTime: 8.5, maxTime: 9 })

    expect(rendered.instance.dates).toEqual([])
    expect(rendered.container.querySelectorAll('button.rgdp__grid-cell')).toHaveLength(0)
    expect(rendered.container).not.toHaveTextContent('8.5 am')
  })

  it('renders no date cells when range props are malformed', () => {
    const throwingValue = {
      toString() {
        throw new Error('Unexpected coercion')
      },
    }
    const rendered = renderSelector({
      startDate,
      numDays: Symbol('days'),
      minTime: throwingValue,
      maxTime: throwingValue,
    })

    expect(rendered.instance.dates).toEqual([])
    expect(rendered.container.querySelectorAll('button.rgdp__grid-cell')).toHaveLength(0)
  })

  it('uses the current day when startDate is omitted', () => {
    const currentDate = new Date('2032-05-15T12:00:00.000Z')
    jest.useFakeTimers()
    jest.setSystemTime(currentDate)

    const rendered = renderSelector({ numDays: 1, minTime: 9, maxTime: 9 })

    expect(rendered.instance.dates).toEqual([[addHours(startOfDay(currentDate), 9)]])
  })

  it('uses the current day when startDate is invalid', () => {
    const currentDate = new Date('2032-05-15T12:00:00.000Z')
    jest.useFakeTimers()
    jest.setSystemTime(currentDate)

    const rendered = renderSelector({ startDate: new Date('invalid'), numDays: 1, minTime: 9, maxTime: 9 })

    expect(rendered.instance.dates).toEqual([[addHours(startOfDay(currentDate), 9)]])
  })

  it('uses the current day when startDate is not a Date object', () => {
    const currentDate = new Date('2032-05-15T12:00:00.000Z')
    jest.useFakeTimers()
    jest.setSystemTime(currentDate)

    const rendered = renderSelector({ startDate: 0, numDays: 1, minTime: 9, maxTime: 9 })

    expect(rendered.instance.dates).toEqual([[addHours(startOfDay(currentDate), 9)]])
  })

  it('falls back to the default date header format when dateFormat is invalid', () => {
    const rendered = renderSelector({
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 9,
      dateFormat: 'bad token',
    })

    expect(rendered.getByText('1')).toBeInTheDocument()
  })

  it('removes stale touchmove listeners when date cells remount', () => {
    const rendered = renderSelector({ startDate, numDays: 1, minTime: 9, maxTime: 9 })
    const cell = rendered.container.querySelector('button.rgdp__grid-cell')
    const removeSpy = jest.spyOn(cell, 'removeEventListener')

    rendered.rerenderWithProps({
      startDate: addDays(startDate, 1),
      numDays: 1,
      minTime: 9,
      maxTime: 9,
    })

    expect(removeSpy).toHaveBeenCalledWith('touchmove', preventScroll)
    expect(rendered.instance.cellToDate.has(cell)).toBe(false)
    expect(rendered.instance.dateToCell.has(addHours(startOfDay(startDate), 9).getTime())).toBe(false)
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

  it('ignores pointer starts on blocked cells', () => {
    const blocked = addHours(startOfDay(startDate), 9)
    const { getByRole, instance } = renderSelector({
      blocked: [blocked],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 9,
    })
    const blockedCell = getByRole('button', { name: 'Blocked Monday, January 1, 2018 at 9 am' })

    fireEvent.mouseDown(blockedCell)

    expect(instance.state.selectionType).toBe(null)
    expect(instance.state.selectionStart).toBe(null)
  })

  it('ignores touch starts on blocked cells', () => {
    const blocked = addHours(startOfDay(startDate), 9)
    const { getByRole, instance } = renderSelector({
      blocked: [blocked],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 9,
    })
    const blockedCell = getByRole('button', { name: 'Blocked Monday, January 1, 2018 at 9 am' })

    fireEvent.touchStart(blockedCell)

    expect(instance.state.selectionType).toBe(null)
    expect(instance.state.selectionStart).toBe(null)
  })

  it('does not call pointer handlers for blocked cell wrappers', () => {
    const blocked = addHours(startOfDay(startDate), 9)
    const { instance } = renderSelector({
      blocked: [blocked],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 9,
    })
    const mouseDownSpy = jest.spyOn(instance, 'handleMouseDownEvent')
    const mouseEnterSpy = jest.spyOn(instance, 'handleMouseEnterEvent')
    const mouseUpSpy = jest.spyOn(instance, 'handleMouseUpEvent')
    const touchSpy = jest.spyOn(instance, 'handleTouchStartEvent')
    const blockedCellWrapper = instance.renderDateCellWrapper(blocked)

    blockedCellWrapper.props.onMouseDown()
    blockedCellWrapper.props.onMouseEnter()
    blockedCellWrapper.props.onMouseUp()
    blockedCellWrapper.props.onTouchStart()

    expect(mouseDownSpy).not.toHaveBeenCalled()
    expect(mouseEnterSpy).not.toHaveBeenCalled()
    expect(mouseUpSpy).not.toHaveBeenCalled()
    expect(touchSpy).not.toHaveBeenCalled()
    mouseDownSpy.mockRestore()
    mouseEnterSpy.mockRestore()
    mouseUpSpy.mockRestore()
    touchSpy.mockRestore()
  })
})

describe('cell accessibility', () => {
  it('passes presentation props to the outer wrapper', () => {
    const { container, getByRole } = renderSelector({
      className: 'booking-selector-shell',
      id: 'booking-selector-shell',
      style: { maxWidth: 480 },
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 9,
    })
    const wrapper = container.firstElementChild
    const group = getByRole('group', { name: 'Booking time slots' })

    expect(wrapper).toHaveClass('booking-selector-shell')
    expect(wrapper).toHaveAttribute('id', 'booking-selector-shell')
    expect(wrapper).toHaveStyle('max-width: 480px')
    expect(wrapper).toHaveStyleRule('box-sizing', 'border-box')
    expect(wrapper).toHaveStyleRule('min-width', '0')
    expect(group.parentElement).toBe(wrapper)
    expect(group).toHaveStyleRule('box-sizing', 'border-box')
    expect(group).toHaveStyleRule('min-width', '0')
    expect(group).not.toHaveClass('booking-selector-shell')
    expect(group).not.toHaveAttribute('id', 'booking-selector-shell')
  })

  it('labels the slot group', () => {
    const { getByRole } = renderSelector({ startDate, numDays: 1, minTime: 9, maxTime: 9 })

    expect(getByRole('group', { name: 'Booking time slots' })).toBeInTheDocument()
  })

  it('allows the slot group label to be customized', () => {
    const { getByRole } = renderSelector({
      ariaLabel: 'Morning appointment availability',
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 9,
    })

    expect(getByRole('group', { name: 'Morning appointment availability' })).toBeInTheDocument()
  })

  it('supports the standard aria-label prop for the slot group', () => {
    const { getByRole, queryByRole } = renderSelector({
      ariaLabel: 'Alias label',
      'aria-label': 'Standard appointment availability',
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 9,
    })

    expect(getByRole('group', { name: 'Standard appointment availability' })).toBeInTheDocument()
    expect(queryByRole('group', { name: 'Alias label' })).toBe(null)
  })

  it('supports aria-labelledby for naming the slot group from visible text', () => {
    const { getByRole } = render(
      <>
        <h2 id="availability-heading">Team availability</h2>
        <BookingSelector
          aria-label="Fallback appointment availability"
          aria-labelledby="availability-heading"
          startDate={startDate}
          numDays={1}
          minTime={9}
          maxTime={9}
        />
      </>,
    )
    const group = getByRole('group', { name: 'Team availability' })

    expect(group).toHaveAttribute('aria-labelledby', 'availability-heading')
    expect(group).not.toHaveAttribute('aria-label')
  })

  it('supports aria-describedby for describing the slot group', () => {
    const { getByRole } = render(
      <>
        <p id="availability-help">Choose every hour your team can accept appointments.</p>
        <BookingSelector
          aria-describedby="availability-help"
          startDate={startDate}
          numDays={1}
          minTime={9}
          maxTime={9}
        />
      </>,
    )
    const group = getByRole('group', { name: 'Booking time slots' })

    expect(group).toHaveAttribute('aria-describedby', 'availability-help')
    expect(group).toHaveAccessibleDescription('Choose every hour your team can accept appointments.')
  })

  it('renders cells as native buttons', () => {
    const { getByRole } = renderSelector({ startDate, numDays: 1, minTime: 9, maxTime: 9 })

    expect(getByRole('button', { name: 'Available Monday, January 1, 2018 at 9 am' }).tagName).toBe('BUTTON')
  })

  it('keeps grid cell focus outlines visible without focus-visible support', () => {
    const { getByRole } = renderSelector({ startDate, numDays: 1, minTime: 9, maxTime: 9 })
    const cell = getByRole('button', { name: 'Available Monday, January 1, 2018 at 9 am' })

    expect(cell).toHaveStyleRule('outline', `2px solid ${colors.blue}`, { modifier: ':focus' })
    expect(cell).toHaveStyleRule('outline-offset', '2px', { modifier: ':focus' })
    expect(cell).toHaveStyleRule('border-radius', '6px', { modifier: ':focus' })
    expect(cell).toHaveStyleRule('outline', 'none', { modifier: ':focus:not(:focus-visible)' })
    expect(cell).toHaveStyleRule('outline', `2px solid ${colors.blue}`, { modifier: ':focus-visible' })
  })

  it('resets host button sizing constraints on grid cells', () => {
    const { getByRole } = renderSelector({ startDate, numDays: 1, minTime: 9, maxTime: 9 })
    const cell = getByRole('button', { name: 'Available Monday, January 1, 2018 at 9 am' })

    expect(cell).toHaveStyleRule('-webkit-appearance', 'none')
    expect(cell).toHaveStyleRule('align-self', 'stretch')
    expect(cell).toHaveStyleRule('width', 'auto')
    expect(cell).toHaveStyleRule('max-width', 'none')
    expect(cell).toHaveStyleRule('min-width', '0')
    expect(cell).toHaveStyleRule('max-height', 'none')
    expect(cell).toHaveStyleRule('min-height', '0')
  })

  it('allows CSS length strings for grid cell margins', () => {
    const { getByRole, getByText } = renderSelector({
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 9,
      margin: '0.25rem',
    })
    const cell = getByRole('button', { name: 'Available Monday, January 1, 2018 at 9 am' })
    const dateHeaderCell = getByText('MON').closest('[aria-hidden="true"]')

    expect(cell).toHaveStyleRule('margin', '0.25rem')
    expect(dateHeaderCell).toHaveStyleRule('margin', '0.25rem')
  })

  it('falls back from non-finite numeric grid cell margins', () => {
    const { getByRole, getByText } = renderSelector({
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 9,
      margin: Number.NaN,
    })
    const cell = getByRole('button', { name: 'Available Monday, January 1, 2018 at 9 am' })
    const dateHeaderCell = getByText('MON').closest('[aria-hidden="true"]')

    expect(cell).toHaveStyleRule('margin', '0px')
    expect(dateHeaderCell).toHaveStyleRule('margin', '0px')
  })

  it('falls back from malformed grid cell margins', () => {
    const throwingValue = {
      toString() {
        throw new Error('Unexpected margin coercion')
      },
    }
    const first = renderSelector({
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 9,
      margin: Symbol('gap'),
    })
    const second = renderSelector({
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 9,
      margin: throwingValue,
    })

    expect(
      within(first.container).getByRole('button', { name: 'Available Monday, January 1, 2018 at 9 am' }),
    ).toHaveStyleRule('margin', '0px')
    expect(
      within(second.container).getByRole('button', { name: 'Available Monday, January 1, 2018 at 9 am' }),
    ).toHaveStyleRule('margin', '0px')
  })

  it('limits touch-action suppression to interactive cells', () => {
    const { getByRole, getByText } = renderSelector({ startDate, numDays: 1, minTime: 9, maxTime: 9 })
    const cell = getByRole('button', { name: 'Available Monday, January 1, 2018 at 9 am' })
    const dateHeaderCell = getByText('MON').closest('[aria-hidden="true"]')

    expect(cell).toHaveStyleRule('touch-action', 'none')
    expect(dateHeaderCell).not.toHaveStyleRule('touch-action', 'none')
  })

  it('keeps selected cells visually selected on hover', () => {
    const selected = addHours(startOfDay(startDate), 9)
    const { getByRole } = renderSelector({
      selection: [selected],
      selectedColor: '#123456',
      hoveredColor: '#abcdef',
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 10,
    })
    const selectedContent = getByRole('button', { name: 'Selected Monday, January 1, 2018 at 9 am' }).firstChild
    const availableContent = getByRole('button', { name: 'Available Monday, January 1, 2018 at 10 am' }).firstChild

    expect(selectedContent).toHaveStyleRule('background-color', '#123456', { modifier: ':hover' })
    expect(availableContent).toHaveStyleRule('background-color', '#abcdef', { modifier: ':hover' })
  })

  it('falls back from malformed cell colors without coercing them', () => {
    const selected = addHours(startOfDay(startDate), 9)
    const blocked = addHours(startOfDay(startDate), 11)
    const throwingColor = {
      toString() {
        throw new Error('Unexpected color coercion')
      },
    }
    const { getByRole } = renderSelector({
      selection: [selected],
      blocked: [blocked],
      selectedColor: Symbol('selected'),
      unselectedColor: throwingColor,
      hoveredColor: Symbol('hovered'),
      blockedColor: throwingColor,
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 11,
    })
    const selectedContent = getByRole('button', { name: 'Selected Monday, January 1, 2018 at 9 am' }).firstChild
    const availableContent = getByRole('button', { name: 'Available Monday, January 1, 2018 at 10 am' }).firstChild
    const blockedContent = getByRole('button', { name: 'Blocked Monday, January 1, 2018 at 11 am' }).firstChild

    expect(selectedContent).toHaveStyleRule('background-color', colors.blue)
    expect(selectedContent).toHaveStyleRule('background-color', colors.blue, { modifier: ':hover' })
    expect(availableContent).toHaveStyleRule('background-color', colors.paleBlue)
    expect(availableContent).toHaveStyleRule('background-color', colors.lightBlue, { modifier: ':hover' })
    expect(blockedContent).toHaveStyleRule('background-color', colors.black)
    expect(blockedContent).toHaveStyleRule('background-color', colors.black, { modifier: ':hover' })
  })

  it('hides visual time labels from assistive technology', () => {
    const { getByText } = renderSelector({ startDate, numDays: 1, minTime: 9, maxTime: 9 })

    expect(getByText('9 am').closest('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('hides visual date headers from assistive technology', () => {
    const { getByText } = renderSelector({ startDate, numDays: 1, minTime: 9, maxTime: 9 })

    expect(getByText('MON').closest('[aria-hidden="true"]')).toBeInTheDocument()
    expect(getByText('1').closest('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('contains visual date header text within a single line', () => {
    const { getByText } = renderSelector({
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 9,
      dateFormat: 'MMMM d',
    })
    const dayLabel = getByText('MON')
    const dateLabel = getByText('January 1')
    const labels = [dayLabel, dateLabel]

    labels.forEach((label) => {
      expect(label).toHaveStyleRule('line-height', '1')
      expect(label).toHaveStyleRule('overflow', 'hidden')
      expect(label).toHaveStyleRule('text-overflow', 'ellipsis')
      expect(label).toHaveStyleRule('white-space', 'nowrap')
    })
    expect(dayLabel).toHaveStyleRule('height', '15px')
    expect(dateLabel).toHaveStyleRule('height', '20px')
    expect(dateLabel).toHaveStyleRule('height', '15px', { media: '(max-width: 699px)' })
  })

  it('labels cells with their state and time', () => {
    const selected = addHours(startOfDay(startDate), 9)
    const blocked = addHours(startOfDay(startDate), 10)
    const { getByRole } = renderSelector({
      selection: [selected],
      blocked: [blocked],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 11,
    })

    expect(getByRole('button', { name: 'Selected Monday, January 1, 2018 at 9 am' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(getByRole('button', { name: 'Blocked Monday, January 1, 2018 at 10 am' })).toBeDisabled()
    expect(getByRole('button', { name: 'Available Monday, January 1, 2018 at 11 am' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('treats blocked cells as unpressed when selection and blocked values overlap', () => {
    const blocked = addHours(startOfDay(startDate), 9)
    const { getByRole } = renderSelector({
      selection: [blocked],
      blocked: [blocked],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 9,
    })

    expect(getByRole('button', { name: 'Blocked Monday, January 1, 2018 at 9 am' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('normalizes date-like selection and blocked values', () => {
    const selected = addHours(startOfDay(startDate), 9)
    const blocked = addHours(startOfDay(startDate), 10)
    const { getByRole } = renderSelector({
      selection: [{ valueOf: () => selected.getTime() + 30000 }],
      blocked: [new Date(blocked.getTime() + 30000).toISOString()],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 10,
    })

    expect(getByRole('button', { name: 'Selected Monday, January 1, 2018 at 9 am' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(getByRole('button', { name: 'Blocked Monday, January 1, 2018 at 10 am' })).toBeDisabled()
  })

  it('ignores unsupported values instead of coercing them into dates', () => {
    const epoch = new Date(0)
    const { getByRole } = renderSelector({
      selection: [false, { valueOf: () => epoch.toISOString() }],
      blocked: [true, [0]],
      startDate: epoch,
      numDays: 1,
      minTime: 0,
      maxTime: 0,
    })

    const cell = getByRole('button', {
      name: `Available ${formatDate(startOfDay(epoch), 'EEEE, MMMM d, yyyy')} at 12 am`,
    })
    expect(cell).toHaveAttribute('aria-pressed', 'false')
    expect(cell).not.toBeDisabled()
  })

  it('ignores invalid selection and blocked values', async () => {
    const changeSpy = jest.fn()
    const selected = addHours(startOfDay(startDate), 9)
    const { getByRole } = renderSelector({
      onChange: changeSpy,
      selection: [new Date('invalid')],
      blocked: ['not-a-date'],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 9,
    })
    const cell = getByRole('button', { name: 'Available Monday, January 1, 2018 at 9 am' })

    expect(cell).toHaveAttribute('aria-pressed', 'false')

    clickCell(cell)

    await waitFor(() => {
      expect(changeSpy).toHaveBeenCalledWith([selected])
    })
  })

  it('ignores nullish props and malformed date-like values', () => {
    const throwingDateLike = {
      valueOf: () => {
        throw new Error('Invalid date-like value')
      },
    }
    const { getByRole } = renderSelector({
      selection: [null, void 0, throwingDateLike],
      blocked: null,
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 9,
    })

    expect(getByRole('button', { name: 'Available Monday, January 1, 2018 at 9 am' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })
})

describe('keyboard interaction', () => {
  it('toggles a focused cell with Enter', async () => {
    const changeSpy = jest.fn()
    const { container } = renderSelector({ onChange: changeSpy })
    const cell = container.querySelector('button.rgdp__grid-cell')

    fireEvent.keyDown(cell, { key: 'Enter' })

    await waitFor(() => {
      expect(changeSpy).toHaveBeenCalled()
    })
  })

  it('toggles a custom-rendered focused cell with Enter', async () => {
    const changeSpy = jest.fn()
    const selected = addHours(startOfDay(startDate), 9)
    const renderDateCell = (time) => <span data-testid={`custom-slot-${time.getHours()}`}>{time.getHours()}</span>
    const { getByTestId } = renderSelector({
      onChange: changeSpy,
      renderDateCell,
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 9,
    })
    const customContent = getByTestId('custom-slot-9')
    const cell = customContent.closest('button.rgdp__grid-cell')

    expect(cell).toHaveAttribute('aria-label', 'Available Monday, January 1, 2018 at 9 am')

    fireEvent.keyDown(cell, { key: 'Enter' })

    await waitFor(() => {
      expect(changeSpy).toHaveBeenCalledWith([selected])
    })
  })

  it('removes a selected focused cell with Space', async () => {
    const changeSpy = jest.fn()
    const selected = addHours(startOfDay(startDate), 9)
    const { getByRole } = renderSelector({
      onChange: changeSpy,
      selection: [selected],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 9,
    })
    const cell = getByRole('button', { name: 'Selected Monday, January 1, 2018 at 9 am' })
    const event = createEvent.keyDown(cell, { key: ' ' })

    fireEvent(cell, event)

    await waitFor(() => {
      expect(changeSpy).toHaveBeenCalledWith([])
    })
    expect(event.defaultPrevented).toBe(true)
  })

  it('toggles a focused cell with legacy Spacebar key values', async () => {
    const changeSpy = jest.fn()
    const selected = addHours(startOfDay(startDate), 9)
    const { getByRole } = renderSelector({
      onChange: changeSpy,
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 9,
    })
    const cell = getByRole('button', { name: 'Available Monday, January 1, 2018 at 9 am' })
    const event = createEvent.keyDown(cell, { key: 'Spacebar' })

    fireEvent(cell, event)

    await waitFor(() => {
      expect(changeSpy).toHaveBeenCalledWith([selected])
    })
    expect(event.defaultPrevented).toBe(true)
  })

  it('ignores non-action keys on focused cells', () => {
    const changeSpy = jest.fn()
    const { container } = renderSelector({ onChange: changeSpy })
    const cell = container.querySelector('button.rgdp__grid-cell')
    const preventDefault = jest.fn()

    fireEvent.keyDown(cell, { key: 'Escape', preventDefault })

    expect(changeSpy).not.toHaveBeenCalled()
    expect(preventDefault).not.toHaveBeenCalled()
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

  it('moves focus past blocked cells with arrow keys', () => {
    const blockedTuesday = addHours(addDays(startOfDay(startDate), 1), 9)
    const { getByRole } = renderSelector({
      blocked: [blockedTuesday],
      startDate,
      numDays: 3,
      minTime: 9,
      maxTime: 9,
    })
    const mondayNine = getByRole('button', { name: 'Available Monday, January 1, 2018 at 9 am' })
    const wednesdayNine = getByRole('button', { name: 'Available Wednesday, January 3, 2018 at 9 am' })

    mondayNine.focus()
    fireEvent.keyDown(mondayNine, { key: 'ArrowRight' })

    expect(wednesdayNine).toHaveFocus()
  })

  it('moves focus vertically past blocked cells with arrow keys', () => {
    const blockedTen = addHours(startOfDay(startDate), 10)
    const { getByRole } = renderSelector({
      blocked: [blockedTen],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 11,
    })
    const mondayNine = getByRole('button', { name: 'Available Monday, January 1, 2018 at 9 am' })
    const mondayEleven = getByRole('button', { name: 'Available Monday, January 1, 2018 at 11 am' })

    mondayNine.focus()
    fireEvent.keyDown(mondayNine, { key: 'ArrowDown' })

    expect(mondayEleven).toHaveFocus()
  })

  it('handles keyboard navigation events without callable default prevention', () => {
    const { getByRole, instance } = renderSelector({ startDate, numDays: 1, minTime: 9, maxTime: 10 })
    const mondayNine = getByRole('button', { name: 'Available Monday, January 1, 2018 at 9 am' })
    const mondayTen = getByRole('button', { name: 'Available Monday, January 1, 2018 at 10 am' })

    mondayNine.focus()

    expect(() => {
      instance.handleCellKeyDownEvent({ key: 'ArrowDown', preventDefault: true }, addHours(startOfDay(startDate), 9))
    }).not.toThrow()
    expect(mondayTen).toHaveFocus()
  })

  it('ignores keyboard events without key metadata', () => {
    const changeSpy = jest.fn()
    const { instance } = renderSelector({ onChange: changeSpy, startDate, numDays: 1, minTime: 9, maxTime: 9 })

    expect(() => {
      instance.handleCellKeyDownEvent(null, addHours(startOfDay(startDate), 9))
      instance.handleCellKeyDownEvent({ key: true }, addHours(startOfDay(startDate), 9))
    }).not.toThrow()
    expect(changeSpy).not.toHaveBeenCalled()
    expect(instance.state.selectionType).toBe(null)
  })

  it('ignores keyboard selection events for malformed times', () => {
    const changeSpy = jest.fn()
    const preventDefault = jest.fn()
    const { instance } = renderSelector({ onChange: changeSpy, startDate, numDays: 1, minTime: 9, maxTime: 9 })

    expect(() => {
      instance.handleCellKeyDownEvent({ key: 'Enter', preventDefault }, { getTime: true })
      instance.handleCellKeyDownEvent({ key: ' ', preventDefault }, new Date(NaN))
    }).not.toThrow()
    expect(preventDefault).not.toHaveBeenCalled()
    expect(changeSpy).not.toHaveBeenCalled()
    expect(instance.state.selectionType).toBe(null)
  })

  it('reports when an unblocked focus target is not registered', () => {
    const { instance } = renderSelector({ startDate, numDays: 1, minTime: 9, maxTime: 9 })

    expect(instance.focusDateCell(addHours(startOfDay(startDate), 10))).toBe(false)
  })

  it('reports when a focus target is not a valid Date object', () => {
    const { instance } = renderSelector({ startDate, numDays: 1, minTime: 9, maxTime: 9 })

    expect(instance.focusDateCell({ getTime: true })).toBe(false)
    expect(instance.focusDateCell(new Date(NaN))).toBe(false)
  })

  it('reports when a registered focus target cannot receive focus', () => {
    const time = addHours(startOfDay(startDate), 9)
    const { instance } = renderSelector({ startDate, numDays: 1, minTime: 9, maxTime: 9 })
    instance.dateToCell.set(time.getTime(), { focus: true })

    expect(instance.focusDateCell(time)).toBe(false)
  })

  it('reports when a blocked focus target is not focusable', () => {
    const blocked = addHours(startOfDay(startDate), 9)
    const { instance } = renderSelector({ blocked: [blocked], startDate, numDays: 1, minTime: 9, maxTime: 9 })

    expect(instance.focusDateCell(blocked)).toBe(false)
  })

  it('does not move focus outside the rendered grid with arrow keys', () => {
    const { getByRole } = renderSelector({ startDate, numDays: 1, minTime: 9, maxTime: 9 })
    const mondayNine = getByRole('button', { name: 'Available Monday, January 1, 2018 at 9 am' })

    mondayNine.focus()
    fireEvent.keyDown(mondayNine, { key: 'ArrowUp' })

    expect(mondayNine).toHaveFocus()
  })

  it('prevents page scrolling when arrow keys cannot move focus', () => {
    const { getByRole } = renderSelector({ startDate, numDays: 1, minTime: 9, maxTime: 9 })
    const mondayNine = getByRole('button', { name: 'Available Monday, January 1, 2018 at 9 am' })
    const event = createEvent.keyDown(mondayNine, { key: 'ArrowUp' })

    fireEvent(mondayNine, event)

    expect(event.defaultPrevented).toBe(true)
  })

  it('does not toggle blocked cells with Enter', () => {
    const changeSpy = jest.fn()
    const blocked = addHours(startOfDay(startDate), 9)
    const { getByRole } = renderSelector({
      onChange: changeSpy,
      blocked: [blocked],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 9,
    })
    const blockedCell = getByRole('button', { name: 'Blocked Monday, January 1, 2018 at 9 am' })

    fireEvent.keyDown(blockedCell, { key: 'Enter' })

    expect(changeSpy).not.toHaveBeenCalled()
  })
})

describe('preventScroll', () => {
  it('prevents the event default', () => {
    const event = {
      preventDefault: jest.fn(),
    }
    preventScroll(event)
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('ignores events without callable default prevention', () => {
    expect(() => {
      preventScroll(null)
      preventScroll({ preventDefault: true })
    }).not.toThrow()
  })
})
