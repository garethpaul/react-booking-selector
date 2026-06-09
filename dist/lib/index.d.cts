import * as React from 'react'

declare class BookingSelectorComponent extends React.Component<BookingSelectorComponent.BookingSelectorProps> {}

declare namespace BookingSelectorComponent {
  export type BookingSelectorDateValue = Date | string | number | { valueOf(): number } | null | undefined

  export type BookingSelectorDateList = ReadonlyArray<BookingSelectorDateValue> | null | undefined

  export type BookingSelectorCssLength = number | string

  export type BookingSelectorSelectionScheme = 'linear' | 'square'

  export interface BookingSelectorProps {
    selection?: BookingSelectorDateList
    blocked?: BookingSelectorDateList
    selectionScheme?: BookingSelectorSelectionScheme
    onChange?: (selection: Date[]) => void
    startDate?: Date
    numDays?: number
    minTime?: number
    maxTime?: number
    dateFormat?: string
    margin?: BookingSelectorCssLength
    unselectedColor?: string
    selectedColor?: string
    hoveredColor?: string
    blockedColor?: string
    ariaLabel?: string
    'aria-label'?: string
    renderDateCell?: (time: Date, selected: boolean, blocked: boolean) => React.ReactNode
  }

  const defaultExport: typeof BookingSelectorComponent
  export { defaultExport as default }
  export const BookingSelector: typeof BookingSelectorComponent
}

export = BookingSelectorComponent
