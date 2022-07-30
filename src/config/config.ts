import path from 'path';
import esbuild from '../../compiled/esbuild';
import fse from '../../compiled/fs-extra';
import lodash from '../../compiled/lodash';
import { DEFAULT_CONFIG_FILES } from '../constants';
import * as register from '../register';
import type { FastscConfig } from './types';
import { addExt, getAbsFiles } from './utils';

export function defineConfig(config: FastscConfig) {
  return config;
}

type ISchema = Record<string, any>;

function getUserConfig(configFiles: string[]) {
  let config = {};
  const files: string[] = [];

  for (const configFile of configFiles) {
    if (fse.existsSync(configFile)) {
      register.register({
        implementor: esbuild,
      });
      register.clearFiles();
      config = lodash.merge(config, require(configFile).default);
      for (const file of register.getFiles()) {
        delete require.cache[file];
      }
      // includes the config File
      files.push(...register.getFiles());
      register.restore();
    } else {
      files.push(configFile);
    }
  }
  return {
    config: config as FastscConfig,
    files,
  };
}

export async function loadConfig(): Promise<FastscConfig> {
  const { config } = getUserConfig(
    getAbsFiles({
      files: DEFAULT_CONFIG_FILES,
      cwd: process.cwd(),
    }),
  );
  return config;
}

interface IOpts {
  cwd: string;
  // env: Env;
  specifiedEnv?: string;
  defaultConfigFiles?: string[];
}

export class Config {
  public opts: IOpts;
  public mainConfigFile: string | null;
  public prevConfig: any;
  public files: string[] = [];

  constructor(opts: IOpts) {
    this.opts = opts;
    this.mainConfigFile = Config.getMainConfigFile(this.opts);
    this.prevConfig = null;
  }

  getConfig(opts: { schemas?: ISchema } = {}) {
    const { config, files } = this.getUserConfig();
    // Config.validateConfig({ config, schemas: opts.schemas });
    this.files = files;
    return (this.prevConfig = {
      config: config,
      files,
    });
  }

  // watch(opts: {
  //   schemas: ISchema;
  //   onChangeTypes: IOnChangeTypes;
  //   onChange: (opts: {
  //     data: ReturnType<typeof Config.diffConfigs>;
  //     event: string;
  //     path: string;
  //   }) => Promise<void>;
  // }) {
  //   const watcher = chokidar.watch(
  //     [
  //       ...this.files,
  //       ...(this.mainConfigFile
  //         ? []
  //         : getAbsFiles({
  //           files: this.opts.defaultConfigFiles || configFiles,
  //           cwd: this.opts.cwd,
  //         })),
  //     ],
  //     {
  //       ignoreInitial: true,
  //       cwd: this.opts.cwd,
  //     },
  //   );
  //   watcher.on(
  //     'all',
  //     lodash.debounce((event, path) => {
  //       const { config: origin } = this.prevConfig;
  //       const { config: updated, files } = this.getConfig({
  //         schemas: opts.schemas,
  //       });
  //       watcher.add(files);
  //       const data = Config.diffConfigs({
  //         origin,
  //         updated,
  //         onChangeTypes: opts.onChangeTypes,
  //       });
  //       opts
  //         .onChange({
  //           data,
  //           event,
  //           path,
  //         })
  //         .catch((e) => {
  //           throw new Error(e);
  //         });
  //     }, WATCH_DEBOUNCE_STEP),
  //   );
  //   return () => watcher.close();
  // }

  static getMainConfigFile(opts: {
    cwd: string;
    defaultConfigFiles?: string[];
  }) {
    let mainConfigFile = null;
    for (const configFile of opts.defaultConfigFiles || DEFAULT_CONFIG_FILES) {
      const absConfigFile = path.join(opts.cwd, configFile);
      if (fse.existsSync(absConfigFile)) {
        mainConfigFile = absConfigFile;
        break;
      }
    }
    return mainConfigFile;
  }

  static getConfigFiles(opts: {
    mainConfigFile: string | null;
    // env: Env;
    specifiedEnv?: string;
  }) {
    const ret: string[] = [];
    const { mainConfigFile } = opts;
    const specifiedEnv = opts.specifiedEnv || '';
    if (mainConfigFile) {
      ret.push(
        ...[
          mainConfigFile,
          specifiedEnv &&
            addExt({ file: mainConfigFile, ext: `.${specifiedEnv}` }),
          addExt({ file: mainConfigFile, ext: '.local' }),
        ].filter(Boolean),
      );
    }
    return ret;
  }

  getUserConfig() {
    const configFiles = Config.getConfigFiles({
      mainConfigFile: this.mainConfigFile,
      // env: this.opts.env,
      specifiedEnv: this.opts.specifiedEnv,
    });
    return Config.getUserConfig({
      configFiles: getAbsFiles({
        files: configFiles,
        cwd: this.opts.cwd,
      }),
    });
  }

  static getUserConfig(opts: { configFiles: string[] }) {
    let config = {};
    const files: string[] = [];

    for (const configFile of opts.configFiles) {
      if (fse.existsSync(configFile)) {
        register.register({
          implementor: esbuild,
        });
        register.clearFiles();
        config = lodash.merge(config, require(configFile).default);
        for (const file of register.getFiles()) {
          delete require.cache[file];
        }
        // includes the config File
        files.push(...register.getFiles());
        register.restore();
      } else {
        files.push(configFile);
      }
    }

    return {
      config,
      files,
    };
  }

  static validateConfig(opts: { config: any; schemas: ISchema }) {
    //     const errors = new Map<string, Error>();
    //     const configKeys = new Set(Object.keys(opts.config));
    //     for (const key of Object.keys(opts.schemas)) {
    //       configKeys.delete(key);
    //       if (!opts.config[key]) continue;
    //       const schema = opts.schemas[key](joi);
    //       // invalid schema
    //       assert(joi.isSchema(schema), `schema for config ${key} is not valid.`);
    //       const { error } = schema.validate(opts.config[key]);
    //       if (error) errors.set(key, error);
    //     }
    //     // invalid config values
    //     assert(
    //       errors.size === 0,
    //       `Invalid config values: ${Array.from(errors.keys()).join(', ')}
    // ${Array.from(errors.keys()).map((key) => {
    //         return `Invalid value for ${key}:\n${errors.get(key)!.message}`;
    //       })}`,
    //     );
    //     // invalid config keys
    //     assert(
    //       configKeys.size === 0,
    //       `Invalid config keys: ${Array.from(configKeys).join(', ')}`,
    //     );
  }

  // static diffConfigs(opts: {
  //   origin: any;
  //   updated: any;
  //   onChangeTypes: IOnChangeTypes;
  // }) {
  //   const patch = diff(opts.origin, opts.updated);
  //   const changes: Record<string, string[]> = {};
  //   const fns: Function[] = [];
  //   for (const item of patch) {
  //     const key = item.path[0];
  //     const onChange = opts.onChangeTypes[key];
  //     assert(onChange, `Invalid onChange config for key ${key}`);
  //     if (typeof onChange === 'string') {
  //       changes[onChange] ||= [];
  //       changes[onChange].push(String(key));
  //     } else if (typeof onChange === 'function') {
  //       fns.push(onChange);
  //     } else {
  //       throw new Error(`Invalid onChange value for key ${key}`);
  //     }
  //   }
  //   return {
  //     changes,
  //     fns,
  //   };
  // }
}
