import { addDays, subDays } from 'date-fns'

import { dateIsBetween, timeIsBetween, dateHourIsBetween } from '../../src/lib/date-utils'

const baseDate = new Date('2018-01-01T00:00:00.000')

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
