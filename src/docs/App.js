// @flow

import * as React from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { createRoot } from 'react-dom/client'
import BookingSelector from '../lib'

const GlobalStyle = createGlobalStyle`
  body {
    font-family: sans-serif;
  }

  * {
    box-sizing: border-box;
  }
`

const MainDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const IntroText = styled.div`
  width: 100%;
  text-align: center;
`

const BookingSelectorCard = styled.div`
  border-radius: 8px;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.12);
  padding: 20px;
  width: 90%;
  max-width: 800px;
  & > * {
    flex-grow: 1;
  }
`

const Links = styled.div`
  display: flex;
  margin-top: 20px;
`

const ExternalLink = styled.a`
  background-color: ${props => props.color};
  color: white;
  padding: 10px;
  border-radius: 3px;
  cursor: pointer;
  text-decoration: none;
  margin: 5px;
`

type StateType = {
  schedule: Array<Date>,
  blocked: Array<Date>
}

class App extends React.Component<{}, StateType> {
  constructor() {
    super()
    this.state = {
      schedule: [],
      blocked: [
        new Date('2020-04-08T10:00:00.000-07:00'),
        new Date('2020-04-09T10:00:00.000-07:00'),
        new Date('2020-04-10T10:00:00.000-07:00')
      ]
    }
    this.save = this.save.bind(this)
  }

  handleDateChange = newSchedule => {
    this.setState({ schedule: newSchedule })
  }

  save = () => {
    const list = this.state.schedule
    console.log(list)
  }

  render(): React.Element<*> {
    return (
      <React.Fragment>
        <GlobalStyle />
        <MainDiv>
          <IntroText>
            <h1>React Booking Selector</h1>
            <p>Tap to select one time or drag to select multiple times at once.</p>
          </IntroText>
          <BookingSelectorCard>
            <BookingSelector
              startDate={new Date('2020-04-06T00:00:00.000-07:00')}
              minTime={8}
              maxTime={17}
              numDays={7}
              selection={this.state.schedule}
              blocked={this.state.blocked}
              onChange={this.handleDateChange}
            />
          </BookingSelectorCard>
          <Links>
            <ExternalLink color="#24292e" href="https://github.com/garethpaul/react-booking-selector">
              GitHub
            </ExternalLink>
            <ExternalLink color="red" onClick={this.save}>
              Save (see console.log)
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
