import { addDays, addHours, startOfDay } from 'date-fns'

import linear from '../../../src/lib/selection-schemes/linear'

const toTimeValues = (dates) => dates.map((date) => Date.prototype.getTime.call(date))

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

describe('linear selection scheme', () => {
  const dates = []
  const startDate = startOfDay(new Date('2018-01-01T00:00:00.000'))
  beforeAll(() => {
    for (let i = 0; i < 5; i += 1) {
      const dayBuffer = []
      // Use 0 as the start so index lines up for ease of testing
      for (let j = 0; j < 20; j += 1) {
        dayBuffer.push(addHours(addDays(startDate, i), j))
      }
      dates.push(dayBuffer)
    }
  })

  test('it handles a null selectionEnd', () => {
    const selectionStart = dates[0][1]
    expect(linear(selectionStart, null, dates)).toEqual([selectionStart])
  })

  test('it handles a null start and end', () => {
    expect(linear(null, null, dates)).toHaveLength(0)
  })

  test('it handles a null start with a selectionEnd', () => {
    expect(linear(null, dates[0][1], dates)).toHaveLength(0)
  })

  test('it ignores invalid selection endpoints', () => {
    expect(linear(new Date('invalid'), null, dates)).toEqual([])
    expect(linear('not-a-date', dates[0][1], dates)).toEqual([])
    expect(linear(dates[0][1], new Date('invalid'), dates)).toEqual([])
    expect(linear(dates[0][1], 'not-a-date', dates)).toEqual([])
  })

  test('it handles a cross-day selection', () => {
    const expected = []
    const START = { DATE: 1, TIME: 10 }
    const END = { DATE: 2, TIME: 5 }
    dates[START.DATE].slice(START.TIME).forEach((d) => expected.push(d))
    dates[END.DATE].slice(0, END.TIME + 1).forEach((d) => expected.push(d))

    const result = linear(dates[START.DATE][START.TIME], dates[END.DATE][END.TIME], dates)
    expect(toTimeValues(result)).toEqual(toTimeValues(expected))
  })

  test('it handles a reversed cross-day selection', () => {
    const expected = []
    const START = { DATE: 2, TIME: 5 }
    const END = { DATE: 1, TIME: 10 }
    dates[END.DATE].slice(END.TIME).forEach((d) => expected.push(d))
    dates[START.DATE].slice(0, START.TIME + 1).forEach((d) => expected.push(d))

    const result = linear(dates[START.DATE][START.TIME], dates[END.DATE][END.TIME], dates)
    expect(toTimeValues(result)).toEqual(toTimeValues(expected))
  })

  test('it skips missing day buckets', () => {
    const sparseDates = [dates[0], undefined, dates[2]]
    const expected = [dates[0][19], ...dates[2].slice(0, 2)]

    const result = linear(dates[0][19], dates[2][1], sparseDates)

    expect(toTimeValues(result)).toEqual(toTimeValues(expected))
  })

  test('it ignores malformed date lists', () => {
    expect(linear(dates[0][1], dates[0][2], null)).toEqual([])
    expect(linear(dates[0][1], dates[0][2], { reduce: () => [dates[0][1]] })).toEqual([])
  })

  test('it skips missing times inside day buckets', () => {
    const sparseDates = [[dates[0][18], undefined, dates[0][19]], [null], [dates[2][0], dates[2][1]]]
    const expected = [dates[0][18], dates[0][19], dates[2][0], dates[2][1]]

    const result = linear(dates[0][18], dates[2][1], sparseDates)

    expect(toTimeValues(result)).toEqual(toTimeValues(expected))
  })

  test('it uses intrinsic Date reads instead of overwritten instance methods', () => {
    const mutatedDates = [[dates[0][8], dates[0][9], dates[0][10]].map(withThrowingInstanceDateMethods)]

    const result = linear(mutatedDates[0][0], mutatedDates[0][2], mutatedDates)

    expect(toTimeValues(result)).toEqual(toTimeValues(mutatedDates[0]))
  })
})
