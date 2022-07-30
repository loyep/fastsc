import yParser from '../../compiled/yargs-parser';
import type { Service } from '../services/service';

export interface CommandOptions {
  name: string;
  fn: {
    ({
      args,
      api,
    }: {
      args: yParser.Arguments;
      api: Service;
    }): Promise<void> | void;
  };
}

export class Command {
  name: string;
  fn: {
    ({
      args,
      api,
    }: {
      args: yParser.Arguments;
      api: Service;
    }): Promise<void> | void;
  };

  constructor(opts: CommandOptions) {
    this.name = opts.name;
    this.fn = opts.fn;
  }
}
