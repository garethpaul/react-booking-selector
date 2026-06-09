import { addDays, subDays } from 'date-fns'
import { runInNewContext } from 'vm'

import {
  dateIsBetween,
  timeIsBetween,
  dateHourIsBetween,
  getDateHour,
  getStartOfDayTimestamp,
  getDateTimestamp,
  isDateObject,
  isValidDate,
} from '../../src/lib/date-utils'

const baseDate = new Date('2018-01-01T00:00:00.000')

const createCrossRealmDate = (value) => runInNewContext('new Date(value)', { value })

const withThrowingInstanceDateMethods = (date) => {
  const mutatedDate = new Date(date)
  mutatedDate.getTime = () => {
    throw new Error('Unexpected getTime call')
  }
  mutatedDate.getHours = () => {
    throw new Error('Unexpected getHours call')
  }
  return mutatedDate
}

const getHourlyDates = () => {
  const today = {}
  const tomorrow = {}
  for (let i = 0; i < 24; i += 1) {
    today[i] = new Date(baseDate.getTime())
    today[i].setHours(i)
    tomorrow[i] = new Date(today[i].getTime())
    tomorrow[i].setDate(today[i].getDate() + 1)
  }
  return { today, tomorrow }
}

describe('dateHourIsBetween', () => {
  const { today, tomorrow } = getHourlyDates()

  test.each([
    ['in between today', [today[1], today[3], today[4]], true],
    ['in between cross-day', [today[20], tomorrow[1], tomorrow[4]], true],
    ['before range', [today[10], today[3], today[4]], false],
    ['after range', [today[10], today[11], today[8]], false],
    ['same time', [today[3], today[3], today[3]], true],
  ])('it is correct for the case: %s', (testName, args, expectation) => {
    const expectMethod = expectation ? 'toBeTruthy' : 'toBeFalsy'
    expect(dateHourIsBetween(...args))[expectMethod]()
  })
})

describe('dateIsBetween', () => {
  const today = new Date('2018-01-02T12:00:00.000')
  const tomorrow = addDays(today, 1)
  const yesterday = subDays(today, 1)

  test.each([
    ['today between yesterday and tomorrow', [yesterday, today, tomorrow], true],
    ['yesterday between today and tomorrow', [today, yesterday, tomorrow], false],
    ['tomorrow between yesterday and today', [yesterday, tomorrow, today], false],
    ['today between today and today', [today, today, today], true],
  ])('it is correct for the case: %s', (testName, args, expectation) => {
    const expectMethod = expectation ? 'toBeTruthy' : 'toBeFalsy'
    expect(dateIsBetween(...args))[expectMethod]()
  })
})

describe('malformed date inputs', () => {
  const validDate = new Date('2018-01-01T09:00:00.000')
  const invalidDate = new Date('invalid')

  test.each([
    ['dateHourIsBetween', dateHourIsBetween],
    ['dateIsBetween', dateIsBetween],
    ['timeIsBetween', timeIsBetween],
  ])('%s returns false instead of throwing for malformed arguments', (testName, isBetween) => {
    expect(isBetween(null, validDate, validDate)).toBe(false)
    expect(isBetween(validDate, invalidDate, validDate)).toBe(false)
    expect(isBetween(validDate, validDate, 'not-a-date')).toBe(false)
  })

  test('between helpers use intrinsic Date reads instead of overwritten instance methods', () => {
    const start = withThrowingInstanceDateMethods(new Date(2018, 0, 1, 9))
    const candidate = withThrowingInstanceDateMethods(new Date(2018, 0, 1, 10))
    const end = withThrowingInstanceDateMethods(new Date(2018, 0, 1, 11))

    expect(dateHourIsBetween(start, candidate, end)).toBe(true)
    expect(dateIsBetween(start, candidate, end)).toBe(true)
    expect(timeIsBetween(start, candidate, end)).toBe(true)
  })

  test('between helpers accept Date objects created in another JavaScript realm', () => {
    const start = createCrossRealmDate('2018-01-01T09:00:00.000')
    const candidate = createCrossRealmDate('2018-01-01T10:00:00.000')
    const end = createCrossRealmDate('2018-01-01T11:00:00.000')

    expect(start).not.toBeInstanceOf(Date)
    expect(dateHourIsBetween(start, candidate, end)).toBe(true)
    expect(dateIsBetween(start, candidate, end)).toBe(true)
    expect(timeIsBetween(start, candidate, end)).toBe(true)
  })

  test('Date readers reject objects that only spoof the Date brand', () => {
    const dateTaggedObject = { [Symbol.toStringTag]: 'Date' }
    const datePrototypeObject = Object.create(Date.prototype)
    const throwingTagObject = new Proxy(
      {},
      {
        get(target, property) {
          if (property === Symbol.toStringTag) {
            throw new Error('Cannot read tag')
          }
          return target[property]
        },
      },
    )

    expect(getDateTimestamp(dateTaggedObject)).toBeNaN()
    expect(getDateTimestamp(datePrototypeObject)).toBeNaN()
    expect(getDateHour(dateTaggedObject)).toBeNaN()
    expect(isValidDate({})).toBe(false)
    expect(isValidDate(throwingTagObject)).toBe(false)
    expect(isDateObject(dateTaggedObject)).toBe(false)
    expect(isDateObject(datePrototypeObject)).toBe(false)
    expect(isDateObject(throwingTagObject)).toBe(false)
  })

  test('Date brand checks accept valid same-realm and cross-realm Date objects', () => {
    expect(isDateObject(validDate)).toBe(true)
    expect(isDateObject(invalidDate)).toBe(true)
    expect(isDateObject(createCrossRealmDate('2018-01-01T09:00:00.000'))).toBe(true)
  })

  test('Date brand checks fall back when instanceof Date throws', () => {
    const hasInstanceDescriptor = Object.getOwnPropertyDescriptor(Date, Symbol.hasInstance)
    const timestamp = validDate.getTime()

    try {
      Object.defineProperty(Date, Symbol.hasInstance, {
        configurable: true,
        value() {
          throw new Error('Cannot check Date instance')
        },
      })

      expect(isDateObject(validDate)).toBe(true)
      expect(getDateTimestamp(validDate)).toBe(timestamp)
      expect(isValidDate({})).toBe(false)
    } finally {
      if (hasInstanceDescriptor) {
        Object.defineProperty(Date, Symbol.hasInstance, hasInstanceDescriptor)
      } else {
        delete Date[Symbol.hasInstance]
      }
    }
  })

  test('Date readers use captured prototype methods when Date prototypes change later', () => {
    const originalGetTime = Date.prototype.getTime
    const originalGetHours = Date.prototype.getHours
    const originalSetHours = Date.prototype.setHours
    const start = new Date(2018, 0, 1, 9)
    const candidate = new Date(2018, 0, 1, 10)
    const end = new Date(2018, 0, 1, 11)
    const startOfDay = new Date(candidate)
    originalSetHours.call(startOfDay, 0, 0, 0, 0)

    try {
      Date.prototype.getTime = function getTime() {
        throw new Error('Cannot read timestamp')
      }
      Date.prototype.getHours = function getHours() {
        throw new Error('Cannot read hour')
      }
      Date.prototype.setHours = function setHours() {
        throw new Error('Cannot set start of day')
      }

      expect(getDateTimestamp(candidate)).toBe(originalGetTime.call(candidate))
      expect(getDateHour(candidate)).toBe(originalGetHours.call(candidate))
      expect(getStartOfDayTimestamp(candidate)).toBe(originalGetTime.call(startOfDay))
      expect(dateHourIsBetween(start, candidate, end)).toBe(true)
      expect(dateIsBetween(start, candidate, end)).toBe(true)
      expect(timeIsBetween(start, candidate, end)).toBe(true)
    } finally {
      Date.prototype.getTime = originalGetTime
      Date.prototype.getHours = originalGetHours
      Date.prototype.setHours = originalSetHours
    }
  })

  test('Date readers use the captured Date constructor when the global changes later', () => {
    const OriginalDate = Date
    const candidate = new OriginalDate(2018, 0, 1, 10)
    const startOfDay = new OriginalDate(candidate)
    OriginalDate.prototype.setHours.call(startOfDay, 0, 0, 0, 0)

    try {
      globalThis.Date = function Date() {
        throw new Error('Unexpected Date constructor call')
      }

      expect(isDateObject(candidate)).toBe(true)
      expect(getDateTimestamp(candidate)).toBe(OriginalDate.prototype.getTime.call(candidate))
      expect(getStartOfDayTimestamp(candidate)).toBe(OriginalDate.prototype.getTime.call(startOfDay))
    } finally {
      globalThis.Date = OriginalDate
    }
  })
})

describe('timeIsBetween', () => {
  const { today, tomorrow } = getHourlyDates()

  test.each([
    ['increasing times', [today[1], today[2], today[3]], true],
    ['before range', [today[5], today[4], today[7]], false],
    ['all same', [today[5], today[5], today[5]], true],
    ['after range', [today[5], today[10], today[4]], false],
    ['cross-day true', [today[5], tomorrow[10], today[12]], true],
    ['cross-day-false', [today[5], tomorrow[10], today[6]], false],
  ])('it is correct for the case: %s', (testName, args, expectation) => {
    const expectMethod = expectation ? 'toBeTruthy' : 'toBeFalsy'
    expect(timeIsBetween(...args))[expectMethod]()
  })
})
