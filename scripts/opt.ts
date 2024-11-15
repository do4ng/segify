import { join } from 'path';
import { compile } from 'serpack';
import { BuildOptions } from 'serpack/types/options';

const outdir = join(process.cwd(), 'packages', 'segify', 'dist');

const options: BuildOptions = {
  excludeNodeModules: true,
  clean: true,
  format: ['esm', 'cjs'],
  chunks: {
    name: 'chunk.[index]',
  },
  outdir,
};
compile(
  {
    './packages/segify/src/index.ts': 'index',
    './packages/segify/src/languages/export.ts': 'languages',
  },
  options
);
