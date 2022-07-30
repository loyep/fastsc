import path from 'path';
// @ts-ignore
import { transform } from '../../../../../compiled/@babel/core';
import { BundlessTypes, PlatformTypes } from '../../../../types';
import { winPath } from '../../../../utils/winPath';
import { getBabelPresetReactOpts } from '../../../utils';
import type { IJSTransformer } from '../types';

/**
 * parse for stringify define value, use to babel-plugin-transform-define
 */
function getParsedDefine(define: Record<string, string>) {
  return Object.entries(define).reduce<typeof define>(
    (result, [name, value]) => ({
      ...result,
      [name]: JSON.parse(value),
    }),
    {},
  );
}

/**
 * babel transformer
 */
const babelTransformer: IJSTransformer = function (content) {
  const {
    extraBabelPlugins = [],
    extraBabelPresets = [],
    define,
    alias: oAlias = {},
  } = this.config;
  const presetOpts: any = {
    presetEnv: {
      targets:
        this.config.platform === PlatformTypes.BROWSER
          ? { ie: 11 }
          : { node: 14 },
      modules: this.config.format === BundlessTypes.ESM ? false : 'auto',
    },
    presetReact: getBabelPresetReactOpts(this.pkg),
    presetTypeScript: {},
  };

  // transform alias to relative path for babel-plugin-module-resolver
  const alias = Object.entries(oAlias).reduce<typeof oAlias>(
    (result, [name, target]) => {
      if (path.isAbsolute(String(target))) {
        result[name] = winPath(path.relative(this.paths.cwd, target));

        // prefix . for same-level path
        if (!result[name].startsWith('.')) {
          result[name] = `./${result[name]}`;
        }
      } else {
        result[name] = target;
      }

      return result;
    },
    {},
  );

  if (this.pkg.dependencies?.['@babel/runtime']) {
    presetOpts.pluginTransformRuntime = {
      absoluteRuntime: false,
      version: this.pkg.dependencies?.['@babel/runtime'],
    };
  }
  // TODO: recommend install @babel/runtime in doctor

  return transform(content, {
    filename: this.paths.fileAbsPath,
    cwd: this.paths.cwd,
    babelrc: false,
    presets: [
      [require.resolve('@umijs/babel-preset-umi'), presetOpts],
      ...extraBabelPresets,
    ],
    plugins: [
      [
        require.resolve('babel-plugin-module-resolver'),
        {
          alias: alias,
          cwd: this.paths.cwd,
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.json'],
        },
      ],
      ...(define
        ? [
            [
              require.resolve('babel-plugin-transform-define'),
              getParsedDefine(define),
            ],
          ]
        : []),
      ...extraBabelPlugins,
    ],
  })!.code!;
};

export default babelTransformer;
