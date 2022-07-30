export {
  BuildTypes,
  BundlessTypes,
  FastscBaseConfig,
  FastscBundleConfig,
  FastscBundlessConfig,
  FastscConfig,
  JSTransformerTypes,
  PlatformTypes,
} from './config/types';

export type PkgType = {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: any;
};
