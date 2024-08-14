import { defineConfig } from 'vite';
import { compile } from '../packages/segify/src/';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

let index = 0;

export default defineConfig({
  build: {
    rollupOptions: {
      input: './index.html',
    },
  },
  base: './',

  plugins: [
    {
      name: 'segify',
      async transform(code, id, options) {
        global.segify_asset = join(__dirname, '../packages/segify/dist/client/lib.mjs');

        if (!id.endsWith('.seg')) return;
        code = readFileSync(id).toString();
        const compiled = await compile(code);

        return {
          code: compiled,
          map: null,
        };
      },
    },
  ],
});
