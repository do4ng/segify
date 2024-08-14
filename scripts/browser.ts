import { exec } from 'child_process';
import { build, BuildOptions } from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import { existsSync, readFileSync, rmSync } from 'fs';
import * as glob from 'glob';
import { dirname, join } from 'path';

const buildPkgs = glob.globSync(['packages/**/*/build.browser.json']);

console.log(buildPkgs);

for (const pkg of buildPkgs) {
  console.log(`> ${join(process.cwd(), pkg)}`);

  const config: string[] = JSON.parse(readFileSync(join(process.cwd(), pkg), 'utf-8'));
  const buildBase = dirname(pkg);

  const outdir = join(buildBase, 'dist');

  if (existsSync(outdir)) {
    rmSync(outdir, { recursive: true, force: true });
  }

  const baseConfig: BuildOptions = {
    entryPoints: config.map((entry) => join(buildBase, entry)),
    logLevel: 'info',
    platform: 'browser',

    outbase: join(buildBase, './src'),
    outdir: join(buildBase, './'),
    metafile: true,
    splitting: true,

    plugins: [nodeExternalsPlugin()],
  };

  const esmBuild = () =>
    build({
      ...baseConfig,
      format: 'esm',
      bundle: true,
      chunkNames: '[hash]',
      outExtension: { '.js': '.mjs' },
    });

  if (process.argv.includes('--dts')) {
    console.log('+ Generating .d.ts ');

    const execute = exec('tsc --emitDeclarationOnly --declaration', {
      cwd: buildBase,
    });

    execute.stderr?.on('data', (data) => console.error(data.toString()));
    execute.stdout?.on('data', (data) => console.log(data.toString()));
    execute.on('close', () => {
      console.log('+ .d.ts compilation done\n');
    });
  }

  esmBuild();
}
