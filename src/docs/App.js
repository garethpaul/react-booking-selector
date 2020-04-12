// @flow

import * as React from 'react'
import styled, { injectGlobal } from 'styled-components'
// eslint-disable-next-line
import * as ReactDOM from 'react-dom'
import BookingSelector from '../lib'

// eslint-disable-next-line
injectGlobal`
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
  border-radius: 25px;
  box-shadow: 10px 2px 30px rgba(0, 0, 0, 0.15);
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
  schedule: Array<Date>
}

class App extends React.Component<{}, StateType> {
  constructor() {
    super()
    this.state = {
      schedule: [],
      blocked: [
        'Wed Apr 08 2020 10:00:00 GMT-0700 (Pacific Daylight Time)',
        'Thu Apr 09 2020 10:00:00 GMT-0700 (Pacific Daylight Time)',
        'Fri Apr 10 2020 10:00:00 GMT-0700 (Pacific Daylight Time)'
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
      <MainDiv>
        <IntroText>
          <h1>React Booking Selector</h1>
          <p>Tap to select one time or drag to select multiple times at once.</p>
        </IntroText>
        <BookingSelectorCard>
          <BookingSelector
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
    )
  }
}

// flow-disable-next-line
ReactDOM.render(<App />, document.getElementById('app'))
