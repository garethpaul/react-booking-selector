const fs = require('fs')
const path = require('path')

const outputPath = path.join(process.cwd(), 'dist/lib/index.js')
const contents = `"use strict";

const BookingSelector = require("./BookingSelector.js").default;

module.exports = BookingSelector;
module.exports.BookingSelector = BookingSelector;
module.exports.default = BookingSelector;
module.exports.__esModule = true;
`

fs.writeFileSync(outputPath, contents)
