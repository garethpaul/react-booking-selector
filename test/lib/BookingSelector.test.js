import React, { act } from 'react'
import { addDays, addHours, startOfDay } from 'date-fns'
import { createEvent, fireEvent, render, waitFor } from '@testing-library/react'

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

  expect(instance.getTimeFromTouchEvent({ touches: [] })).toBe(null)
  expect(instance.getTimeFromTouchEvent({})).toBe(null)
  expect(document.elementFromPoint).not.toHaveBeenCalled()
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
  })

  setStateSpy.mockRestore()
})

it('endSelection does not call onChange when no selection is active', () => {
  const changeSpy = jest.fn()
  const { instance } = renderSelector({ onChange: changeSpy })

  act(() => {
    instance.endSelection()
  })

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

  it('removes stale date lookup entries when a mounted cell has no previous time', () => {
    const { instance } = renderSelector()
    const cell = document.createElement('div')
    const addSpy = jest.spyOn(cell, 'addEventListener')
    const staleTime = addHours(startOfDay(startDate), 8)
    const nextTime = addHours(startOfDay(startDate), 9)
    instance.cellToDate.set(cell, null)
    instance.dateToCell.set(staleTime.getTime(), cell)

    instance.registerDateCell(cell, nextTime)

    expect(addSpy).not.toHaveBeenCalled()
    expect(instance.dateToCell.has(staleTime.getTime())).toBe(false)
    expect(instance.dateToCell.get(nextTime.getTime())).toBe(cell)
    addSpy.mockRestore()
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

  it('unregisters cells even when no previous time is tracked', () => {
    const { instance } = renderSelector()
    const cell = document.createElement('div')
    const removeSpy = jest.spyOn(cell, 'removeEventListener')
    const staleTime = addHours(startOfDay(startDate), 8)
    instance.cellToDate.set(cell, null)
    instance.dateToCell.set(staleTime.getTime(), cell)

    instance.unregisterDateCell(cell)

    expect(removeSpy).toHaveBeenCalledWith('touchmove', preventScroll)
    expect(instance.cellToDate.has(cell)).toBe(false)
    expect(instance.dateToCell.has(staleTime.getTime())).toBe(false)
    removeSpy.mockRestore()
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

  it('clones selection dates from props', () => {
    const selected = addHours(startOfDay(startDate), 9)
    const rendered = renderSelector({ selection: [selected], startDate, numDays: 1, minTime: 9, maxTime: 9 })

    selected.setHours(10)

    expect(rendered.instance.state.selectionDraft).toEqual([addHours(startOfDay(startDate), 9)])
  })

  it('detects selection prop updates when the array is mutated in place', () => {
    const selection = []
    const rendered = renderSelector({ selection })

    selection.push(startDate)
    rendered.rerenderWithProps({ selection })

    expect(rendered.instance.state.selectionDraft).toEqual([startDate])
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

  it('renders no date cells when the time range has no slots', () => {
    const rendered = renderSelector({ startDate, numDays: 2, minTime: 10, maxTime: 9 })

    expect(rendered.instance.dates).toEqual([])
    expect(rendered.container.querySelectorAll('button.rgdp__grid-cell')).toHaveLength(0)
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

  it('does not call pointer start handlers for blocked cell wrappers', () => {
    const blocked = addHours(startOfDay(startDate), 9)
    const { instance } = renderSelector({
      blocked: [blocked],
      startDate,
      numDays: 1,
      minTime: 9,
      maxTime: 9,
    })
    const mouseSpy = jest.spyOn(instance, 'handleMouseDownEvent')
    const touchSpy = jest.spyOn(instance, 'handleTouchStartEvent')
    const blockedCellWrapper = instance.renderDateCellWrapper(blocked)

    blockedCellWrapper.props.onMouseDown()
    blockedCellWrapper.props.onTouchStart()

    expect(mouseSpy).not.toHaveBeenCalled()
    expect(touchSpy).not.toHaveBeenCalled()
    mouseSpy.mockRestore()
    touchSpy.mockRestore()
  })
})

describe('cell accessibility', () => {
  it('labels the slot group', () => {
    const { getByRole } = renderSelector({ startDate, numDays: 1, minTime: 9, maxTime: 9 })

    expect(getByRole('group', { name: 'Booking time slots' })).toBeInTheDocument()
  })

  it('renders cells as native buttons', () => {
    const { getByRole } = renderSelector({ startDate, numDays: 1, minTime: 9, maxTime: 9 })

    expect(getByRole('button', { name: 'Available Monday, January 1, 2018 at 9 am' }).tagName).toBe('BUTTON')
  })

  it('resets host button sizing constraints on grid cells', () => {
    const { getByRole } = renderSelector({ startDate, numDays: 1, minTime: 9, maxTime: 9 })
    const cell = getByRole('button', { name: 'Available Monday, January 1, 2018 at 9 am' })

    expect(cell).toHaveStyleRule('align-self', 'stretch')
    expect(cell).toHaveStyleRule('width', 'auto')
    expect(cell).toHaveStyleRule('max-width', 'none')
    expect(cell).toHaveStyleRule('min-width', '0')
    expect(cell).toHaveStyleRule('max-height', 'none')
    expect(cell).toHaveStyleRule('min-height', '0')
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

    const cell = getByRole('button', { name: 'Available Thursday, January 1, 1970 at 12 am' })
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

  it('does not move focus outside the rendered grid with arrow keys', () => {
    const { getByRole } = renderSelector({ startDate, numDays: 1, minTime: 9, maxTime: 9 })
    const mondayNine = getByRole('button', { name: 'Available Monday, January 1, 2018 at 9 am' })

    mondayNine.focus()
    fireEvent.keyDown(mondayNine, { key: 'ArrowUp' })

    expect(mondayNine).toHaveFocus()
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
})
