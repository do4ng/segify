import { readFileSync } from 'fs';
import type { Plugin } from 'vite';
import { compile } from 'segify';

export function Segify(options?: {
  asset?: {
    raw?: string;
    location?: string;
  };
  extension?: string;
}): Plugin {
  if (options && options.asset) {
    if (options.asset.location) {
      options.asset.raw = readFileSync(options.asset.location).toString();
    }

    global.segify_asset_raw = options.asset.raw || null;
  }

  if (options && options.extension.endsWith('.html')) {
    console.warn('Extension .html is not recommended.');
  }

  return {
    name: 'vite-plugin-segify',

    async transform(code, id) {
      if (!id.endsWith(options?.extension || '.seg')) return;

      code = readFileSync(id).toString();
      const compiled = await compile(code);

      return {
        code: compiled,
        map: null,
      };
    },
  };
}
