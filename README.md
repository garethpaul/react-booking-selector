# react-booking-selector

## Overview

`garethpaul/react-booking-selector` is a JavaScript web application or frontend sample. React Booking Selector

This README is based on the checked-in source, manifests, scripts, and repository metadata on the `master` branch. The project language mix found during review was: JavaScript (16), React TSX (1), TypeScript (1).

## Repository Contents

- `README.md` - project overview and local usage notes
- `package.json` - JavaScript dependency and script metadata
- `.vscode` - source or example code
- `SECURITY.md` - security reporting and disclosure guidance
- `src` - source or example code
- `test` - source or example code
- `VISION.md` - project direction and maintenance guardrails
- `yarn.lock` - JavaScript dependency and script metadata

Additional scan context:

- Source directories: .vscode, src, test
- Dependency and build manifests: package.json, yarn.lock
- Entry points or build surfaces: package.json
- Test-looking files: setupTests.js, test/lib/BookingSelector.test.js, test/lib/date-utils.test.js, test/lib/index.test.js, test/lib/selection-schemes/linear.test.js, test/lib/selection-schemes/square.test.js, test/types/index.tsx

## Getting Started

### Prerequisites

- Git
- Node.js and npm

### Setup

```bash
git clone https://github.com/garethpaul/react-booking-selector.git
cd react-booking-selector
npm install
```

The setup commands above are derived from repository files. Legacy mobile, Python, or JavaScript samples may require older SDKs or package versions than a modern workstation uses by default.

## Running or Using the Project

- Run `npm start` for the default development command.

Detected npm scripts:

- `npm run build` - `yarn lib:build && yarn docs:build`
- `npm run clean` - `rm -rf dist/lib dist/docs dev/docs .parcel-cache`
- `npm run clean:docs` - `rm -rf dist/docs`
- `npm run clean:lib` - `rm -rf dist/lib`
- `npm run cover` - `jest --coverage`
- `npm run docs:build` - `yarn clean:docs && BABEL_ENV=parcel NODE_ENV=production parcel build src/docs/index.html --target docs && yarn docs:normalize-html`
- `npm run docs:deploy` - `yarn docs:build && npx --yes surge@0.27.4 dist/docs --domain react-booking-selector.surge.sh`
- `npm run docs:dev` - `BABEL_ENV=parcel parcel src/docs/index.html --dist-dir dev/docs`

## Testing and Verification

- `npm test`

When the required SDK or runtime is unavailable, use static checks and source review first, then verify on a machine that has the matching platform toolchain.

## Configuration and Secrets

- No required secret or credential file was identified in the repository scan. If you add integrations later, keep secrets out of git.

## Security and Privacy Notes

- Review changes touching network requests, sockets, or service endpoints; examples from the scan include package.json, src/docs/App.js.

## Maintenance Notes

- See `SECURITY.md` for vulnerability reporting and safe research guidance.
- See `VISION.md` for project direction and contribution guardrails.

## Contributing

Keep changes small and tied to the project that is already present in this repository. For code changes, document the toolchain used, avoid committing generated dependency directories or local configuration, and update this README when setup or verification steps change.

## Existing Project Notes

Prior README summary:

> React Booking Selector <!-- README-OVERVIEW-IMAGE --> Getting Started TypeScript declarations are included for both the default export and the named `BookingSelector` export. Supported peer dependency majors are React 18 or 19, React DOM 18 or 19, and styled-components 5 or 6. `<BookingSelector />` `BookingSelector` is a controlled component that can be used with the default settings. Provide values for `selection` and `blocked`, pass an `onChange` handler, and customize the 

