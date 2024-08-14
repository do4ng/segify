import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
// eslint-disable-next-line import/no-relative-packages
import { compile } from '../packages/segify/dist/index.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const main = readFileSync(join(__dirname, './src/components/component.html'));
const app = readFileSync(join(__dirname, './src/components/app.html'));
global.segify_asset = join(__dirname, '../packages/segify/dist/client/lib.mjs');

const compiled1 = await compile(main.toString());
const compiled2 = await compile(app.toString());

writeFileSync(join(__dirname, './src/components/component.html.js'), compiled1);
writeFileSync(join(__dirname, './src/components/app.html.js'), compiled2);
