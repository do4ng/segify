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
    - [For Typescript](#for-typescript)
- [Counter](#counter)
- [Examples](#examples)
  - [Inserting Data](#inserting-data)
  - [Inserting Data - attribute](#inserting-data---attribute)
  - [Import Component](#import-component)
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

#### For Typescript

To prevent typescript errors, please add the code below to `src/vite-env.d.ts`.

```ts
// vite-env.d.ts
/// <reference types="vite/client" />
declare module '*.seg' {
  class Component {
    constructor(props: any);
    render(parent: HTMLElement);
  }
  export { Component, Component as default };
}
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

## Examples

### Inserting Data

```html
<script>
  let food = 'pizza';
</script>

<p>{{ food }}</p>
```

To insert data, wrap the data in `{{ }}`.

> [try on repl](https://segify.vercel.app/repl.html#%3Cscript%3E%0A%20%20let%20food%20=%20'pizza';%0A%3C/script%3E%0A%0A%3Cp%3E%7B%7B%20food%20%7D%7D%3C/p%3E)

### Inserting Data - attribute

```html
<script>
  let style = 'color: red';
</script>

<p style="{{ style }}">Hello World</p>
```

> [try on repl](https://segify.vercel.app/repl.html#%3Cscript%3E%0A%20%20let%20style%20=%20'color:%20red';%0A%3C/script%3E%0A%0A%3Cp%20style=%22%7B%7B%20style%20%7D%7D%22%3EHello%20World%3C/p%3E)

### Import Component

All components are imported as modules. You can use them like this.

```html
<!-- hello.html -->
Hello, {{ $.children }}! Foo {{ $.message }}
```

```html
<!-- index.html -->

<script lang="ts" type="text/typescript">
  import Hello from './hello.html';
</script>

<Hello message="bar">World!</Hello>
```

Attributes can be passed to the component and stored in `$`.  
`$.children` is a special attribute that contains all child elements.

## Compiler Apis

### `compile()`

`segify.compile()` compiles html and returns a javascript module

```ts
import { compile } from 'segify';

const compiled = await compile('<script>$.count = 0;</script><p>{{ $.count }}</p>');
```

<details>
<summary>Output JS code</summary>

> ```js
> var $$cc = (t, a, c = [], $$DEV_PROPS = {}) => {
>  a.children = [].concat(...c);
>  for (const key in a) {
>    if (Array.isArray(a[key]) && a[key].length === 2 && Array.isArray(a[key][0]) && typeof a[key][1] === "string") {
>       let [data, original] = a[key];
>       for (const att of data) {
>         original = original.replace(att, $$DEV_PROPS[att]());
>       }
>       a[key] = original;
>     }
>   }
>   const component = new t(a);
>   const cs = component.$$components();
>   component.$$stylesheet();
>   component.$$event();
>   return cs;
> };
> var $$ce = (t, a, c = [], $$DEV_PROPS = {}) => {
>   if (typeof t !== "string") return $$cc(t, a, c, $$DEV_PROPS);
>   const component = document.createElement(t);
>   for (const key in a) {
>     if (Array.isArray(a[key])) {
>       let [data, original] = a[key];
>       for (const att of data) {
>         original = original.replace(att, $$DEV_PROPS[att]());
>       }
>       component.setAttribute(key, original);
>     } else {
>       component.setAttribute(key, a[key]);
>     }
>   }
>   for (const child of c) {
>     Array.isArray(child) && child.forEach((ct) => {
>       component.appendChild(ct);
>     });
>     $$isElement(child) && component.appendChild(child);
>   }
>   return component;
> };
> var $$ct = (t) => document.createTextNode(t);
> var $$cd = (t, s = true, $$subscribe = []) => {
>   const returnWrapping = (v) => {
>     if (Array.isArray(v)) {
>       return v;
>     }
>     return [v];
>   };
>   const $$output = t();
>   if (Array.isArray($$output)) {
>     return returnWrapping($$output);
>   }
>   const subscriber = document.createTextNode($$output);
>   s && $$subscribe.push([subscriber, t]);
>   return returnWrapping(subscriber);
> };
> function $$isElement(element) {
>   if (window.__env__ === "ssr") {
>     return element?.__component__;
>   }
>   return element instanceof Element || element instanceof HTMLDocument || element instanceof Text;
> }
> var $$mount = (target, onMount, el) => {
>   if (target) {
>     target = el;
>   }
>   if (onMount) {
>     onMount(el);
>   }
>   return el;
> };
> window.$$$$ = {
>   $$cc,
>   $$ce,
>   $$ct,
>   $$cd,
>   $$isElement,
>   $$mount
> };
>
> /*scripts*/
>
> class Component {
>     $$subscribe=[];
>   constructor(props) {
>     var $$subscribe = [];
>     var $$events=[];
>     var $ = new Proxy(
>       {__props__: {}},
>       {
>         set(target, prop, value, receiver) {
>           target[prop] = value;
>           for (const subscriber of $$subscribe) {
>             const s = subscriber[0].nodeValue=subscriber[1]();
>           }
>           return true;
>         },
>       }
>     );
>     for (const prop of Object.keys(props)) {
>       $[prop] = props[prop];
>     }
>     this.$ = $;
>     this.$$events=$$events;
>     this.$$subscribe=$$subscribe;
>   }
>
>   $$components() {
>     const {$, $$events, $$subscribe} = this;
>     var $$DEV_PROPS={
> 	"$0$":()=>( $.count )
> };
>     this.$$DEV_PROPS=$$DEV_PROPS;
>     $.count = 0;;
>
>     return [$$ce("script",{},[], this.$$DEV_PROPS),$$ce("p",{},[...$$cd($$DEV_PROPS["$0$"],true, this.> $$subscribe)], this.$$DEV_PROPS)];
>   }
>
>   $$stylesheet() {
>     var stylesheet = document.createElement('style');
>     stylesheet.innerHTML = "";
>
>     return stylesheet;
>   }
>
>   $$event() {
>     for (const evt of this.$$events) {
>       evt[1].addEventListener(evt[0], evt[2])
>     }
>   }
>
>   render(root) {
>     document.head.appendChild(this.$$stylesheet());
>     for (const component of [].concat(...this.$$components())) {
>       $$isElement(component)&&root.appendChild(component);
>     }
>     this.$$event();
>   }
> }
> ```

</details>

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
