import chalk from '../compiled/chalk';

export const prefixes = {
  wait: chalk.cyan('wait') + '  -',
  error: chalk.red('error') + ' -',
  fatal: chalk.red('fatal') + ' -',
  warn: chalk.yellow('warn') + '  -',
  ready: chalk.green('ready') + ' -',
  info: chalk.cyan('info') + ' -',
  event: chalk.magenta('event') + ' -',
  debug: chalk.gray('debug') + ' -',
};

export function wait(...message: any[]) {
  console.log(prefixes.wait, ...message);
  // logger.wait(message[0]);
}

export function error(...message: any[]) {
  console.error(prefixes.error, ...message);
  // logger.error(message[0]);
}

export function warn(...message: any[]) {
  console.warn(prefixes.warn, ...message);
  // logger.warn(message[0]);
}

export function ready(...message: any[]) {
  console.log(prefixes.ready, ...message);
  // logger.ready(message[0]);
}

export function info(...message: any[]) {
  console.log(prefixes.info, ...message);
  // logger.info(message[0]);
}

export function event(...message: any[]) {
  console.log(prefixes.event, ...message);
  // logger.event(message[0]);
}

export function debug(...message: any[]) {
  if (process.env.DEBUG) {
    console.log(prefixes.debug, ...message);
  }
  // logger.debug(message[0]);
}

export function fatal(...message: any[]) {
  console.error(prefixes.fatal, ...message);
  // logger.fatal(message[0]);
}
