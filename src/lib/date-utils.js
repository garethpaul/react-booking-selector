// @flow

const objectToString = Object.prototype.toString
const dateGetTime = Date.prototype.getTime
const dateGetHours = Date.prototype.getHours
const dateSetHours = Date.prototype.setHours

export const hasDateObjectTag = (date: any): boolean => {
  if (date instanceof Date) return true
  if (!date || typeof date !== 'object') return false

  try {
    return objectToString.call(date) === '[object Date]'
  } catch {
    return false
  }
}

export const isDateObject = (date: any): boolean => {
  if (!hasDateObjectTag(date)) return false

  try {
    dateGetTime.call(date)
    return true
  } catch {
    return false
  }
}

export const getDateTimestamp = (date: any): number => {
  if (!isDateObject(date)) return Number.NaN

  return dateGetTime.call(date)
}

export const getDateHour = (date: any): number => {
  if (!isDateObject(date)) return Number.NaN

  return dateGetHours.call(date)
}

export const getStartOfDayTimestamp = (date: any): number => {
  const timestamp = getDateTimestamp(date)
  if (!Number.isFinite(timestamp)) return Number.NaN

  const startOfDay = new Date(timestamp)
  dateSetHours.call(startOfDay, 0, 0, 0, 0)
  return dateGetTime.call(startOfDay)
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
