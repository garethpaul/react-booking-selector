// @flow

import { isBefore } from 'date-fns/isBefore'
import { startOfDay } from 'date-fns/startOfDay'

import * as dateUtils from '../date-utils.js'

const isDate = (time: any): boolean => time instanceof Date

const square = (selectionStart: ?Date, selectionEnd: ?Date, dateList: Array<Array<Date>>): Array<Date> => {
  let selected: Array<Date> = []
  if (selectionEnd == null) {
    if (selectionStart) selected = [selectionStart]
  } else if (selectionStart) {
    const dateIsReversed = isBefore(startOfDay(selectionEnd), startOfDay(selectionStart))
    const timeIsReversed = selectionStart.getHours() > selectionEnd.getHours()

    selected = dateList.reduce(
      (acc, dayOfTimes) =>
        Array.isArray(dayOfTimes)
          ? acc.concat(
              dayOfTimes.filter(
                (t) =>
                  isDate(t) &&
                  selectionStart &&
                  selectionEnd &&
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
