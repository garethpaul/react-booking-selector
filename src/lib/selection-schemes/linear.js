// @flow

import { isBefore } from 'date-fns/isBefore'
import { isValid } from 'date-fns/isValid'

import * as dateUtils from '../date-utils.js'

const isValidDate = (time: any): boolean => time instanceof Date && isValid(time)

const linear = (selectionStart: ?Date, selectionEnd: ?Date, dateList: Array<Array<Date>>): Array<Date> => {
  let selected: Array<Date> = []
  if (!isValidDate(selectionStart)) return selected

  if (selectionEnd == null) {
    selected = [selectionStart]
  } else if (isValidDate(selectionEnd) && Array.isArray(dateList)) {
    const reverseSelection = isBefore(selectionEnd, selectionStart)
    selected = dateList.reduce(
      (acc, dayOfTimes) =>
        Array.isArray(dayOfTimes)
          ? acc.concat(
              dayOfTimes.filter(
                (t) =>
                  isValidDate(t) &&
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
