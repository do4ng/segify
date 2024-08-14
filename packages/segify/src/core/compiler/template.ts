import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { createRequire } from 'node:module';

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default () => {
  const require = createRequire(import.meta.url);

  if (global.segify_asset) {
    return readFileSync(global.segify_asset).toString();
  }

  // find asset file
  if (existsSync(join(__dirname, './client/lib.js'))) {
    return readFileSync(join(__dirname, './client/lib.js')).toString();
  }
  if (existsSync(join(__dirname, '../../client/lib.ts'))) {
    return readFileSync(join(__dirname, '../../../dist/client/lib.js')).toString();
  }

  try {
    if (existsSync(join(require.resolve('segify'), './client/lib.js'))) {
      return readFileSync(join(require.resolve('segify'), './client/lib.js')).toString();
    }
  } catch (e) {
    // ...
  }

  throw new Error('Cannot find asset');
};
