# Segify

A lightweight, compiler that transforms vanilla HTML into interactive and dependency-free JavaScript modules.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- ⚡ Super fast compilation
- 🎯 Simple syntax with reactive `$` state
- 📦 Works with Vite out of the box

## Quick Start

### Installation

```bash
npm i --save-dev segify
```

Or try it out in the [REPL](https://segify.vercel.app/repl.html).

### Basic Example

```html
<!-- counter.html -->
<script>
  $.count = 0;

  function increment() {
    $.count += 1;
  }
</script>

<div>
  <p>Count: {{ $.count }}</p>
  <button $onclick="increment">Add</button>
</div>
```

```ts
import Counter from './counter.html';

const app = new Counter({});
app.render(document.body);
```

[Try this example in the REPL](https://segify.vercel.app/repl.html)

## Documentation

### State Management

Segify uses the special `$` object for reactive state management:

```html
<script>
  // Reactive state
  $.user = {
    name: 'John',
    age: 25,
  };

  // Updates will trigger re-renders
  function updateName(newName) {
    $.user.name = newName;
  }
</script>

<div>
  <h2>{{ $.user.name }}</h2>
  <p>Age: {{ $.user.age }}</p>
</div>
```

### Component Props

Components can receive props from their parent:

```html
<!-- UserCard.html -->
<div class="user-card">
  <h3>{{ $.name }}</h3>
  <p>{{ $.role }}</p>
  <div class="content">{{ $.children }}</div>
</div>
```

```html
<!-- App.html -->
<script>
  import UserCard from './UserCard.seg';
</script>

<UserCard name="Alice" role="Developer">
  <p>Custom content goes here</p>
</UserCard>
```

### Performance Optimization

Use `@const` for non-reactive content:

```html
<script>
  $.staticData = "This won't change";
  $.dynamicData = 'This will update';
</script>

<!-- Won't trigger re-renders -->
<h1>{{ @const $.staticData }}</h1>

<!-- Will update when $.dynamicData changes -->
<p>{{ $.dynamicData }}</p>
```

## API Reference

### Compiler API

#### `compile(source: string, options?: CompileOptions): Promise<string>`

Compiles HTML source into a JavaScript module.

```ts
import { compile } from 'segify';

const js = await compile(`
  <script>
    $.message = 'Hello';
  </script>
  <h1>{{ $.message }}</h1>
`);
```

Options:

- `keepComments?: boolean` - Preserve HTML comments
- `filename?: string` - Source filename for better error messages
- `sourceMap?: boolean` - Generate source maps

#### `parse(source: string, options?: ParseOptions)`

Parses HTML into an AST (Abstract Syntax Tree).

```ts
import { parse } from 'segify';

const { ast, data } = parse('<div>Hello</div>');
```

### Vite Plugin

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { Segify } from 'vite-plugin-segify';

export default defineConfig({
  plugins: [
    Segify({
      extension: '.seg',
      asset: {
        raw: undefined,
        location: undefined,
      },
    }),
  ],
});
```

## TypeScript Support

Add type definitions for your components:

```ts
// vite-env.d.ts
declare module '*.seg' {
  class Component {
    constructor(props: Record<string, any>);
    render(parent: HTMLElement): void;
  }
  export { Component, Component as default };
}
```

## License

MIT
