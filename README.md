<h1>Segify</h1>

---

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

> [try on repl!](<https://segify.vercel.app/repl.html#%3Cscript%3E%0A%20%20$.count%20=%200;%0A%20%20setInterval(()%20=%3E%20%7B%0A%20%20%20%20$.count%20+=%201;%0A%20%20%7D,%201000);%0A%3C/script%3E%0A%3Cp%3E%7B%7B$.count%7D%7D%3C/p%3E%0A>)

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Starting new project](#starting-new-project)
  - [Try on web.](#try-on-web)
  - [Using vite](#using-vite)
- [Counter](#counter)
- [Compiler Apis](#compiler-apis)
  - [`compile()`](#compile)
  - [`parse()`](#parse)
- [License](#license)

## Starting new project

```bash
npm i --save-dev segify
```

### Try on web.

[Visit repl page](https://segify.vercel.app/repl.html) to try compiler on web.

### Using vite

Experience the segify compiler using the simple vite plugin.

```bash
npm i --save-dev vite-plugin-segify segify
```

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { Segify } from 'vite-plugin-segify';

export default defineConfig({
  plugins: [
    Segify({
      // compile target
      extension: '.seg',
      // client assets
      asset: {
        raw: undefined,
        location: undefined,
      },
    }),
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

> [try on repl](<https://segify.vercel.app/repl.html#%3Cscript%3E%0A%20%20$.counter%20=%200;%0A%0A%20%20function%20increase()%20%7B%0A%20%20%20%20$.counter%20+=%201;%0A%20%20%7D%0A%0A%20%20function%20decrease()%20%7B%0A%20%20%20%20$.counter%20-=%201;%0A%20%20%7D%0A%3C/script%3E%0A%0A%3Cdiv%20class=%22counter%22%3E%0A%20%20%3Ch1%20class=%22counting%22%3E%7B%7B%20$.counter%20%7D%7D%3C/h1%3E%0A%20%20%3Cdiv%3E%0A%20%20%20%20%3Cbutton%20$onclick=%22increase%22%3E+%201%3C/button%3E%0A%20%20%20%20%3Cbutton%20$onclick=%22decrease%22%3E-%201%3C/button%3E%0A%20%20%3C/div%3E%0A%3C/div%3E>)

In segify, `$` is very special.  
It works in such a way that when the value of `$` is added/updated, elements inserted through `{{}}` are updated.

> [!NOTE]
> This can be very inefficient for constants because when $ is updated, all inserted data is updated. In this case, add the `@const` prefix in front, like `{{ @const my_data }}`.

To see more examples of `$`, visit our [website](https://segify.vercel.app/#usage-s)

## Compiler Apis

### `compile()`

`segify.compile()` compiles html and returns a javascript module

```ts
import { compile } from 'segify';

const compiled = await compile(code);
```

### `parse()`

```ts
import { parse } from 'segify';

const { ast, data } = parse('<h1 id="hello">Hello World</h1>', {
  keepComment: true,
});

console.log(ast);
```

<details><summary>Output AST</summary>

> ```json
> {
>   "type": "fragment",
>   "attributes": {},
>   "children": [
>     {
>       "type": "element",
>       "tag": "h1",
>       "attributes": { "id": "hello" },
>       "children": [
>         {
>           "type": "text",
>           "attributes": {},
>           "children": [],
>           "text": "Hello World",
>           "value": null,
>           "position": { "start": -1, "end": -1 }
>         }
>       ],
>       "text": null,
>       "value": null,
>       "position": { "start": 14, "end": 30 },
>       "raw": "Hello World"
>     }
>   ],
>   "text": null,
>   "value": null,
>   "position": { "start": -1, "end": -1 }
> }
> ```

</details>

## License

MIT
