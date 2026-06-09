// @flow

const DateConstructor = Date
const objectToString = Object.prototype.toString
const dateGetTime = DateConstructor.prototype.getTime
const dateGetHours = DateConstructor.prototype.getHours
const dateSetHours = DateConstructor.prototype.setHours
const numberIsFinite = Number.isFinite
const arrayEvery = Array.prototype.every

const isDateInstance = (date: any): boolean => {
  try {
    return date instanceof DateConstructor
  } catch {
    return false
  }
}

export const hasDateObjectTag = (date: any): boolean => {
  if (isDateInstance(date)) return true
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
  if (!numberIsFinite(timestamp)) return Number.NaN

  const startOfDay = new DateConstructor(timestamp)
  dateSetHours.call(startOfDay, 0, 0, 0, 0)
  return dateGetTime.call(startOfDay)
}

export const isValidDate = (date: any): boolean => numberIsFinite(getDateTimestamp(date))

const allNumbersAreFinite = (...values: Array<number>): boolean => arrayEvery.call(values, numberIsFinite)

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
