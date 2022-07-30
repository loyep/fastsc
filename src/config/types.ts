export enum BundlessTypes {
  ESM = 'esm',
  CJS = 'cjs',
}

export enum BuildTypes {
  BUNDLE = 'bundle',
  BUNDLESS = 'bundless',
}

export enum JSTransformerTypes {
  BABEL = 'babel',
  ESBUILD = 'esbuild',
}

export enum PlatformTypes {
  NODE = 'node',
  BROWSER = 'browser',
}

type IBabelPlugin =
  | Function
  | string
  | [
      string,
      {
        [key: string]: any;
      },
    ];

export interface FastscBaseConfig {
  /**
   * compile platform
   * @default browser
   */
  platform?: `${PlatformTypes}`;

  /**
   * define global constants for source code, like webpack
   */
  define?: Record<string, string>;

  /**
   * configure module resolve alias, like webpack
   */
  alias?: Record<string, string>;

  /**
   * configure extra babel presets
   */
  extraBabelPresets?: IBabelPlugin[];

  /**
   * configure extra babel plugins
   */
  extraBabelPlugins?: IBabelPlugin[];
}

export interface FastscConfig extends FastscBaseConfig {
  extends?: string;

  /**
   * bundler config (umd)
   */
  umd?: FastscBundleConfig;

  /**
   * transformer config (esm)
   */
  esm?: FastscBundlessConfig & {
    /**
     * output directory
     * @default dist/esm
     */
    output?: string;
  };

  /**
   * transformer config (cjs)
   */
  cjs?: FastscBundlessConfig & {
    /**
     * output directory
     * @default dist/cjs
     */
    output?: string;
  };
}

export interface FastscBundlessConfig extends FastscBaseConfig {
  /**
   * source code directory
   * @default src
   */
  input?: string;

  /**
   * output directory
   */
  output?: string;

  /**
   * specific transformer
   * @note  father will auto-select transformer by default (babel for browser files, esbuild for node files)
   */
  transformer?: `${JSTransformerTypes}`;

  /**
   * override config for each sub-directory or file via key-value
   */
  overrides?: Record<
    string,
    Omit<FastscBundlessConfig, 'input'> & FastscBaseConfig
  >;

  /**
   * ignore specific directories & files via ignore syntax
   */
  ignores?: string[];
}

export interface FastscBundleConfig extends FastscBaseConfig {
  /**
   * bundle entry config
   * @default src/index.{js,ts,jsx,tsx}
   * @note    support to override config for each entry via key-value
   */
  entry?:
    | string
    | Record<string, Omit<FastscBundleConfig, 'entry'> & FastscBaseConfig>;

  /**
   * bundle output path
   * @default dist/umd
   */
  output?: string;

  /**
   * external dependencies
   */
  externals?: Record<string, string>;
}
