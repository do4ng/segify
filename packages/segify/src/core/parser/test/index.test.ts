import { test, describe, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { HTMLElement, parse } from '../index';

const j = (...path: string[]): string => join(__dirname, ...path);

describe('Parser', () => {
  test('[1] Only Text', () => {
    const { ast } = parse(readFileSync(j('0.html'), 'utf-8'));

    const root = new HTMLElement({ type: 'fragment' });
    const div = new HTMLElement({ type: 'element', tag: 'div' });

    root.appendChild(
      div.appendChild(new HTMLElement({ type: 'text', text: 'Hello World!' }))
    );

    expect(ast).toEqual(root);
  });

  test('[2] Elements with attribute', () => {
    const { ast } = parse(readFileSync(j('1.html'), 'utf-8'));

    const root = new HTMLElement({ type: 'fragment' });
    const div = new HTMLElement({ type: 'element', tag: 'div' });
    const h1 = new HTMLElement({
      type: 'element',
      tag: 'h1',
      attributes: {
        id: 'hi',
      },
    });

    root.appendChild(
      div.appendChild(
        h1.appendChild(new HTMLElement({ type: 'text', text: 'Hello World!' }))
      )
    );

    expect(ast).toEqual(root);
  });

  test('[2] Elements with inserted data', () => {
    const { ast } = parse(readFileSync(j('2.html'), 'utf-8'));

    const root = new HTMLElement({ type: 'fragment' });
    const div = new HTMLElement({ type: 'element', tag: 'div' });
    const h1 = new HTMLElement({
      type: 'element',
      tag: 'h1',
      attributes: {
        id: 'hi',
      },
    });

    const data = new HTMLElement({ type: 'data' });

    data.value = '$0$';

    root.appendChild(div.appendChild(h1.appendChild(data)));

    expect(ast).toEqual(root);
  });
});
