<h1>Segify</h1>
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

[Try on repl!](<https://segify.vercel.app/repl.html#%3Cscript%3E%0A%20%20$.count%20=%200;%0A%20%20setInterval(()%20=%3E%20%7B%0A%20%20%20%20$.count%20+=%201;%0A%20%20%7D,%201000);%0A%3C/script%3E%0A%3Cp%3E%7B%7B$.count%7D%7D%3C/p%3E%0A>)

```ts
import Component from './component.html';

const target = document.body;
new Component({}).render(target);
```

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Starting new project](#starting-new-project)
  - [Try on web.](#try-on-web)
  - [Using vite](#using-vite)
- [Counter](#counter)
- [Compiler Apis](#compiler-apis)
  - [`compile()`](#compile)
- [License](#license)

## Starting new project

```bash
npm i --save-dev segify
```

### Try on web.

[Visit repl page](https://segify.vercel.app/repl.html) to try compiler on web.

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

## Compiler Apis

### `compile()`

`segify.compile()` compiles html and returns a javascript module

```ts
import { compile } from 'segify';

const compiled = await compile(code);
```

> Warning: If an error appears saying that `client/lib.mjs` cannot be found,
> you should find [`client/lib.mjs`](https://github.com/do4ng/segify/blob/main/packages/segify/client/lib.mjs) and set `global.segify_asset` directly. - [Example](https://github.com/do4ng/segify/blob/a59a2183f68ff90decdd02055d09996eedea85d4/playground/vite.config.ts#L20)

## License

MIT
