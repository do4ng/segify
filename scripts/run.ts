import { exec } from 'child_process';
import { readFileSync } from 'fs';
import * as glob from 'glob';
import { dirname, join } from 'path';

const buildPkgs = glob.globSync(['packages/**/*/build.run.json']);

for (const pkg of buildPkgs) {
  console.log(`> run ${join(process.cwd(), pkg)}`);

  const config: string[] = JSON.parse(readFileSync(join(process.cwd(), pkg), 'utf-8'));
  const buildBase = dirname(pkg);

  for (const element of config) {
    const execute = exec(`node ${element}`, {
      cwd: buildBase,
    });

    execute.stderr?.on('data', (data) => console.error(data.toString()));
    execute.stdout?.on('data', (data) => console.log(data.toString()));
    execute.on('close', () => {
      console.log(`+ ${element} executed\n`);
    });
  }
}
