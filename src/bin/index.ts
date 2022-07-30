#!/usr/bin/env node
require('v8-compile-cache');
import * as cli from '../cli';

cli.run().catch((e: Error) => {
  console.error(e);
  process.exit(1);
});
