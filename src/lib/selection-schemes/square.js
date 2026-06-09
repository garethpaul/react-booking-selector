// @flow

import * as dateUtils from '../date-utils.js'

const square = (selectionStart: ?Date, selectionEnd: ?Date, dateList: Array<Array<Date>>): Array<Date> => {
  let selected: Array<Date> = []
  if (!dateUtils.isValidDate(selectionStart)) return selected

  if (selectionEnd == null) {
    selected = [selectionStart]
  } else if (dateUtils.isValidDate(selectionEnd) && Array.isArray(dateList)) {
    const dateIsReversed =
      dateUtils.getStartOfDayTimestamp(selectionEnd) < dateUtils.getStartOfDayTimestamp(selectionStart)
    const timeIsReversed = dateUtils.getDateHour(selectionStart) > dateUtils.getDateHour(selectionEnd)

    selected = dateList.reduce(
      (acc, dayOfTimes) =>
        Array.isArray(dayOfTimes)
          ? acc.concat(
              dayOfTimes.filter(
                (t) =>
                  dateUtils.isValidDate(t) &&
                  dateUtils.dateIsBetween(
                    dateIsReversed ? selectionEnd : selectionStart,
                    t,
                    dateIsReversed ? selectionStart : selectionEnd,
                  ) &&
                  dateUtils.timeIsBetween(
                    timeIsReversed ? selectionEnd : selectionStart,
                    t,
                    timeIsReversed ? selectionStart : selectionEnd,
                  ),
              ),
            )
          : acc,
      [],
    )
  }

  return selected
}

export default square
