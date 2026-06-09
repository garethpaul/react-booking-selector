// @flow

import { isBefore } from 'date-fns/isBefore'
import { isValid } from 'date-fns/isValid'
import { startOfDay } from 'date-fns/startOfDay'

import * as dateUtils from '../date-utils.js'

const isValidDate = (time: any): boolean => time instanceof Date && isValid(time)

const square = (selectionStart: ?Date, selectionEnd: ?Date, dateList: Array<Array<Date>>): Array<Date> => {
  let selected: Array<Date> = []
  if (!isValidDate(selectionStart)) return selected

  if (selectionEnd == null) {
    selected = [selectionStart]
  } else if (isValidDate(selectionEnd) && Array.isArray(dateList)) {
    const dateIsReversed = isBefore(startOfDay(selectionEnd), startOfDay(selectionStart))
    const timeIsReversed = selectionStart.getHours() > selectionEnd.getHours()

    selected = dateList.reduce(
      (acc, dayOfTimes) =>
        Array.isArray(dayOfTimes)
          ? acc.concat(
              dayOfTimes.filter(
                (t) =>
                  isValidDate(t) &&
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
