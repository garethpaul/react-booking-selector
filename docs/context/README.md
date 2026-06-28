# Repository Context

## Purpose
This repository contains a controlled React component for selecting date and time slots on a day-by-hour booking grid. It supports blocked slots, square or linear drag selection, keyboard navigation, custom colors, and custom cell rendering.

## Technology
- Main language: JavaScript/TypeScript
- Frameworks or platforms: React, styled-components
- Package/build tooling: Yarn 4, Make, Babel, ESLint, Prettier, Jest

## Important Paths
- `src/`: Primary source code
- `src/BookingSelector.js`: Main component implementation
- `src/index.js`: Package entry point
- `test/`: Test files
- `docs/`: Documentation and plans
- `package.json`: Node package metadata and scripts
- `Makefile`: Repository verification targets
- `scripts/`: Baseline checks and helper scripts

## How To Work Here
- Setup: `corepack yarn install`
- Test: `make test` or `corepack yarn test`
- Run/build: `make build` or `corepack yarn build`
- Lint: `make lint` or `corepack yarn lint`
- Full verification: `make check`

## Architecture Notes
The component is controlled - it accepts `selection`, `blocked`, and `onChange` props and renders the grid while reporting selection changes. It supports two selection schemes: square (rectangular block between start and end cells) and linear (all slots chronologically between start and end cells). The component uses JavaScript Date values in the runtime's local timezone and handles DST transitions gracefully.

## Constraints And Unknowns
- Published npm package (1.0.2) is historical and not current source
- Current source supports React 18/19 and styled-components 5/6
- Package exposes CommonJS and ESM entry points with TypeScript declarations
- No runtime dependencies - peer dependencies only
- Keyboard navigation supports arrow keys, Home/End, Ctrl+Home/Ctrl+End
- Custom cell rendering supported via `renderDateCell` prop