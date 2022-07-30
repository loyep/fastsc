import builder from '../builder';
import { Command } from './command';

const build = new Command({
  name: 'build',
  async fn({ args, api }) {
    await builder({
      userConfig: api.config,
      cwd: api.cwd,
      pkg: api.pkg,
      clean: args.clean,
      quiet: args.quiet ?? true,
    });
  },
});

export default build;
