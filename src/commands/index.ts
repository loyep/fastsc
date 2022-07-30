const _rDefault = (r: any) => r.default || r;

export const commands = {
  dev: () => import('./dev').then(_rDefault),
  build: () => import('./build').then(_rDefault),
  version: () => import('./version').then(_rDefault),
};
