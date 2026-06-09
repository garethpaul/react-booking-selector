/**
 * @jest-environment node
 */

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
})
