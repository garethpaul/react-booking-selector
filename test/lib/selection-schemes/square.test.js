import { addDays, addHours, startOfDay } from 'date-fns'

import square from '../../../src/lib/selection-schemes/square'

const toTimeValues = (dates) => dates.map((date) => date.getTime())

describe('square selection scheme', () => {
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
    expect(square(selectionStart, null, dates)).toEqual([selectionStart])
  })

  test('it handles a null start and end', () => {
    expect(square(null, null, dates)).toHaveLength(0)
  })

  test('it handles a null start with a selectionEnd', () => {
    expect(square(null, dates[0][1], dates)).toHaveLength(0)
  })

  test('it handles a cross-day selection', () => {
    const expected = []
    const START = { DATE: 1, TIME: 10 }
    const END = { DATE: 2, TIME: 5 }
    dates[START.DATE].slice(END.TIME, START.TIME + 1).forEach((d) => expected.push(d))
    dates[END.DATE].slice(END.TIME, START.TIME + 1).forEach((d) => expected.push(d))

    const result = square(dates[START.DATE][START.TIME], dates[END.DATE][END.TIME], dates)
    expect(toTimeValues(result)).toEqual(toTimeValues(expected))
  })

  test('it handles a reversed cross-day selection', () => {
    const expected = []
    const START = { DATE: 2, TIME: 5 }
    const END = { DATE: 1, TIME: 10 }
    dates[END.DATE].slice(START.TIME, END.TIME + 1).forEach((d) => expected.push(d))
    dates[START.DATE].slice(START.TIME, END.TIME + 1).forEach((d) => expected.push(d))

    const result = square(dates[START.DATE][START.TIME], dates[END.DATE][END.TIME], dates)
    expect(toTimeValues(result)).toEqual(toTimeValues(expected))
  })

  test('it skips missing day buckets', () => {
    const sparseDates = [dates[0], undefined, dates[2]]
    const expected = [dates[0][5], dates[0][6], dates[2][5], dates[2][6]]

    const result = square(dates[0][5], dates[2][6], sparseDates)

    expect(toTimeValues(result)).toEqual(toTimeValues(expected))
  })

  test('it skips missing times inside day buckets', () => {
    const sparseDates = [[dates[0][5], undefined, dates[0][6]], [null], [dates[2][5], dates[2][6]]]
    const expected = [dates[0][5], dates[0][6], dates[2][5], dates[2][6]]

    const result = square(dates[0][5], dates[2][6], sparseDates)

    expect(toTimeValues(result)).toEqual(toTimeValues(expected))
  })
})
