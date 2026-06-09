// @flow

import { isAfter } from 'date-fns/isAfter'
import { isValid } from 'date-fns/isValid'
import { startOfDay } from 'date-fns/startOfDay'

const allDatesAreValid = (...dates: Array<mixed>): boolean =>
  dates.every((date) => date instanceof Date && isValid(date))

// Helper function that uses date-fns methods to determine if a date is between two other dates
export const dateHourIsBetween = (start: Date, candidate: Date, end: Date): boolean =>
  allDatesAreValid(start, candidate, end) &&
  (candidate.getTime() === start.getTime() || isAfter(candidate, start)) &&
  (candidate.getTime() === end.getTime() || isAfter(end, candidate))

export const dateIsBetween = (start: Date, candidate: Date, end: Date): boolean => {
  if (!allDatesAreValid(start, candidate, end)) return false

  const startOfCandidate = startOfDay(candidate)
  const startOfStart = startOfDay(start)
  const startOfEnd = startOfDay(end)

  return (
    (startOfCandidate.getTime() === startOfStart.getTime() || isAfter(startOfCandidate, startOfStart)) &&
    (startOfCandidate.getTime() === startOfEnd.getTime() || isAfter(startOfEnd, startOfCandidate))
  )
}

export const timeIsBetween = (start: Date, candidate: Date, end: Date): boolean =>
  allDatesAreValid(start, candidate, end) &&
  candidate.getHours() >= start.getHours() &&
  candidate.getHours() <= end.getHours()
