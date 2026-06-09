// @flow

import * as dateUtils from '../date-utils.js'

const isArray = Array.isArray

const collectMatchingDates = (dateList: mixed, matches: (mixed) => boolean): Array<Date> => {
  const selected: Array<Date> = []
  if (!isArray(dateList)) return selected

  for (let dayIndex = 0; dayIndex < dateList.length; dayIndex += 1) {
    const dayOfTimes = dateList[dayIndex]
    if (!isArray(dayOfTimes)) continue

    for (let timeIndex = 0; timeIndex < dayOfTimes.length; timeIndex += 1) {
      const time = dayOfTimes[timeIndex]
      if (matches(time)) selected.push((time: any))
    }
  }

  return selected
}

const square = (selectionStart: ?Date, selectionEnd: ?Date, dateList: Array<Array<Date>>): Array<Date> => {
  let selected: Array<Date> = []
  if (!dateUtils.isValidDate(selectionStart)) return selected

  if (selectionEnd == null) {
    selected = [selectionStart]
  } else if (dateUtils.isValidDate(selectionEnd)) {
    const dateIsReversed =
      dateUtils.getStartOfDayTimestamp(selectionEnd) < dateUtils.getStartOfDayTimestamp(selectionStart)
    const timeIsReversed = dateUtils.getDateHour(selectionStart) > dateUtils.getDateHour(selectionEnd)

    selected = collectMatchingDates(
      dateList,
      (time) =>
        dateUtils.isValidDate(time) &&
        dateUtils.dateIsBetween(
          dateIsReversed ? selectionEnd : selectionStart,
          time,
          dateIsReversed ? selectionStart : selectionEnd,
        ) &&
        dateUtils.timeIsBetween(
          timeIsReversed ? selectionEnd : selectionStart,
          time,
          timeIsReversed ? selectionStart : selectionEnd,
        ),
    )
  }

  return selected
}

export default square
