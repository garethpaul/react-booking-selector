import { readFileSync } from 'fs'
import path from 'path'

const getOverviewSvg = () => readFileSync(path.join(process.cwd(), 'docs/readme-overview.svg'), 'utf8')

it('keeps the README overview aligned with the seven-day grid', () => {
  const svg = getOverviewSvg()
  const dayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

  expect(svg).toContain('role="img"')
  expect(svg).toContain('A polished preview of a seven-day booking selector grid')
  dayLabels.forEach((dayLabel) => {
    expect(svg).toContain(`>${dayLabel}</text>`)
  })
  expect(svg.match(/font-weight="700">[A-Z]{3}<\/text>/gu)).toHaveLength(dayLabels.length)
})
