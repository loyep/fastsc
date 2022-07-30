import semver from '../../compiled/semver';
import { PkgType } from '../types';

export function getBabelPresetReactOpts(pkg: PkgType) {
  const reactVer = Object.assign(
    {},
    pkg.dependencies,
    pkg.peerDependencies,
  ).react;
  let opts: Record<string, any> = {};

  if (reactVer) {
    const isLTRReact17 = semver.ltr('17.0.0-0', reactVer);

    opts = {
      // use legacy jsx runtime for react@<17
      runtime: isLTRReact17 ? 'automatic' : 'classic',
      ...(isLTRReact17 ? {} : { importSource: undefined }),
    };
  }

  return opts;
}
