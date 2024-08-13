import { defineConfig } from 'vite';
import { compile } from '../packages/segify/src/';
import { readFileSync } from 'fs';

export default defineConfig({
  assetsInclude: ['**/*.html'],
  plugins: [
    {
      name: 'segify',
      async transform(code, id, options) {
        if (!id.endsWith('.html')) return;
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
