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

## Counter

Below code is a counter implementation using segify.

```html
<script lang="ts" type="text/typescript">
  $.counter = 0;

  function increase() {
    $.counter += 1;
  }

  function decrease() {
    $.counter -= 1;
  }
</script>

<div class="counter">
  <h1 class="counting">{{ $.counter }}</h1>
  <div>
    <button $onclick="increase">+ 1</button>
    <button $onclick="decrease">- 1</button>
  </div>
</div>
```

In segify, `$` is very special.  
It works in such a way that when the value of `$` is added/updated, elements inserted through `{{}}` are updated.

> Note: This can be very inefficient for constants because when $ is updated, all inserted data is updated. In this case, add the `@const` prefix in front, like `{{ @const my_data }}`.

To see more examples of `$`, visit our [website](https://segify.vercel.app/#usage-s)

## License

MIT
