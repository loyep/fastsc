import { join } from 'path';

const ROOT = join(__dirname, '../../');

export const PATHS = {
  ROOT,
  EXAMPLES: join(ROOT, './examples'),
  JEST_CONFIG: join(ROOT, './jest.config.ts'),
};

export const examplesDir = PATHS.ROOT;
