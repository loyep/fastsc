import * as process from 'process';
import yParser from '../compiled/yargs-parser';
import { DEV_COMMAND } from './constants';
import * as logger from './logger';
import { Service } from './services/service';
import {
  checkLocal,
  checkNodeVersion,
  setNoDeprecation,
  setNodeTitle,
} from './utils/engines';

export async function run(opts: { args?: yParser.Arguments } = {}) {
  checkNodeVersion();
  checkLocal();
  setNodeTitle();
  setNoDeprecation();

  const args =
    opts.args ??
    yParser(process.argv.slice(2), {
      alias: {
        version: ['v'],
        help: ['h'],
      },
      boolean: ['version'],
    });

  const command = args._[0] as string;
  if ([DEV_COMMAND, 'setup'].includes(command)) {
    process.env.NODE_ENV = 'development';
  } else if (command === 'build') {
    process.env.NODE_ENV = 'production';
  }
  try {
    const service = new Service({
      cwd: process.cwd(),
    });
    const name = args._[0] as string;
    await service.runCommand({ name, args });
  } catch (e: any) {
    logger.fatal(e);
    process.exit(1);
  }
}
