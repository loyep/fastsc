#!/usr/bin/env node
require('v8-compile-cache');
const cli = require('./cli');

cli.run().catch((e: Error) => {
  console.error(e);
  process.exit(1);
});
