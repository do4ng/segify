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
      apply: 'serve',
      async transform(code, id, options) {
        if (!id.endsWith('.html')) return;
        if (id.endsWith('index.html')) return;
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
