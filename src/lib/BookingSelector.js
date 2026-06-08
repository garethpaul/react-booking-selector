// @flow
import * as React from 'react'
import styled from 'styled-components'

import { addHours, addDays, startOfDay, isValid, format as formatDate } from 'date-fns'

import { Text, Subtitle } from './typography'
import colors from './colors'
import selectionSchemes from './selection-schemes'

type DateValueType = Date | string | number | { valueOf: () => number } | null | void

type SelectionType = 'add' | 'remove'

type SelectionSchemeType = 'linear' | 'square'

type TouchSelectionEventType = {
  touches?: Array<{
    clientX: number,
    clientY: number
  }>
}

type KeyboardSelectionEventType = {
  key: string,
  preventDefault: () => void
}

type DateGridPropsType = {
  startDate?: Date,
  numDays: number,
  minTime: number,
  maxTime: number
}

const toCssUnit = (value: ?(number | string)): string => {
  if (value == null) return '0px'
  if (typeof value === 'number') return `${value}px`
  return /^-?\d+(\.\d+)?$/.test(value) ? `${value}px` : value
}

const toDate = (value: DateValueType): Date => {
  if (value == null) return new Date(NaN)

  try {
    return new Date(value.valueOf())
  } catch {
    return new Date(NaN)
  }
}

const normalizeDates = (dates: ?Array<DateValueType>): Array<Date> => (Array.isArray(dates) ? dates : [])
  .map(toDate)
  .filter(isValid)

const dateMinuteKey = (value: Date): number => Math.floor(value.getTime() / 60000)

const getDatesSignature = (dates: ?Array<DateValueType>): string => normalizeDates(dates).map(dateMinuteKey).join('|')

const getDateMinuteKeySet = (dates: ?Array<DateValueType>): Set<number> => new Set(normalizeDates(dates).map(dateMinuteKey))

const uniqueDatesByMinute = (dates: Array<Date>): Array<Date> => {
  const dateMinuteKeys = new Set()
  return dates.reduce((acc: Array<Date>, date): Array<Date> => {
    const key = dateMinuteKey(date)
    if (dateMinuteKeys.has(key)) return acc
    dateMinuteKeys.add(key)
    return [...acc, date]
  }, [])
}

const getStartDate = (startDate: ?Date): Date => (startDate && isValid(startDate) ? startDate : new Date())

const isWholeNumber = (value: number): boolean => Number.isFinite(value) && Math.floor(value) === value

const getVisibleHours = (minTime: number, maxTime: number): Array<number> => {
  if (!isWholeNumber(minTime) || !isWholeNumber(maxTime) || minTime < 0 || maxTime > 23 || minTime > maxTime) {
    return []
  }

  const hours = []
  for (let h = minTime; h <= maxTime; h += 1) {
    hours.push(h)
  }
  return hours
}

const buildDates = ({ startDate, numDays, minTime, maxTime }: DateGridPropsType): Array<Array<Date>> => {
  if (!isWholeNumber(numDays) || numDays <= 0) return []

  const startTime = startOfDay(getStartDate(startDate))
  const visibleHours = getVisibleHours(minTime, maxTime)
  if (visibleHours.length === 0) return []

  const dates = []
  for (let d = 0; d < numDays; d += 1) {
    const currentDay = []
    visibleHours.forEach(h => {
      currentDay.push(addHours(addDays(startTime, d), h))
    })
    dates.push(currentDay)
  }
  return dates
}

const formatHour = (hour: number): string => {
  const h = hour === 0 || hour === 12 || hour === 24 ? 12 : hour % 12
  const abb = hour < 12 || hour === 24 ? 'am' : 'pm'
  return `${h} ${abb}`
}

const formatCellLabel = (time: Date, selected: boolean, blocked: boolean): string => {
  const state = blocked ? 'Blocked' : selected ? 'Selected' : 'Available'
  return `${state} ${formatDate(time, 'EEEE, MMMM d, yyyy')} at ${formatHour(time.getHours())}`
}

const dateKey = (time: Date): number => time.getTime()

const TOUCH_MOUSE_SUPPRESSION_MS = 500

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  user-select: none;
`

const Grid = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 100%;
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  flex: 1 1 0;
  min-width: 0;
`

const TimeColumn = styled(Column)`
  flex: 0 0 52px;
  max-width: 52px;
  @media (max-width: 699px) {
    flex-basis: 32px;
    max-width: 32px;
  }
`

export const GridCell = styled.div`
  box-sizing: border-box;
  display: block;
  margin: ${props => toCssUnit(props.$margin)};
  height: ${props => toCssUnit(props.$height)};
  padding: 0;
  border: 0;
  appearance: none;
  background: transparent;
  color: inherit;
  font: inherit;
  opacity: 1;
  touch-action: none;
  &:focus {
    outline: none;
  }
  &:focus-visible {
    outline: 2px solid ${colors.blue};
    outline-offset: 2px;
    border-radius: 6px;
  }
`

// Style the Date Cell
const DateCell = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 4px;
  transition: background-color 120ms ease, transform 120ms ease;
  ${props => props.$selected && !props.$blocked && `background-color: ${props.$selectedColor};`}
  ${props => !props.$selected && !props.$blocked && `background-color: ${props.$unselectedColor};`}
  ${props => props.$blocked && `background-color: ${props.$blockedColor};`}
  &:hover {
    cursor: ${props => (props.$blocked ? 'not-allowed' : 'pointer')};
    background-color: ${props => (props.$blocked ? props.$blockedColor : props.$hoveredColor)};
  }
`

const DateLabel = styled(Subtitle)`
  height: 15px;
  font-size: 19px;
  margin: 0px;
  margin-top: 5px;
  padding: 0px;
  @media (max-width: 699px) {
    font-size: 12px;
  }
`

const DayLabel = styled(Subtitle)`
  height: 15px;
  font-size: 10px;
  margin: 0px;
  padding: 0px;
  @media (max-width: 699px) {
    font-size: 8px;
  }
`

const TimeLabelCell = styled.div`
  position: relative;
  width: 100%;
  height: 40px;
  padding-right: 15px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  color: rgb(112, 117, 122);
  @media (max-width: 699px) {
    padding-right: 6px;
  }
`

const TimeText = styled(Text)`
  margin: 0;
  font-size: 11px;
  @media (max-width: 699px) {
    font-size: 8px;
  }
  text-align: right;
  text-transform: uppercase;
`

type PropsType = {
  selection: Array<DateValueType>,
  blocked: Array<DateValueType>,
  selectionScheme: SelectionSchemeType,
  onChange: (Array<Date>) => void,
  startDate?: Date,
  numDays: number,
  minTime: number,
  maxTime: number,
  dateFormat: string,
  margin: number,
  unselectedColor: string,
  selectedColor: string,
  hoveredColor: string,
  blockedColor: string,
  renderDateCell?: (Date, boolean, boolean) => React.Node
}

type StateType = {
  // In the case that a user is drag-selecting, we don't want to call this.props.onChange() until they have completed
  // the drag-select. selectionDraft serves as a temporary copy during drag-selects.
  selectionDraft: Array<Date>,
  selectionBase: Array<Date>,
  selectionPropSignature: string,
  selectionType: ?SelectionType,
  selectionStart: ?Date,
  isTouchDragging: boolean
}

type DerivedStateType = {
  selectionDraft: Array<Date>,
  selectionBase: Array<Date>,
  selectionPropSignature: string
}

export const preventScroll = (e: TouchEvent) => {
  e.preventDefault()
}

export default class BookingSelector extends React.Component<PropsType, StateType> {
  dates: Array<Array<Date>>
  selectionSchemeHandlers: { [string]: (?Date, ?Date, Array<Array<Date>>) => Date[] }
  cellToDate: Map<HTMLElement, Date>
  dateToCell: Map<number, HTMLElement>
  gridRef: ?HTMLElement
  lastTouchEventTime: number
  blockedMinuteKeys: Set<number>
  selectedMinuteKeys: Set<number>

  static defaultProps = {
    selection: [],
    blocked: [],
    selectionScheme: 'square',
    numDays: 7,
    minTime: 9,
    maxTime: 23,
    dateFormat: 'd',
    margin: 3,
    selectedColor: colors.blue,
    unselectedColor: colors.paleBlue,
    hoveredColor: colors.lightBlue,
    blockedColor: colors.black,
    onChange: () => {}
  }

  constructor(props: PropsType) {
    super(props)

    this.dates = buildDates(props)
    this.cellToDate = new Map()
    this.dateToCell = new Map()
    this.lastTouchEventTime = 0

    const selectionDraft = normalizeDates(this.props.selection)
    const selectionPropSignature = getDatesSignature(this.props.selection)
    this.blockedMinuteKeys = getDateMinuteKeySet(this.props.blocked)
    this.selectedMinuteKeys = new Set(selectionDraft.map(dateMinuteKey))
    this.state = {
      selectionDraft,
      selectionBase: selectionDraft,
      // eslint-disable-next-line react/no-unused-state
      selectionPropSignature,
      selectionType: null,
      selectionStart: null,
      isTouchDragging: false
    }

    this.selectionSchemeHandlers = {
      linear: selectionSchemes.linear,
      square: selectionSchemes.square
    }

    this.endSelection = this.endSelection.bind(this)
    this.handleMouseDownEvent = this.handleMouseDownEvent.bind(this)
    this.handleMouseUpEvent = this.handleMouseUpEvent.bind(this)
    this.handleMouseEnterEvent = this.handleMouseEnterEvent.bind(this)
    this.handleTouchStartEvent = this.handleTouchStartEvent.bind(this)
    this.handleTouchMoveEvent = this.handleTouchMoveEvent.bind(this)
    this.handleTouchEndEvent = this.handleTouchEndEvent.bind(this)
    this.handleSelectionStartEvent = this.handleSelectionStartEvent.bind(this)
    this.handleDocumentMouseUpEvent = this.handleDocumentMouseUpEvent.bind(this)
    this.handleCellKeyDownEvent = this.handleCellKeyDownEvent.bind(this)
  }

  static getDerivedStateFromProps(props: PropsType, state: StateType): ?DerivedStateType {
    const selectionPropSignature = getDatesSignature(props.selection)
    if (selectionPropSignature === state.selectionPropSignature) return null

    const selectionDraft = normalizeDates(props.selection)
    return {
      selectionDraft,
      selectionBase: selectionDraft,
      selectionPropSignature
    }
  }

  componentDidMount() {
    // We need to add the endSelection event listener to the document itself in order
    // to catch the cases where the users ends their mouse-click somewhere besides
    // the date cells (in which case none of the DateCell's onMouseUp handlers would fire)
    //
    // This isn't necessary for touch events since the `touchend` event fires on
    // the element where the touch/drag started so it's always caught.
    document.addEventListener('mouseup', this.handleDocumentMouseUpEvent)
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.handleDocumentMouseUpEvent)
    this.cellToDate.forEach((value, dateCell) => {
      if (dateCell && dateCell.removeEventListener) {
        dateCell.removeEventListener('touchmove', preventScroll)
      }
    })
    this.cellToDate.clear()
    this.dateToCell.clear()
  }

  registerDateCell(dateCell: HTMLElement, time: Date) {
    const previousTime = this.cellToDate.get(dateCell)
    if (!this.cellToDate.has(dateCell)) {
      dateCell.addEventListener('touchmove', preventScroll, { passive: false })
    } else if (previousTime) {
      this.dateToCell.delete(dateKey(previousTime))
    }
    this.cellToDate.set(dateCell, time)
    this.dateToCell.set(dateKey(time), dateCell)
  }

  unregisterDateCell(dateCell: HTMLElement) {
    const time = this.cellToDate.get(dateCell)
    if (!this.cellToDate.has(dateCell)) return
    dateCell.removeEventListener('touchmove', preventScroll)
    this.cellToDate.delete(dateCell)
    if (time) this.dateToCell.delete(dateKey(time))
  }

  isBlocked(time: Date): boolean {
    return this.blockedMinuteKeys.has(dateMinuteKey(time))
  }

  isSelected(time: Date): boolean {
    return this.selectedMinuteKeys.has(dateMinuteKey(time))
  }

  getDateCellFromEventTarget(target: mixed): ?HTMLElement {
    if (!(target instanceof Node)) return null

    let targetElement = target instanceof HTMLElement ? target : target.parentElement
    while (targetElement) {
      if (this.cellToDate.has(targetElement)) return targetElement
      if (targetElement === this.gridRef) return null
      targetElement = targetElement.parentElement
    }
    return null
  }

  handleDocumentMouseUpEvent(event: MouseEvent) {
    if (this.state.selectionType === null) return
    if (this.getDateCellFromEventTarget(event.target)) return
    if (this.state.selectionDraft === this.state.selectionBase) {
      this.updateAvailabilityDraft(this.state.selectionStart, this.endSelection)
      return
    }
    this.endSelection()
  }

  // Performs a lookup into this.cellToDate to retrieve the Date that corresponds to
  // the cell where this touch event is right now. Note that this method will only work
  // if the event is a `touchmove` event since it's the only one that has a `touches` list.
  getTimeFromTouchEvent(event: TouchSelectionEventType): ?Date {
    const { touches } = event
    if (!touches || touches.length === 0) return null
    const { clientX, clientY } = touches[0]
    let targetElement = document.elementFromPoint(clientX, clientY)
    while (targetElement) {
      const cellTime = this.cellToDate.get(targetElement)
      if (cellTime) return cellTime
      if (targetElement === this.gridRef) return null
      targetElement = targetElement.parentElement
    }
    return null
  }

  endSelection() {
    if (this.state.selectionType !== null) {
      this.props.onChange(normalizeDates(this.state.selectionDraft))
    }
    this.setState({
      selectionType: null,
      selectionStart: null
    })
  }

  // Given an ending Date, determines all the dates that should be selected in this draft
  updateAvailabilityDraft(selectionEnd: ?Date, callback?: () => void) {
    const { selectionType, selectionStart } = this.state

    if (selectionType === null || selectionStart === null) return

    const selectionSchemeHandler =
      this.selectionSchemeHandlers[this.props.selectionScheme] || this.selectionSchemeHandlers.square
    const availableSelection = selectionSchemeHandler(selectionStart, selectionEnd, this.dates).filter(
      time => !this.isBlocked(time)
    )
    let nextDraft = uniqueDatesByMinute(this.state.selectionBase.filter(time => !this.isBlocked(time)))
    if (selectionType === 'add') {
      nextDraft = uniqueDatesByMinute([...nextDraft, ...availableSelection])
    } else {
      const availableSelectionKeys = new Set(availableSelection.map(dateMinuteKey))
      nextDraft = nextDraft.filter(date => !availableSelectionKeys.has(dateMinuteKey(date)))
    }
    this.setState({ selectionDraft: nextDraft }, callback)
  }

  // Isomorphic (mouse and touch) handler since starting a selection works the same way for both classes of user input
  handleSelectionStartEvent(startTime: Date) {
    if (this.isBlocked(startTime)) return

    // Check if the startTime cell is selected/unselected to determine if this drag-select should
    // add values or remove values
    const timeSelected = this.isSelected(startTime)
    this.setState({
      selectionType: timeSelected ? 'remove' : 'add',
      selectionStart: startTime,
      selectionBase: this.state.selectionDraft
    })
  }

  recordTouchEvent() {
    this.lastTouchEventTime = Date.now()
  }

  shouldIgnoreMouseEvent(): boolean {
    return this.lastTouchEventTime > 0 && Date.now() - this.lastTouchEventTime < TOUCH_MOUSE_SUPPRESSION_MS
  }

  handleMouseDownEvent(time: Date) {
    if (this.shouldIgnoreMouseEvent()) return
    this.handleSelectionStartEvent(time)
  }

  handleMouseEnterEvent(time: Date) {
    if (this.shouldIgnoreMouseEvent()) return

    // Need to update selection draft on mouseup as well in order to catch the cases
    // where the user just clicks on a single cell (because no mouseenter events fire
    // in this scenario)
    this.updateAvailabilityDraft(time)
  }

  handleMouseUpEvent(time: Date) {
    if (this.shouldIgnoreMouseEvent()) return
    this.updateAvailabilityDraft(time, this.endSelection)
  }

  getKeyboardNavigationTarget(time: Date, key: string): ?Date {
    if (key === 'ArrowRight') return addDays(time, 1)
    if (key === 'ArrowLeft') return addDays(time, -1)
    if (key === 'ArrowDown') return addHours(time, 1)
    if (key === 'ArrowUp') return addHours(time, -1)
    return null
  }

  focusDateCell(time: Date): boolean {
    if (this.isBlocked(time)) return false
    const dateCell = this.dateToCell.get(dateKey(time))
    if (!dateCell) return false
    dateCell.focus()
    return true
  }

  handleCellKeyDownEvent(event: KeyboardSelectionEventType, time: Date, blocked: boolean) {
    const navigationTarget = this.getKeyboardNavigationTarget(time, event.key)
    if (navigationTarget) {
      event.preventDefault()
      this.focusDateCell(navigationTarget)
      return
    }

    if (blocked || (event.key !== 'Enter' && event.key !== ' ')) return
    event.preventDefault()
    const timeSelected = this.isSelected(time)
    this.setState(
      {
        selectionType: timeSelected ? 'remove' : 'add',
        selectionStart: time,
        selectionBase: this.state.selectionDraft
      },
      () => {
        this.updateAvailabilityDraft(time, this.endSelection)
      }
    )
  }

  handleTouchStartEvent(startTime: Date) {
    this.recordTouchEvent()
    this.handleSelectionStartEvent(startTime)
  }

  handleTouchMoveEvent(event: TouchSelectionEventType) {
    this.recordTouchEvent()
    this.setState({ isTouchDragging: true })
    const cellTime = this.getTimeFromTouchEvent(event)
    if (cellTime) {
      this.updateAvailabilityDraft(cellTime)
    }
  }

  handleTouchEndEvent() {
    this.recordTouchEvent()
    if (!this.state.isTouchDragging) {
      // Going down this branch means the user tapped but didn't drag -- which
      // means the availability draft hasn't yet been updated (since
      // handleTouchMoveEvent was never called) so we need to do it now
      this.updateAvailabilityDraft(null, () => {
        this.endSelection()
      })
    } else if (this.state.selectionDraft === this.state.selectionBase) {
      this.updateAvailabilityDraft(this.state.selectionStart, this.endSelection)
    } else {
      this.endSelection()
    }
    this.setState({ isTouchDragging: false })
  }

  renderTimeLabels = (): React.Element<*> => {
    const labels = [<GridCell $height="40" key={-1} />] // Ensures time labels start at correct location
    getVisibleHours(this.props.minTime, this.props.maxTime).forEach(t => {
      labels.push(
        <TimeLabelCell key={t}>
          <TimeText>{formatHour(t)}</TimeText>
        </TimeLabelCell>
      )
    })
    return <TimeColumn aria-hidden="true">{labels}</TimeColumn>
  }

  renderDateColumn = (dayOfTimes: Array<Date>) => (
    <Column key={dayOfTimes[0].toISOString()}>
      <GridCell $height="50" $margin={this.props.margin}>
        <DayLabel>{formatDate(dayOfTimes[0], 'EEE').toUpperCase()}</DayLabel>
        <DateLabel>{formatDate(dayOfTimes[0], this.props.dateFormat)}</DateLabel>
      </GridCell>
      {dayOfTimes.map(time => this.renderDateCellWrapper(time))}
    </Column>
  )

  renderDateCellWrapper = (time: Date): React.Element<*> => {
    const blocked = this.isBlocked(time)
    const selected = !blocked && this.isSelected(time)
    const mouseStartHandler = () => {
      if (!blocked) this.handleMouseDownEvent(time)
    }
    const touchStartHandler = () => {
      if (!blocked) this.handleTouchStartEvent(time)
    }
    let currentDateCell: ?HTMLElement = null
    const refSetter = (dateCell: ?HTMLElement) => {
      if (currentDateCell && currentDateCell !== dateCell) {
        this.unregisterDateCell(currentDateCell)
      }
      if (dateCell) {
        this.registerDateCell(dateCell, time)
      }
      currentDateCell = dateCell
    }

    return (
      <GridCell
        as="button"
        className="rgdp__grid-cell"
        role="button"
        type="button"
        disabled={blocked}
        aria-disabled={blocked}
        aria-label={formatCellLabel(time, selected, blocked)}
        aria-pressed={selected}
        tabIndex={blocked ? -1 : 0}
        $height="40px"
        $margin={this.props.margin}
        key={time.toISOString()}
        ref={refSetter}
        // Mouse handlers
        onMouseDown={mouseStartHandler}
        onMouseEnter={() => {
          this.handleMouseEnterEvent(time)
        }}
        onMouseUp={() => {
          this.handleMouseUpEvent(time)
        }}
        // Touch handlers
        // Since touch events fire on the event where the touch-drag started, there's no point in passing
        // in the time parameter, instead these handlers will do their job using the default SyntheticEvent
        // parameters
        onTouchStart={touchStartHandler}
        onTouchMove={this.handleTouchMoveEvent}
        onTouchEnd={this.handleTouchEndEvent}
        onKeyDown={event => {
          this.handleCellKeyDownEvent(event, time, blocked)
        }}
      >
        {this.renderDateCell(time, selected, blocked)}
      </GridCell>
    )
  }

  renderDateCell = (time: Date, selected: boolean, blocked: boolean): React.Node => {
    if (this.props.renderDateCell) {
      return this.props.renderDateCell(time, selected, blocked)
    }

    return (
      <DateCell
        $blocked={blocked}
        $selected={selected}
        $selectedColor={this.props.selectedColor}
        $unselectedColor={this.props.unselectedColor}
        $hoveredColor={this.props.hoveredColor}
        $blockedColor={this.props.blockedColor}
      />
    )
  }

  render(): React.Element<*> {
    this.blockedMinuteKeys = getDateMinuteKeySet(this.props.blocked)
    this.selectedMinuteKeys = new Set(this.state.selectionDraft.map(dateMinuteKey))
    this.dates = buildDates(this.props)

    return (
      <Wrapper>
        {
          <Grid
            role="group"
            aria-label="Booking time slots"
            ref={el => {
              this.gridRef = el
            }}
          >
            {this.renderTimeLabels()}
            {this.dates.map(this.renderDateColumn)}
          </Grid>
        }
      </Wrapper>
    )
  }
}
