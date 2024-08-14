/* eslint-disable no-unused-expressions */
/* eslint-disable no-use-before-define */
/* eslint-disable guard-for-in */

declare const $$subscribe;

interface Component {
  constructor($: any);

  $$components(): HTMLElement[];
  $$events(): void;
  $$render(parent: HTMLElement): any;
}

const $$cc = (
  t: { new ($: any): Component },
  a: Record<string, any>,
  c: HTMLElement[] = []
) => {
  a.children = c;

  const component = new t(a);

  const cs = component.$$components();

  component.$$events();

  return cs;
};

const $$ce = (t: string, a: Record<string, string>, c: HTMLElement[] = []) => {
  if (typeof t !== 'string') return $$cc(t, a, c);

  const component = document.createElement(t);

  for (const key in a) {
    component.setAttribute(key, a[key]);
  }

  for (const child of c) {
    Array.isArray(child) && child.forEach((ct) => component.appendChild(ct));
    $$isElement(child) && component.appendChild(child);
  }
  return component;
};

const $$ct = (t: string) => document.createTextNode(t);

const $$cd = (t: any, s = true) => {
  const subscriber = document.createTextNode(t());
  s && $$subscribe.push([subscriber, t]);
  return subscriber;
};

function $$isElement(element) {
  return (
    element instanceof Element ||
    element instanceof HTMLDocument ||
    element instanceof Text
  );
}

(window as any).$$$$ = {
  $$cc,
  $$ce,
  $$ct,
  $$cd,
  $$isElement,
};
