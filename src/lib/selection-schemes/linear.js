// @flow

import { isBefore } from 'date-fns/isBefore'

import * as dateUtils from '../date-utils.js'

const isDate = (time: any): boolean => time instanceof Date

const linear = (selectionStart: ?Date, selectionEnd: ?Date, dateList: Array<Array<Date>>): Array<Date> => {
  let selected: Array<Date> = []
  if (selectionEnd == null) {
    if (selectionStart) selected = [selectionStart]
  } else if (selectionStart) {
    const reverseSelection = isBefore(selectionEnd, selectionStart)
    selected = dateList.reduce(
      (acc, dayOfTimes) =>
        Array.isArray(dayOfTimes)
          ? acc.concat(
              dayOfTimes.filter(
                (t) =>
                  isDate(t) &&
                  selectionStart &&
                  selectionEnd &&
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
