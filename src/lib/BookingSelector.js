// @flow
import * as React from 'react'

import { addDays } from 'date-fns/addDays'
import { format as formatDate } from 'date-fns/format'
import { startOfDay } from 'date-fns/startOfDay'

import styled from './styled.js'
import { Text, Subtitle } from './typography.js'
import colors from './colors.js'
import { getDateTimestamp as readDateTimestamp, hasDateObjectTag } from './date-utils.js'
import selectionSchemes from './selection-schemes/index.js'

type DateValueType = Date | string | number | { valueOf: () => number } | null | void

type DateListType = ?Array<DateValueType>

type SelectionType = 'add' | 'remove'

type SelectionSchemeType = 'linear' | 'square'

type StyleType = { [string]: string | number | null | void }

type TouchSelectionEventType = {
  touches?: Array<{
    clientX: number,
    clientY: number,
  }>,
}

type MouseSelectionEventType = {
  button?: number,
}

type KeyboardSelectionEventType = {
  key?: mixed,
  preventDefault?: mixed,
}

type PreventableEventType = {
  preventDefault?: mixed,
}

type BrowserDocumentType = {
  addEventListener?: mixed,
  removeEventListener?: mixed,
  elementFromPoint?: mixed,
}

type DateGridPropsType = {
  startDate?: Date,
  numDays: number,
  minTime: number,
  maxTime: number,
}

type DateSlotType = {
  hour: number,
  time: ?Date,
}

type DateColumnType = {
  day: Date,
  slots: Array<DateSlotType>,
}

type DateSlotPositionType = {
  columnIndex: number,
  slotIndex: number,
}

type CreateLocalTimeType = (Date, number) => mixed

const DEFAULT_DATE_FORMAT = 'd'
const DEFAULT_ARIA_LABEL = 'Booking time slots'

const isSelectionType = (value: mixed): boolean => value === 'add' || value === 'remove'

const getSelectionScheme = (selectionScheme: mixed): SelectionSchemeType =>
  selectionScheme === 'linear' || selectionScheme === 'square' ? selectionScheme : 'square'

const toCssUnit = (value: ?(number | string)): string => {
  if (value == null) return '0px'
  if (typeof value === 'number' && !Number.isFinite(value)) return '0px'
  if (typeof value === 'number') return `${value}px`
  if (typeof value !== 'string') return '0px'
  const cssValue = value.trim()
  if (!cssValue) return '0px'
  return /^-?\d+(\.\d+)?$/.test(cssValue) ? `${cssValue}px` : cssValue
}

const toCssColor = (value: mixed, fallback: string): string => {
  if (typeof value !== 'string') return fallback
  const colorValue = value.trim()
  return colorValue || fallback
}

const getNonEmptyString = (value: mixed): ?string => {
  if (typeof value !== 'string') return undefined
  const trimmedValue = value.trim()
  return trimmedValue ? trimmedValue : undefined
}

const invalidDate = (): Date => new Date(NaN)

const dateGetTime = Date.prototype.getTime
const dateGetFullYear = Date.prototype.getFullYear
const dateGetMonth = Date.prototype.getMonth
const dateGetDate = Date.prototype.getDate
const dateGetHours = Date.prototype.getHours

const getDateTimestamp = (value: mixed): ?number => {
  const timestamp = readDateTimestamp(value)
  return Number.isFinite(timestamp) ? timestamp : null
}

const toDate = (value: DateValueType): Date => {
  if (value == null) return invalidDate()
  if (hasDateObjectTag(value)) {
    const timestamp = getDateTimestamp(value)
    return timestamp == null ? invalidDate() : new Date(timestamp)
  }
  if (typeof value === 'string' || typeof value === 'number') return new Date(value)
  if (typeof value !== 'object') return invalidDate()

  try {
    const primitiveValue = value.valueOf()
    return typeof primitiveValue === 'number' ? new Date(primitiveValue) : invalidDate()
  } catch {
    return invalidDate()
  }
}

const normalizeDates = (dates: DateListType): Array<Date> =>
  (Array.isArray(dates) ? dates : []).map(toDate).filter((date) => getDateTimestamp(date) != null)

const dateMinuteKey = (value: Date): number => Math.floor(dateGetTime.call(value) / 60000)

const getValidDate = (value: mixed): ?Date => (getDateTimestamp(value) == null ? null : (value: any))

const getDateMinuteKey = (value: mixed): ?number => {
  const validDate = getValidDate(value)
  return validDate ? dateMinuteKey(validDate) : null
}

const hasDateMinuteKey = (dateMinuteKeys: Set<number>, time: mixed): boolean => {
  const key = getDateMinuteKey(time)
  return key != null && dateMinuteKeys.has(key)
}

const getDateMinuteSetSignature = (dates: DateListType): string =>
  Array.from(new Set(normalizeDates(dates).map(dateMinuteKey)))
    .sort((a, b) => a - b)
    .join('|')

const getDateMinuteKeySet = (dates: DateListType): Set<number> => new Set(normalizeDates(dates).map(dateMinuteKey))

const uniqueDatesByMinute = (dates: Array<Date>): Array<Date> => {
  const dateMinuteKeys = new Set()
  const uniqueDates: Array<Date> = []

  dates.forEach((date) => {
    const key = dateMinuteKey(date)
    if (dateMinuteKeys.has(key)) return
    dateMinuteKeys.add(key)
    uniqueDates.push(date)
  })

  return uniqueDates
}

const normalizeSelectionDraft = (dates: DateListType): Array<Date> => uniqueDatesByMinute(normalizeDates(dates))

const getDateListSignature = (dates: DateListType): string => normalizeSelectionDraft(dates).map(dateKey).join('|')

const getStartDate = (startDate: ?Date): Date => {
  const timestamp = getDateTimestamp(startDate)
  return timestamp == null ? new Date() : new Date(timestamp)
}

const getNumberSignaturePart = (value: mixed): string =>
  typeof value === 'number' ? `number:${value}` : `invalid:${typeof value}`

const getDateGridSignature = ({ startDate, numDays, minTime, maxTime }: DateGridPropsType): string =>
  [
    dateMinuteKey(startOfDay(getStartDate(startDate))),
    getNumberSignaturePart(numDays),
    getNumberSignaturePart(minTime),
    getNumberSignaturePart(maxTime),
  ].join('|')

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

const createLocalTime = (day: Date, hour: number): Date =>
  new Date(dateGetFullYear.call(day), dateGetMonth.call(day), dateGetDate.call(day), hour, 0, 0, 0)

const localTimeExists = (day: Date, hour: number, time: Date): boolean =>
  dateGetFullYear.call(time) === dateGetFullYear.call(day) &&
  dateGetMonth.call(time) === dateGetMonth.call(day) &&
  dateGetDate.call(time) === dateGetDate.call(day) &&
  dateGetHours.call(time) === hour

const createDateSlotTime = (day: Date, hour: number, createTime: CreateLocalTimeType): ?Date => {
  try {
    const time = createTime(day, hour)
    const timestamp = getDateTimestamp(time)
    if (timestamp == null) return null
    const slotTime = new Date(timestamp)
    return localTimeExists(day, hour, slotTime) ? slotTime : null
  } catch {
    return null
  }
}

export const buildDateColumns = (
  { startDate, numDays, minTime, maxTime }: DateGridPropsType,
  createTime: CreateLocalTimeType = createLocalTime,
): Array<DateColumnType> => {
  if (!isWholeNumber(numDays) || numDays <= 0) return []

  const startTime = startOfDay(getStartDate(startDate))
  const visibleHours = getVisibleHours(minTime, maxTime)
  if (visibleHours.length === 0) return []

  const dateColumns = []
  for (let d = 0; d < numDays; d += 1) {
    const day = addDays(startTime, d)
    const slots = []
    visibleHours.forEach((h) => {
      slots.push({
        hour: h,
        time: createDateSlotTime(day, h, createTime),
      })
    })
    dateColumns.push({ day, slots })
  }
  return dateColumns
}

export const buildDates = (
  dateGridProps: DateGridPropsType,
  createTime: CreateLocalTimeType = createLocalTime,
): Array<Array<Date>> => {
  const dates = []
  buildDateColumns(dateGridProps, createTime).forEach((dateColumn) => {
    const columnDates = []
    dateColumn.slots.forEach((slot) => {
      if (slot.time) columnDates.push(slot.time)
    })
    dates.push(columnDates)
  })
  return dates
}

const formatHour = (hour: number): string => {
  const h = hour === 0 || hour === 12 || hour === 24 ? 12 : hour % 12
  const abb = hour < 12 || hour === 24 ? 'am' : 'pm'
  return `${h} ${abb}`
}

const formatCellLabel = (time: Date, selected: boolean, blocked: boolean): string => {
  const state = blocked ? 'Blocked' : selected ? 'Selected' : 'Available'
  return `${state} ${formatDate(time, 'EEEE, MMMM d, yyyy')} at ${formatHour(dateGetHours.call(time))}`
}

const formatDateHeader = (time: Date, dateFormat: string): string => {
  try {
    return formatDate(time, dateFormat)
  } catch {
    return formatDate(time, DEFAULT_DATE_FORMAT)
  }
}

const getDateColumnSlots = (dateColumn: ?DateColumnType): Array<DateSlotType> =>
  dateColumn && Array.isArray(dateColumn.slots) ? dateColumn.slots : []

const getDateSlotTime = (dateSlot: ?DateSlotType): ?Date => (dateSlot ? getValidDate(dateSlot.time) : null)

const findDateSlotPosition = (dateColumns: Array<DateColumnType>, time: Date): ?DateSlotPositionType => {
  const targetKey = getDateKey(time)
  if (targetKey == null) return null

  for (let columnIndex = 0; columnIndex < dateColumns.length; columnIndex += 1) {
    const dateColumn = dateColumns[columnIndex]
    const slots = getDateColumnSlots(dateColumn)
    for (let slotIndex = 0; slotIndex < slots.length; slotIndex += 1) {
      const slotTime = getDateSlotTime(slots[slotIndex])
      if (slotTime && dateKey(slotTime) === targetKey) return { columnIndex, slotIndex }
    }
  }
  return null
}

const getHorizontalKeyboardNavigationTarget = (
  dateColumns: Array<DateColumnType>,
  position: DateSlotPositionType,
  direction: -1 | 1,
  blockedMinuteKeys: Set<number>,
): ?Date => {
  for (
    let targetColumnIndex = position.columnIndex + direction;
    targetColumnIndex >= 0 && targetColumnIndex < dateColumns.length;
    targetColumnIndex += direction
  ) {
    const targetColumn = dateColumns[targetColumnIndex]
    const targetTime = getDateSlotTime(getDateColumnSlots(targetColumn)[position.slotIndex])
    if (targetTime && !hasDateMinuteKey(blockedMinuteKeys, targetTime)) return targetTime
  }
  return null
}

const getVerticalKeyboardNavigationTarget = (
  dateColumn: ?DateColumnType,
  slotIndex: number,
  direction: -1 | 1,
  blockedMinuteKeys: Set<number>,
): ?Date => {
  const slots = getDateColumnSlots(dateColumn)
  for (let nextSlotIndex = slotIndex + direction; nextSlotIndex >= 0; nextSlotIndex += direction) {
    if (nextSlotIndex >= slots.length) return null
    const nextTime = getDateSlotTime(slots[nextSlotIndex])
    if (nextTime && !hasDateMinuteKey(blockedMinuteKeys, nextTime)) return nextTime
  }
  return null
}

export const getKeyboardNavigationTarget = (
  dateColumns: Array<DateColumnType>,
  time: Date,
  key: string,
  blockedMinuteKeys: Set<number> = new Set(),
): ?Date => {
  const position = findDateSlotPosition(dateColumns, time)
  if (!position) return null

  if (key === 'ArrowRight' || key === 'ArrowLeft') {
    return getHorizontalKeyboardNavigationTarget(
      dateColumns,
      position,
      key === 'ArrowRight' ? 1 : -1,
      blockedMinuteKeys,
    )
  }

  if (key === 'ArrowDown') {
    return getVerticalKeyboardNavigationTarget(
      dateColumns[position.columnIndex],
      position.slotIndex,
      1,
      blockedMinuteKeys,
    )
  }
  if (key === 'ArrowUp') {
    return getVerticalKeyboardNavigationTarget(
      dateColumns[position.columnIndex],
      position.slotIndex,
      -1,
      blockedMinuteKeys,
    )
  }
  return null
}

const isKeyboardNavigationKey = (key: string): boolean =>
  key === 'ArrowRight' || key === 'ArrowLeft' || key === 'ArrowDown' || key === 'ArrowUp'

const isKeyboardSelectionKey = (key: string): boolean => key === 'Enter' || key === ' ' || key === 'Spacebar'

const isPrimaryMouseButton = (event?: MouseSelectionEventType): boolean =>
  !event || event.button == null || event.button === 0

const dateKey = (time: Date): number => dateGetTime.call(time)

const getDateKey = (time: mixed): ?number => {
  const validDate = getValidDate(time)
  return validDate ? dateKey(validDate) : null
}

const TOUCH_MOUSE_SUPPRESSION_MS = 500

const Wrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  user-select: none;
`

const Grid = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 100%;
  min-width: 0;
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
  align-self: stretch;
  width: auto;
  max-width: none;
  min-width: 0;
  max-height: none;
  min-height: 0;
  margin: ${(props) => toCssUnit(props.$margin)};
  height: ${(props) => toCssUnit(props.$height)};
  padding: 0;
  border: 0;
  appearance: none;
  -webkit-appearance: none;
  background: transparent;
  color: inherit;
  ${(props) => props.$interactive && `cursor: ${props.$blocked ? 'not-allowed' : 'pointer'};`}
  font: inherit;
  opacity: 1;
  ${(props) => props.$touchActionEnabled && 'touch-action: none;'}
  &:focus {
    outline: 2px solid ${colors.blue};
    outline-offset: 2px;
    border-radius: 6px;
  }
  &:focus:not(:focus-visible) {
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
  transition:
    background-color 120ms ease,
    transform 120ms ease;
  ${(props) =>
    props.$selected && !props.$blocked && `background-color: ${toCssColor(props.$selectedColor, colors.blue)};`}
  ${(props) =>
    !props.$selected && !props.$blocked && `background-color: ${toCssColor(props.$unselectedColor, colors.paleBlue)};`}
  ${(props) => props.$blocked && `background-color: ${toCssColor(props.$blockedColor, colors.black)};`}
  &:hover {
    background-color: ${(props) =>
      props.$blocked
        ? toCssColor(props.$blockedColor, colors.black)
        : props.$selected
          ? toCssColor(props.$selectedColor, colors.blue)
          : toCssColor(props.$hoveredColor, colors.lightBlue)};
  }
`

const DateLabel = styled(Subtitle)`
  height: 20px;
  font-size: 19px;
  line-height: 1;
  margin: 0px;
  margin-top: 5px;
  padding: 0px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  @media (max-width: 699px) {
    height: 15px;
    font-size: 12px;
  }
`

const DayLabel = styled(Subtitle)`
  height: 15px;
  font-size: 10px;
  line-height: 1;
  margin: 0px;
  padding: 0px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  @media (max-width: 699px) {
    font-size: 8px;
  }
`

const TimeLabelCell = styled.div`
  position: relative;
  box-sizing: border-box;
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
  className?: string,
  id?: string,
  selection: DateListType,
  blocked: DateListType,
  selectionScheme: SelectionSchemeType,
  onChange: (Array<Date>) => void,
  startDate?: Date,
  numDays: number,
  minTime: number,
  maxTime: number,
  dateFormat: string,
  margin: number | string,
  unselectedColor: string,
  selectedColor: string,
  hoveredColor: string,
  blockedColor: string,
  ariaLabel: string,
  'aria-describedby'?: string,
  'aria-label'?: string,
  'aria-labelledby'?: string,
  style?: StyleType,
  renderDateCell?: (Date, boolean, boolean) => React.Node,
}

type StateType = {
  // In the case that a user is drag-selecting, we don't want to call this.props.onChange() until they have completed
  // the drag-select. selectionDraft serves as a temporary copy during drag-selects.
  selectionDraft: Array<Date>,
  selectionBase: Array<Date>,
  selectionPropSignature: string,
  selectionPropListSignature: string,
  blockedPropSignature: string,
  dateGridPropSignature: string,
  selectionSchemePropSignature: SelectionSchemeType,
  selectionType: ?SelectionType,
  selectionStart: ?Date,
  isTouchDragging: boolean,
}

type DerivedStateType = {
  selectionDraft: Array<Date>,
  selectionBase: Array<Date>,
  selectionPropSignature: string,
  selectionPropListSignature: string,
  blockedPropSignature: string,
  dateGridPropSignature: string,
  selectionSchemePropSignature: SelectionSchemeType,
  selectionType: null,
  selectionStart: null,
  isTouchDragging: boolean,
}

export const preventScroll = (e: ?TouchEvent) => {
  preventDefault(e)
}

const preventDefault = (event: ?PreventableEventType) => {
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault()
  }
}

const getBrowserDocument = (): ?BrowserDocumentType => {
  if (typeof window === 'undefined') return null
  try {
    const browserDocument = window.document
    return browserDocument && typeof browserDocument === 'object' ? browserDocument : null
  } catch {
    return null
  }
}

export default class BookingSelector extends React.Component<PropsType, StateType> {
  dates: Array<Array<Date>>
  selectionSchemeHandlers: { [string]: (?Date, ?Date, Array<Array<Date>>) => Date[] }
  cellToDate: Map<HTMLElement, ?Date>
  dateToCell: Map<number, HTMLElement>
  touchScrollCells: Set<HTMLElement>
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
    dateFormat: DEFAULT_DATE_FORMAT,
    margin: 3,
    selectedColor: colors.blue,
    unselectedColor: colors.paleBlue,
    hoveredColor: colors.lightBlue,
    blockedColor: colors.black,
    ariaLabel: DEFAULT_ARIA_LABEL,
    onChange: () => {},
  }

  constructor(props: PropsType) {
    super(props)

    this.cellToDate = new Map()
    this.dateToCell = new Map()
    this.touchScrollCells = new Set()
    this.lastTouchEventTime = 0

    const selectionDraft = normalizeSelectionDraft(this.props.selection)
    const selectionPropSignature = getDateMinuteSetSignature(this.props.selection)
    const selectionPropListSignature = getDateListSignature(this.props.selection)
    const blockedPropSignature = getDateMinuteSetSignature(this.props.blocked)
    const dateGridPropSignature = getDateGridSignature(this.props)
    const selectionSchemePropSignature = getSelectionScheme(this.props.selectionScheme)
    this.state = {
      selectionDraft,
      selectionBase: selectionDraft,
      selectionPropSignature,
      selectionPropListSignature,
      blockedPropSignature,
      dateGridPropSignature,
      selectionSchemePropSignature,
      selectionType: null,
      selectionStart: null,
      isTouchDragging: false,
    }

    this.selectionSchemeHandlers = {
      linear: selectionSchemes.linear,
      square: selectionSchemes.square,
    }
    this.refreshInstanceLookups(this.props, selectionDraft)

    this.endSelection = this.endSelection.bind(this)
    this.handleMouseDownEvent = this.handleMouseDownEvent.bind(this)
    this.handleMouseUpEvent = this.handleMouseUpEvent.bind(this)
    this.handleMouseEnterEvent = this.handleMouseEnterEvent.bind(this)
    this.handleTouchStartEvent = this.handleTouchStartEvent.bind(this)
    this.handleTouchMoveEvent = this.handleTouchMoveEvent.bind(this)
    this.handleTouchEndEvent = this.handleTouchEndEvent.bind(this)
    this.handleTouchCancelEvent = this.handleTouchCancelEvent.bind(this)
    this.handleSelectionStartEvent = this.handleSelectionStartEvent.bind(this)
    this.handleDocumentMouseUpEvent = this.handleDocumentMouseUpEvent.bind(this)
    this.handleCellKeyDownEvent = this.handleCellKeyDownEvent.bind(this)
  }

  static getDerivedStateFromProps(props: PropsType, state: StateType): ?DerivedStateType {
    const selectionPropSignature = getDateMinuteSetSignature(props.selection)
    const selectionPropListSignature = getDateListSignature(props.selection)
    const blockedPropSignature = getDateMinuteSetSignature(props.blocked)
    const dateGridPropSignature = getDateGridSignature(props)
    const selectionSchemePropSignature = getSelectionScheme(props.selectionScheme)
    const selectionIsActive = isSelectionType(state.selectionType) && getValidDate(state.selectionStart) != null
    if (
      selectionPropSignature === state.selectionPropSignature &&
      (selectionPropListSignature === state.selectionPropListSignature || selectionIsActive) &&
      blockedPropSignature === state.blockedPropSignature &&
      dateGridPropSignature === state.dateGridPropSignature &&
      selectionSchemePropSignature === state.selectionSchemePropSignature
    ) {
      return null
    }

    const selectionDraft = normalizeSelectionDraft(props.selection)
    return {
      selectionDraft,
      selectionBase: selectionDraft,
      selectionPropSignature,
      selectionPropListSignature,
      blockedPropSignature,
      dateGridPropSignature,
      selectionSchemePropSignature,
      selectionType: null,
      selectionStart: null,
      isTouchDragging: false,
    }
  }

  componentDidMount() {
    // We need to add the endSelection event listener to the document itself in order
    // to catch the cases where the users ends their mouse-click somewhere besides
    // the date cells (in which case none of the DateCell's onMouseUp handlers would fire)
    //
    // This isn't necessary for touch events since the `touchend` event fires on
    // the element where the touch/drag started so it's always caught.
    const browserDocument = this.getDocument()
    if (browserDocument && typeof browserDocument.addEventListener === 'function') {
      try {
        browserDocument.addEventListener('mouseup', this.handleDocumentMouseUpEvent)
      } catch {
        // Continue mounting in non-standard hosts that cannot register document listeners.
      }
    }
  }

  componentDidUpdate() {
    this.refreshInstanceLookups(this.props, this.state.selectionDraft)
  }

  componentWillUnmount() {
    const browserDocument = this.getDocument()
    if (browserDocument && typeof browserDocument.removeEventListener === 'function') {
      try {
        browserDocument.removeEventListener('mouseup', this.handleDocumentMouseUpEvent)
      } catch {
        // Continue instance cleanup even if the document listener cannot be removed.
      }
    }
    this.cellToDate.forEach((value, dateCell) => {
      if (dateCell && typeof dateCell.removeEventListener === 'function') {
        try {
          dateCell.removeEventListener('touchmove', preventScroll)
        } catch {
          // Ignore cleanup failures from stale or non-standard registered cells.
        }
      }
    })
    this.cellToDate.clear()
    this.dateToCell.clear()
    this.touchScrollCells.clear()
  }

  refreshInstanceLookups(props: PropsType, selectionDraft: Array<Date>) {
    this.dates = buildDates(props)
    this.blockedMinuteKeys = getDateMinuteKeySet(props.blocked)
    this.selectedMinuteKeys = getDateMinuteKeySet(selectionDraft)
  }

  clearDateCellLookup(dateCell: HTMLElement) {
    this.dateToCell.forEach((registeredCell, registeredTime) => {
      if (registeredCell === dateCell) {
        this.dateToCell.delete(registeredTime)
      }
    })
  }

  clearDateCellTimeLookup(dateCell: HTMLElement, time: mixed) {
    const registeredTime = getDateKey(time)
    if (registeredTime == null) {
      this.clearDateCellLookup(dateCell)
      return
    }
    if (this.dateToCell.get(registeredTime) === dateCell) {
      this.dateToCell.delete(registeredTime)
    }
  }

  syncDateCellTouchMoveListener(dateCell: ?HTMLElement, shouldPreventTouchScroll: boolean) {
    if (!dateCell) return
    const isPreventingTouchScroll = this.touchScrollCells.has(dateCell)
    if (shouldPreventTouchScroll && !isPreventingTouchScroll) {
      if (typeof dateCell.addEventListener === 'function') {
        try {
          dateCell.addEventListener('touchmove', preventScroll, { passive: false })
          this.touchScrollCells.add(dateCell)
        } catch {
          // Leave the date registered even if this cell cannot accept touch listener options.
        }
      }
    } else if (!shouldPreventTouchScroll && isPreventingTouchScroll) {
      if (typeof dateCell.removeEventListener === 'function') {
        try {
          dateCell.removeEventListener('touchmove', preventScroll)
        } catch {
          // Continue clearing lookup state even when listener cleanup fails.
        }
      }
      this.touchScrollCells.delete(dateCell)
    }
  }

  registerDateCell(dateCell: ?HTMLElement, time: mixed, shouldPreventTouchScroll: boolean = true) {
    if (!dateCell) return
    const validTime = getValidDate(time)
    const previousTime = this.cellToDate.get(dateCell)
    if (this.cellToDate.has(dateCell) && previousTime) {
      this.clearDateCellTimeLookup(dateCell, previousTime)
    } else if (this.cellToDate.has(dateCell)) {
      this.clearDateCellLookup(dateCell)
    }
    this.syncDateCellTouchMoveListener(dateCell, shouldPreventTouchScroll && validTime != null)
    this.cellToDate.set(dateCell, validTime)
    if (validTime) {
      this.dateToCell.set(dateKey(validTime), dateCell)
    }
  }

  unregisterDateCell(dateCell: ?HTMLElement) {
    if (!dateCell) return
    const time = this.cellToDate.get(dateCell)
    if (!this.cellToDate.has(dateCell)) return
    this.syncDateCellTouchMoveListener(dateCell, false)
    this.cellToDate.delete(dateCell)
    if (time) {
      this.clearDateCellTimeLookup(dateCell, time)
    } else {
      this.clearDateCellLookup(dateCell)
    }
  }

  isBlocked(time: Date): boolean {
    return hasDateMinuteKey(this.blockedMinuteKeys, time)
  }

  isSelected(time: Date): boolean {
    return hasDateMinuteKey(this.selectedMinuteKeys, time)
  }

  getDocument(): ?BrowserDocumentType {
    const gridDocument = this.gridRef && this.gridRef.ownerDocument
    return gridDocument && typeof gridDocument === 'object' ? gridDocument : getBrowserDocument()
  }

  getDateCellFromEventTarget(target: mixed): ?HTMLElement {
    if (typeof Node !== 'function') return null
    if (!(target instanceof Node)) return null

    let targetElement =
      typeof HTMLElement === 'function' && target instanceof HTMLElement ? target : target.parentElement
    while (targetElement) {
      if (this.cellToDate.has(targetElement)) return targetElement
      if (targetElement === this.gridRef) return null
      targetElement = targetElement.parentElement
    }
    return null
  }

  handleDocumentMouseUpEvent(event: ?MouseEvent) {
    if (this.state.selectionType === null) return
    if (this.shouldIgnoreMouseEvent()) return
    if (!isPrimaryMouseButton(event)) return
    const dateCell = this.getDateCellFromEventTarget(event && event.target)
    const dateCellTime = dateCell ? this.cellToDate.get(dateCell) : null
    if (dateCellTime && !this.isBlocked(dateCellTime)) return
    if (this.state.selectionDraft === this.state.selectionBase) {
      this.updateAvailabilityDraft(this.state.selectionStart, this.endSelection)
      return
    }
    this.endSelection()
  }

  // Performs a lookup into this.cellToDate to retrieve the Date that corresponds to
  // the cell where this touch event is right now. Note that this method will only work
  // if the event is a `touchmove` event since it's the only one that has a `touches` list.
  getTimeFromTouchEvent(event: ?TouchSelectionEventType): ?Date {
    if (!event) return null
    const { touches } = event
    if (!touches || touches.length === 0) return null
    const touch = touches[0]
    if (!touch || !Number.isFinite(touch.clientX) || !Number.isFinite(touch.clientY)) return null
    const browserDocument = this.getDocument()
    if (!browserDocument || typeof browserDocument.elementFromPoint !== 'function') return null
    const { clientX, clientY } = touch
    let targetElement
    try {
      targetElement = browserDocument.elementFromPoint(clientX, clientY)
    } catch {
      return null
    }
    while (targetElement) {
      const cellTime = this.cellToDate.get(targetElement)
      if (cellTime) return cellTime
      if (targetElement === this.gridRef) return null
      targetElement = targetElement.parentElement
    }
    return null
  }

  endSelection() {
    const hasValidSelectionType = isSelectionType(this.state.selectionType)
    const hasDanglingSelectionState =
      this.state.selectionType != null || this.state.selectionStart !== null || this.state.isTouchDragging
    if (!hasValidSelectionType && !hasDanglingSelectionState) return

    const nextSelection = hasValidSelectionType ? normalizeSelectionDraft(this.state.selectionDraft) : null
    if (nextSelection) {
      this.setState({
        selectionDraft: nextSelection,
        selectionBase: nextSelection,
        selectionType: null,
        selectionStart: null,
        isTouchDragging: false,
      })
      if (typeof this.props.onChange === 'function') {
        this.props.onChange(normalizeSelectionDraft(nextSelection))
      }
      return
    }

    this.setState({
      selectionType: null,
      selectionStart: null,
      isTouchDragging: false,
    })
  }

  // Given an ending Date, determines all the dates that should be selected in this draft
  updateAvailabilityDraft(selectionEnd: ?Date, callback?: () => void) {
    const { selectionType, selectionStart } = this.state
    const validSelectionStart = getValidDate(selectionStart)
    const validSelectionEnd = selectionEnd == null ? null : getValidDate(selectionEnd)

    if (!isSelectionType(selectionType) || !validSelectionStart || (selectionEnd != null && !validSelectionEnd)) {
      if (callback) callback()
      return
    }

    const selectionSchemeHandler = this.selectionSchemeHandlers[getSelectionScheme(this.props.selectionScheme)]
    const availableSelection = selectionSchemeHandler(validSelectionStart, validSelectionEnd, this.dates).filter(
      (time) => !this.isBlocked(time),
    )
    let nextDraft = normalizeSelectionDraft(this.state.selectionBase).filter((time) => !this.isBlocked(time))
    if (selectionType === 'add') {
      nextDraft = uniqueDatesByMinute([...nextDraft, ...availableSelection])
    } else {
      const availableSelectionKeys = new Set(availableSelection.map(dateMinuteKey))
      nextDraft = nextDraft.filter((date) => !availableSelectionKeys.has(dateMinuteKey(date)))
    }
    this.setState({ selectionDraft: nextDraft }, callback)
  }

  // Isomorphic (mouse and touch) handler since starting a selection works the same way for both classes of user input
  handleSelectionStartEvent(startTime: mixed) {
    const validStartTime = getValidDate(startTime)
    if (!validStartTime || this.isBlocked(validStartTime)) return

    // Check if the startTime cell is selected/unselected to determine if this drag-select should
    // add values or remove values
    const timeSelected = this.isSelected(validStartTime)
    this.setState({
      selectionType: timeSelected ? 'remove' : 'add',
      selectionStart: validStartTime,
      selectionBase: this.state.selectionDraft,
    })
  }

  recordTouchEvent() {
    this.lastTouchEventTime = Date.now()
  }

  shouldIgnoreMouseEvent(): boolean {
    const elapsedTouchTime = Date.now() - this.lastTouchEventTime
    return this.lastTouchEventTime > 0 && elapsedTouchTime >= 0 && elapsedTouchTime < TOUCH_MOUSE_SUPPRESSION_MS
  }

  clearTouchDragState() {
    const shouldClearSelectionStart = this.state.selectionStart !== null && !isSelectionType(this.state.selectionType)
    if (!this.state.isTouchDragging && !shouldClearSelectionStart) return

    this.setState({ selectionStart: null, isTouchDragging: false })
  }

  handleMouseDownEvent(time: mixed, event?: MouseSelectionEventType) {
    if (!isPrimaryMouseButton(event)) return
    if (this.shouldIgnoreMouseEvent()) return
    this.handleSelectionStartEvent(time)
  }

  handleMouseEnterEvent(time: mixed) {
    if (this.shouldIgnoreMouseEvent()) return
    const validTime = getValidDate(time)
    if (!validTime) return

    // Need to update selection draft on mouseup as well in order to catch the cases
    // where the user just clicks on a single cell (because no mouseenter events fire
    // in this scenario)
    this.updateAvailabilityDraft(validTime)
  }

  handleMouseUpEvent(time: mixed, event?: MouseSelectionEventType) {
    if (!isPrimaryMouseButton(event)) return
    if (this.shouldIgnoreMouseEvent()) return
    const validTime = getValidDate(time)
    if (!validTime) {
      if (this.state.selectionDraft === this.state.selectionBase) {
        this.updateAvailabilityDraft(this.state.selectionStart, this.endSelection)
      } else {
        this.endSelection()
      }
      return
    }
    this.updateAvailabilityDraft(validTime, this.endSelection)
  }

  focusDateCell(time: Date): boolean {
    if (this.isBlocked(time)) return false
    const key = getDateKey(time)
    if (key == null) return false
    const dateCell = this.dateToCell.get(key)
    if (!dateCell || typeof dateCell.focus !== 'function') return false
    try {
      dateCell.focus()
      return true
    } catch {
      return false
    }
  }

  handleCellKeyDownEvent(event: ?KeyboardSelectionEventType, time: mixed, blocked: boolean = false) {
    const key = event && typeof event.key === 'string' ? event.key : ''
    const validTime = getValidDate(time)

    if (isKeyboardNavigationKey(key)) {
      if (!validTime) return
      const navigationTarget = getKeyboardNavigationTarget(
        buildDateColumns(this.props),
        validTime,
        key,
        this.blockedMinuteKeys,
      )
      preventDefault(event)
      if (navigationTarget) this.focusDateCell(navigationTarget)
      return
    }

    if (blocked || !validTime || !isKeyboardSelectionKey(key)) return
    preventDefault(event)
    const timeSelected = this.isSelected(validTime)
    this.setState(
      {
        selectionType: timeSelected ? 'remove' : 'add',
        selectionStart: validTime,
        selectionBase: this.state.selectionDraft,
      },
      () => {
        this.updateAvailabilityDraft(validTime, this.endSelection)
      },
    )
  }

  handleTouchStartEvent(startTime: mixed) {
    this.recordTouchEvent()
    this.handleSelectionStartEvent(startTime)
  }

  handleTouchMoveEvent(event: TouchSelectionEventType) {
    this.recordTouchEvent()
    if (!isSelectionType(this.state.selectionType) || !getValidDate(this.state.selectionStart)) return

    if (!this.state.isTouchDragging) {
      this.setState({ isTouchDragging: true })
    }
    const cellTime = this.getTimeFromTouchEvent(event)
    if (cellTime && !this.isBlocked(cellTime)) {
      this.updateAvailabilityDraft(cellTime)
    }
  }

  handleTouchEndEvent() {
    this.recordTouchEvent()
    if (this.state.selectionType === null) {
      this.clearTouchDragState()
      return
    }

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
  }

  handleTouchCancelEvent() {
    this.recordTouchEvent()

    if (this.state.selectionType === null) {
      this.clearTouchDragState()
      return
    }

    const restoredSelectionBase = normalizeSelectionDraft(this.state.selectionBase)
    this.setState({
      selectionDraft: restoredSelectionBase,
      selectionBase: restoredSelectionBase,
      selectionType: null,
      selectionStart: null,
      isTouchDragging: false,
    })
  }

  renderTimeLabels = (): React.Element<*> => {
    const labels = [<GridCell $height="40" key={-1} />] // Ensures time labels start at correct location
    getVisibleHours(this.props.minTime, this.props.maxTime).forEach((t) => {
      labels.push(
        <TimeLabelCell key={t}>
          <TimeText>{formatHour(t)}</TimeText>
        </TimeLabelCell>,
      )
    })
    return <TimeColumn aria-hidden="true">{labels}</TimeColumn>
  }

  renderDateColumn = (
    dateColumn: DateColumnType,
    blockedMinuteKeys: Set<number>,
    selectedMinuteKeys: Set<number>,
  ): React.Element<*> => (
    <Column key={dateColumn.day.toISOString()}>
      <GridCell $height="50" $margin={this.props.margin} aria-hidden="true">
        <DayLabel>{formatDate(dateColumn.day, 'EEE').toUpperCase()}</DayLabel>
        <DateLabel>{formatDateHeader(dateColumn.day, this.props.dateFormat)}</DateLabel>
      </GridCell>
      {dateColumn.slots.map((slot) =>
        slot.time
          ? this.renderDateCellWrapperWithLookups(slot.time, blockedMinuteKeys, selectedMinuteKeys)
          : this.renderDateCellPlaceholder(dateColumn.day, slot.hour),
      )}
    </Column>
  )

  renderDateCellPlaceholder = (day: Date, hour: number): React.Element<*> => (
    <GridCell $height="40px" $margin={this.props.margin} aria-hidden="true" key={`${day.toISOString()}-${hour}`} />
  )

  renderDateCellWrapper = (time: Date): React.Element<*> =>
    this.renderDateCellWrapperWithLookups(time, this.blockedMinuteKeys, this.selectedMinuteKeys)

  renderDateCellWrapperWithLookups = (
    time: Date,
    blockedMinuteKeys: Set<number>,
    selectedMinuteKeys: Set<number>,
  ): React.Element<*> => {
    const blocked = hasDateMinuteKey(blockedMinuteKeys, time)
    const selected = !blocked && hasDateMinuteKey(selectedMinuteKeys, time)
    const mouseStartHandler = (event) => {
      if (!blocked) this.handleMouseDownEvent(time, event)
    }
    const touchStartHandler = () => {
      if (!blocked) this.handleTouchStartEvent(time)
    }
    const mouseEnterHandler = () => {
      if (!blocked) this.handleMouseEnterEvent(time)
    }
    const mouseUpHandler = (event) => {
      if (!blocked) this.handleMouseUpEvent(time, event)
    }
    let currentDateCell: ?HTMLElement = null
    const refSetter = (dateCell: ?HTMLElement) => {
      if (currentDateCell && currentDateCell !== dateCell) {
        this.unregisterDateCell(currentDateCell)
      }
      if (dateCell) {
        this.registerDateCell(dateCell, time, !blocked)
      }
      currentDateCell = dateCell
    }

    return (
      <GridCell
        as="button"
        className="rgdp__grid-cell"
        type="button"
        disabled={blocked}
        aria-label={formatCellLabel(time, selected, blocked)}
        aria-pressed={selected}
        $height="40px"
        $blocked={blocked}
        $interactive
        $touchActionEnabled={!blocked}
        $margin={this.props.margin}
        key={time.toISOString()}
        ref={refSetter}
        // Mouse handlers
        onMouseDown={mouseStartHandler}
        onMouseEnter={mouseEnterHandler}
        onMouseUp={mouseUpHandler}
        // Touch handlers
        // Since touch events fire on the event where the touch-drag started, there's no point in passing
        // in the time parameter, instead these handlers will do their job using the default SyntheticEvent
        // parameters
        onTouchStart={touchStartHandler}
        onTouchMove={this.handleTouchMoveEvent}
        onTouchEnd={this.handleTouchEndEvent}
        onTouchCancel={this.handleTouchCancelEvent}
        onKeyDown={(event) => {
          this.handleCellKeyDownEvent(event, time, blocked)
        }}
      >
        {this.renderDateCell(time, selected, blocked)}
      </GridCell>
    )
  }

  renderDateCell = (time: Date, selected: boolean, blocked: boolean): React.Node => {
    if (typeof this.props.renderDateCell === 'function') {
      return this.props.renderDateCell(new Date(dateGetTime.call(time)), selected, blocked)
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
    const dateColumns = buildDateColumns(this.props)
    const blockedMinuteKeys = getDateMinuteKeySet(this.props.blocked)
    const selectedMinuteKeys = getDateMinuteKeySet(this.state.selectionDraft)
    const gridAriaDescribedBy = getNonEmptyString(this.props['aria-describedby'])
    const gridAriaLabelledBy = getNonEmptyString(this.props['aria-labelledby'])
    const gridAriaLabel =
      getNonEmptyString(this.props['aria-label']) || getNonEmptyString(this.props.ariaLabel) || DEFAULT_ARIA_LABEL

    return (
      <Wrapper className={this.props.className} id={this.props.id} style={this.props.style}>
        {
          <Grid
            role="group"
            aria-describedby={gridAriaDescribedBy}
            aria-label={gridAriaLabelledBy ? undefined : gridAriaLabel}
            aria-labelledby={gridAriaLabelledBy}
            ref={(el) => {
              this.gridRef = el
            }}
          >
            {dateColumns.length > 0 && this.renderTimeLabels()}
            {dateColumns.map((dateColumn) => this.renderDateColumn(dateColumn, blockedMinuteKeys, selectedMinuteKeys))}
          </Grid>
        }
      </Wrapper>
    )
  }
}
