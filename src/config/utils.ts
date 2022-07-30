import { dirname, isAbsolute, join } from 'path';
import deepmerge from '../../compiled/deepmerge';
import resolve from '../../compiled/resolve';
import { Service } from '../services/service';

export function addExt(opts: { file: string; ext: string }) {
  const index = opts.file.lastIndexOf('.');
  return `${opts.file.slice(0, index)}${opts.ext}${opts.file.slice(index)}`;
}

export function getAbsFiles(opts: { files: string[]; cwd: string }) {
  return opts.files.map((file) => {
    return isAbsolute(file) ? file : join(opts.cwd, file);
  });
}

/**
 * parse extends option for config
 */
export function parseExtendsConfig(opts: {
  config: Record<string, any>;
  resolvePaths?: string[];
  service: Service;
}) {
  let { config } = opts;
  const { service, resolvePaths = service.configManager!.files.map(dirname) } =
    opts;

  if (config.extends) {
    let absExtendsPath = '';
    const ConfigManager: any = service.configManager!.constructor;

    // try to resolve extends path
    resolvePaths.some((dir: string) => {
      try {
        absExtendsPath = resolve.sync(config.extends, {
          basedir: dir,
          extensions: ['.js', '.ts'],
        });
        return true;
      } catch {}
    });

    if (!absExtendsPath) {
      throw new Error(`Cannot find extends config file: ${config.extends}`);
    } else if (service.configManager!.files.includes(absExtendsPath)) {
      throw new Error(
        `Cannot extends config circularly for file: ${absExtendsPath}`,
      );
    }

    // load extends config
    const { config: extendsConfig, files: extendsFiles } =
      ConfigManager.getUserConfig({ configFiles: [absExtendsPath] });

    // try to parse nested extends config
    const nestedConfig = parseExtendsConfig({
      config: extendsConfig,
      resolvePaths: [dirname(absExtendsPath)],
      service,
    });

    // merge extends config & save related files
    config = deepmerge(nestedConfig, config);
    service.configManager!.files.push(...extendsFiles);
  }

  return config;
}
