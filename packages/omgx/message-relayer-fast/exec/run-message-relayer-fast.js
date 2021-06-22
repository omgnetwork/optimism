#!/usr/bin/env node

const main = require("../build/src/exec/run").default

;(async () => {
  await main()
})().catch((err) => {
  console.log(err)
  process.exit(1)
})
