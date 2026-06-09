// @flow

export const getDateTimestamp = (date: any): number =>
  date instanceof Date ? Date.prototype.getTime.call(date) : Number.NaN

export const getDateHour = (date: any): number =>
  date instanceof Date ? Date.prototype.getHours.call(date) : Number.NaN

export const getStartOfDayTimestamp = (date: any): number => {
  const timestamp = getDateTimestamp(date)
  if (!Number.isFinite(timestamp)) return Number.NaN

  const startOfDay = new Date(timestamp)
  Date.prototype.setHours.call(startOfDay, 0, 0, 0, 0)
  return Date.prototype.getTime.call(startOfDay)
}

export const isValidDate = (date: any): boolean => Number.isFinite(getDateTimestamp(date))

const allNumbersAreFinite = (...values: Array<number>): boolean => values.every(Number.isFinite)

// Helper function that determines if a timestamp is between two other dates.
export const dateHourIsBetween = (start: Date, candidate: Date, end: Date): boolean => {
  const startTimestamp = getDateTimestamp(start)
  const candidateTimestamp = getDateTimestamp(candidate)
  const endTimestamp = getDateTimestamp(end)

  return (
    allNumbersAreFinite(startTimestamp, candidateTimestamp, endTimestamp) &&
    candidateTimestamp >= startTimestamp &&
    candidateTimestamp <= endTimestamp
  )
}

export const dateIsBetween = (start: Date, candidate: Date, end: Date): boolean => {
  const startTimestamp = getStartOfDayTimestamp(start)
  const candidateTimestamp = getStartOfDayTimestamp(candidate)
  const endTimestamp = getStartOfDayTimestamp(end)

  return (
    allNumbersAreFinite(startTimestamp, candidateTimestamp, endTimestamp) &&
    candidateTimestamp >= startTimestamp &&
    candidateTimestamp <= endTimestamp
  )
}

export const timeIsBetween = (start: Date, candidate: Date, end: Date): boolean => {
  const startHour = getDateHour(start)
  const candidateHour = getDateHour(candidate)
  const endHour = getDateHour(end)

  return (
    allNumbersAreFinite(startHour, candidateHour, endHour) && candidateHour >= startHour && candidateHour <= endHour
  )
}
