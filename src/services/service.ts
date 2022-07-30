import { join } from 'path';
import fse from '../../compiled/fs-extra';
import {
  addLoader as addBundlessLoader,
  ILoaderItem,
} from '../builder/bundless/loaders';
import {
  addTransformer as addJSTransformer,
  ITransformerItem,
} from '../builder/bundless/loaders/javascript';
import type { Command } from '../commands/command';
import { Config } from '../config/config';
import { parseExtendsConfig } from '../config/utils';
import { DEFAULT_CONFIG_FILES, FRAMEWORK_NAME } from '../constants';
import { JSTransformerTypes, PkgType } from '../types';

const _rDefault = (r: any) => r.default || r;

export function getPkg({ cwd }: { cwd: string }) {
  // get pkg from package.json
  let pkg: Record<string, string | Record<string, any>> = {};
  let pkgPath = '';
  try {
    const filePath = join(cwd, 'package.json');
    pkg = fse.readJSONSync(filePath);
    pkgPath = filePath;
  } catch (_e) {
    // APP_ROOT
    if (cwd !== process.cwd()) {
      try {
        const filePath = join(process.cwd(), 'package.json');
        pkg = fse.readJSONSync(filePath);
        pkgPath = filePath;
      } catch (_e) {
        console.error(_e);
      }
    }
  }
  return { pkg, pkgPath: pkgPath || join(cwd, 'package.json') };
}

interface ServiceOpts {
  cwd: string;
}

export class Service {
  opts: ServiceOpts;
  commands: Record<string, Command> = {};
  cwd: string;
  name?: string;
  config: Record<string, any> = {};
  userConfig: Record<string, any> = {};
  pkg: PkgType = {};
  pkgPath: string = '';
  configManager: Config | null = null;

  constructor(opts: ServiceOpts) {
    this.opts = opts;
    this.cwd = opts.cwd;
    this.commands = {
      dev: require('../commands/dev').default,
      build: require('../commands/build').default,
      version: require('../commands/version').default,
    };
  }

  public async runCommand(opts: { name: string; args?: any }) {
    let name = opts.name;
    if (opts?.args.version || name === 'v') {
      name = 'version';
    } else if (opts?.args.help || !name || name === 'h') {
      name = 'help';
    }
    const { args = {} } = opts;
    args._ = args._ || [];
    if (args._[0] === name) args._.shift();
    this.name = name;
    const { pkg, pkgPath } = getPkg({ cwd: this.cwd });
    this.pkg = pkg;
    this.pkgPath = pkgPath;
    const configManager = new Config({
      cwd: this.cwd,
      // env: this.env,
      defaultConfigFiles: DEFAULT_CONFIG_FILES,
      specifiedEnv: process.env[`${FRAMEWORK_NAME}_ENV`.toUpperCase()],
    });
    this.configManager = configManager;
    this.userConfig = configManager.getUserConfig().config;
    this.config = parseExtendsConfig({
      config: configManager.getConfig().config,
      service: this,
    });

    await this.initLoaders();
    const command = this.commands[name];
    const res = await command.fn({ args, api: this });
    return res;
  }

  async initLoaders() {
    const bundlessLoaders: ILoaderItem[] = [
      {
        id: 'js-loader',
        test: /((?<!\.d)\.ts|\.(jsx?|tsx))$/,
        loader: require.resolve('../builder/bundless/loaders/javascript'),
      },
    ];
    bundlessLoaders.forEach((l) => addBundlessLoader(l));

    // collect all bundless js transformers
    const jsTransformers: ITransformerItem[] = [
      {
        id: JSTransformerTypes.ESBUILD,
        transformer: require.resolve(
          '../builder/bundless/loaders/javascript/esbuild',
        ),
      },
    ];

    // register js transformers
    jsTransformers.forEach((t) => addJSTransformer(t));
  }
}
