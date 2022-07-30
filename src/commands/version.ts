import { Command } from './command';

const version = new Command({
  name: 'version',
  fn({ args }) {
    const version = require('../../package.json').version;
    if (!args.quiet) {
      console.log(`fastsc@${version}`);
    }
    return version;
  },
});

export default version;
