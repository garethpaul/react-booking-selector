import BookingSelector, {
  BookingSelector as NamedBookingSelector,
  type BookingSelectorProps,
  type BookingSelectorCssLength,
} from 'react-booking-selector'

const selection: BookingSelectorProps['selection'] = [
  new Date('2026-06-08T09:00:00.000Z'),
  '2026-06-08T10:00:00.000Z',
  { valueOf: () => new Date('2026-06-08T11:00:00.000Z').getTime() },
]
const blocked: BookingSelectorProps['blocked'] = null
const className: BookingSelectorProps['className'] = 'booking-selector-shell'
const id: BookingSelectorProps['id'] = 'booking-selector'
const style: BookingSelectorProps['style'] = { maxWidth: 480 }
const margin: BookingSelectorCssLength = '0.25rem'
const ariaLabel: BookingSelectorProps['ariaLabel'] = 'Appointment availability'
const ariaDescribedBy: BookingSelectorProps['aria-describedby'] = 'team-availability-help'
const standardAriaLabel: BookingSelectorProps['aria-label'] = 'Team appointment availability'
const ariaLabelledBy: BookingSelectorProps['aria-labelledby'] = 'team-availability-heading'

const onChange: NonNullable<BookingSelectorProps['onChange']> = (nextSelection) => {
  nextSelection.forEach((time) => {
    time.toISOString()
  })
}

void BookingSelector
void NamedBookingSelector
void selection
void blocked
void className
void id
void style
void margin
void ariaLabel
void ariaDescribedBy
void standardAriaLabel
void ariaLabelledBy
void onChange
