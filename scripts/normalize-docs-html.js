'use strict'

const fs = require('node:fs')

const filePath = 'dist/docs/index.html'
const html = fs
  .readFileSync(filePath, 'utf8')
  .replace(/[ \t]+$/gmu, '')
  .replace(/\n+$/u, '\n')

fs.writeFileSync(filePath, html)
