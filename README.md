# segify

segify is a **compiler** that helps you create interactive and super fast web pages.
It compiles vanilla HTML code into vanilla JavaScript modules (which has no dependencies!)

```html
<!-- component.html -->
<script>
  $.count = 0;
  setInterval(() => {
    $.count += 1;
  }, 1000);
</script>

<p>{{ $.count }}</p>
```

```ts
import Component from './component.html';

const target = document.body;
new Component({}).render(target);
```

## Starting new project

```bash
npm i --save-dev segify
```

### Using vite

Experience the segify compiler using the simple vite plugin.

(The vite plugin package will be released soon!)

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { compile } from 'segify';
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
```
