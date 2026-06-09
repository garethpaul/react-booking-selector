// @flow

import * as React from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { createRoot } from 'react-dom/client'
import BookingSelector from '../lib'

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    color: #111827;
    background: #f8fafc;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  * {
    box-sizing: border-box;
  }
`

const MainDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 32px 16px 40px;
`

const IntroText = styled.div`
  width: 100%;
  max-width: 760px;
  text-align: center;
  h1 {
    margin: 0;
    font-size: 32px;
    line-height: 1.15;
  }
  @media (max-width: 699px) {
    h1 {
      font-size: 30px;
    }
  }
`

const StatusText = styled.p`
  margin: 18px 0 18px;
  color: #475569;
  font-size: 15px;
  line-height: 1.4;
`

const BookingSelectorCard = styled.div`
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.12);
  padding: 22px;
  width: 90%;
  max-width: 800px;
  & > * {
    flex-grow: 1;
  }
  @media (max-width: 699px) {
    width: 100%;
    padding: 16px 14px;
  }
`

const Links = styled.div`
  display: flex;
  margin-top: 24px;
`

const ExternalLink = styled.a`
  background-color: ${(props) => props.$color};
  color: white;
  padding: 10px 12px;
  border-radius: 3px;
  cursor: pointer;
  text-decoration: none;
  margin: 5px;
  &:focus {
    outline: none;
  }
  &:focus-visible {
    outline: 2px solid #599af2;
    outline-offset: 3px;
  }
`

type StateType = {
  schedule: Array<Date>,
  blocked: Array<Date>,
}

const getDemoDate = (day: number, hour: number = 0): Date => new Date(2020, 3, day, hour)

export class App extends React.Component<{}, StateType> {
  constructor() {
    super()
    this.state = {
      schedule: [],
      blocked: [getDemoDate(8, 10), getDemoDate(9, 10), getDemoDate(10, 10)],
    }
  }

  handleDateChange = (newSchedule) => {
    this.setState({ schedule: newSchedule })
  }

  render(): React.Element<*> {
    const selectedCount = this.state.schedule.length
    const blockedCount = this.state.blocked.length

    return (
      <React.Fragment>
        <GlobalStyle />
        <MainDiv as="main">
          <IntroText>
            <h1>React Booking Selector</h1>
            <StatusText aria-atomic="true" aria-live="polite" role="status">
              {selectedCount} selected - {blockedCount} blocked
            </StatusText>
          </IntroText>
          <BookingSelectorCard>
            <BookingSelector
              startDate={getDemoDate(6)}
              minTime={8}
              maxTime={17}
              numDays={7}
              selection={this.state.schedule}
              blocked={this.state.blocked}
              onChange={this.handleDateChange}
            />
          </BookingSelectorCard>
          <Links>
            <ExternalLink
              $color="#24292e"
              aria-label="GitHub repository, opens in a new tab"
              href="https://github.com/garethpaul/react-booking-selector"
              rel="noopener noreferrer"
              target="_blank"
            >
              GitHub
            </ExternalLink>
          </Links>
        </MainDiv>
      </React.Fragment>
    )
  }
}

const container = document.getElementById('app')
if (container) {
  createRoot(container).render(<App />)
}
