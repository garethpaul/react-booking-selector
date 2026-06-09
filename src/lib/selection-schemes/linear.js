// @flow

import * as dateUtils from '../date-utils.js'

const linear = (selectionStart: ?Date, selectionEnd: ?Date, dateList: Array<Array<Date>>): Array<Date> => {
  let selected: Array<Date> = []
  if (!dateUtils.isValidDate(selectionStart)) return selected

  if (selectionEnd == null) {
    selected = [selectionStart]
  } else if (dateUtils.isValidDate(selectionEnd) && Array.isArray(dateList)) {
    const reverseSelection = dateUtils.getDateTimestamp(selectionEnd) < dateUtils.getDateTimestamp(selectionStart)
    selected = dateList.reduce(
      (acc, dayOfTimes) =>
        Array.isArray(dayOfTimes)
          ? acc.concat(
              dayOfTimes.filter(
                (t) =>
                  dateUtils.isValidDate(t) &&
                  dateUtils.dateHourIsBetween(
                    reverseSelection ? selectionEnd : selectionStart,
                    t,
                    reverseSelection ? selectionStart : selectionEnd,
                  ),
              ),
            )
          : acc,
      [],
    )
  }
  return selected
}

export default linear
