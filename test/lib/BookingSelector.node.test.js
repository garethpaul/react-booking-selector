/**
 * @jest-environment node
 */

import React from 'react'
import { renderToString } from 'react-dom/server'

import BookingSelector, { preventScroll } from '../../src/lib/BookingSelector'

const createSelectorInstance = () => new BookingSelector({ ...BookingSelector.defaultProps })

const withGlobalWindow = (windowValue, callback) => {
  const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window')
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: windowValue,
  })
  try {
    callback()
  } finally {
    if (windowDescriptor) {
      Object.defineProperty(globalThis, 'window', windowDescriptor)
    } else {
      delete globalThis.window
    }
  }
}

describe('BookingSelector without a browser document', () => {
  it('server-renders slot markup without browser globals', () => {
    const html = renderToString(
      React.createElement(BookingSelector, {
        startDate: new Date('2018-01-01T00:00:00.000'),
        numDays: 1,
        minTime: 9,
        maxTime: 9,
      }),
    )

    expect(html).toContain('role="group"')
    expect(html).toContain('aria-label="Booking time slots"')
    expect(html).toContain('aria-label="Available Monday, January 1, 2018 at 9 am"')
  })

  it('mounts and unmounts without document-level listener support', () => {
    const instance = createSelectorInstance()
    const cell = {
      removeEventListener: jest.fn(),
    }
    const time = new Date('2018-01-01T09:00:00.000')
    instance.cellToDate.set(cell, time)
    instance.dateToCell.set(time.getTime(), cell)
    instance.touchScrollCells.add(cell)

    expect(() => {
      instance.componentDidMount()
      instance.componentWillUnmount()
    }).not.toThrow()
    expect(cell.removeEventListener).toHaveBeenCalledWith('touchmove', preventScroll)
    expect(instance.cellToDate.size).toBe(0)
    expect(instance.dateToCell.size).toBe(0)
    expect(instance.touchScrollCells.size).toBe(0)
  })

  it('returns null for touch hit testing without a document', () => {
    const instance = createSelectorInstance()

    expect(instance.getTimeFromTouchEvent({ touches: [{ clientX: 1, clientY: 2 }] })).toBe(null)
  })

  it('returns null when the global window getter throws', () => {
    const instance = createSelectorInstance()
    const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window')
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      get() {
        throw new Error('Cannot read window')
      },
    })

    try {
      expect(instance.getDocument()).toBe(null)
      expect(instance.getTimeFromTouchEvent({ touches: [{ clientX: 1, clientY: 2 }] })).toBe(null)
    } finally {
      if (windowDescriptor) {
        Object.defineProperty(globalThis, 'window', windowDescriptor)
      } else {
        delete globalThis.window
      }
    }
  })

  it('returns null when the host document getter throws', () => {
    const instance = createSelectorInstance()
    const windowValue = {
      get document() {
        throw new Error('Cannot read document')
      },
    }

    withGlobalWindow(windowValue, () => {
      expect(instance.getTimeFromTouchEvent({ touches: [{ clientX: 1, clientY: 2 }] })).toBe(null)
    })
  })

  it('returns null when the host document is missing or malformed', () => {
    const instance = createSelectorInstance()
    const documentValues = [null, true]

    documentValues.forEach((documentValue) => {
      withGlobalWindow({ document: documentValue }, () => {
        expect(instance.getTimeFromTouchEvent({ touches: [{ clientX: 1, clientY: 2 }] })).toBe(null)
      })
    })
  })

  it('uses a valid browser document fallback when no grid document is registered', () => {
    const instance = createSelectorInstance()
    const cell = {}
    const time = new Date('2018-01-01T09:00:00.000')
    const documentValue = {
      elementFromPoint: jest.fn().mockReturnValue(cell),
    }

    instance.registerDateCell(cell, time)
    withGlobalWindow({ document: documentValue }, () => {
      expect(instance.getTimeFromTouchEvent({ touches: [{ clientX: 1, clientY: 2 }] })).toEqual(time)
    })
    expect(documentValue.elementFromPoint).toHaveBeenCalledWith(1, 2)
  })

  it('uses a valid browser document fallback when the grid owner document is malformed', () => {
    const instance = createSelectorInstance()
    const cell = {}
    const time = new Date('2018-01-01T09:00:00.000')
    const documentValue = {
      elementFromPoint: jest.fn().mockReturnValue(cell),
    }

    instance.gridRef = { ownerDocument: true }
    instance.registerDateCell(cell, time)
    withGlobalWindow({ document: documentValue }, () => {
      expect(instance.getTimeFromTouchEvent({ touches: [{ clientX: 1, clientY: 2 }] })).toEqual(time)
    })
    expect(documentValue.elementFromPoint).toHaveBeenCalledWith(1, 2)
  })

  it('uses a valid browser document fallback when the grid owner document getter throws', () => {
    const instance = createSelectorInstance()
    const cell = {}
    const time = new Date('2018-01-01T09:00:00.000')
    const gridRef = {}
    const documentValue = {
      elementFromPoint: jest.fn().mockReturnValue(cell),
    }
    Object.defineProperty(gridRef, 'ownerDocument', {
      get() {
        throw new Error('Cannot read owner document')
      },
    })

    instance.gridRef = gridRef
    instance.registerDateCell(cell, time)
    withGlobalWindow({ document: documentValue }, () => {
      expect(instance.getTimeFromTouchEvent({ touches: [{ clientX: 1, clientY: 2 }] })).toEqual(time)
    })
    expect(documentValue.elementFromPoint).toHaveBeenCalledWith(1, 2)
  })
})
