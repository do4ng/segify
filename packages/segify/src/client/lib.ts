/* eslint-disable no-unused-expressions */
/* eslint-disable no-use-before-define */
/* eslint-disable guard-for-in */

declare const $$subscribe;

interface Component {
  constructor($: any);

  $$components(): HTMLElement[];
  $$events(): void;
  $$stylesheet(): void;
  $$render(parent: HTMLElement): any;
}

const $$cc = (
  t: { new ($: any): Component },
  a: Record<string, any>,
  c: HTMLElement[] = []
) => {
  a.children = c;

  for (const key in a) {
    if (Array.isArray(a[key])) {
      // eslint-disable-next-line prefer-const
      let [data, original]: [string[], string] = a[key] as any;

      for (const att of data) {
        original = original.replace(att, $$DEV_PROPS[att]());
      }

      a[key] = original;
    }
  }

  const component = new t(a);

  const cs = component.$$components();

  component.$$stylesheet();
  component.$$events();

  return cs;
};
declare const $$DEV_PROPS: any;

const $$ce = (t: string, a: Record<string, string | []>, c: HTMLElement[] = []) => {
  if (typeof t !== 'string') return $$cc(t, a, c);

  const component = document.createElement(t);

  for (const key in a) {
    if (Array.isArray(a[key])) {
      // eslint-disable-next-line prefer-const
      let [data, original]: [string[], string] = a[key] as any;

      console.log(data, original, $$DEV_PROPS);

      for (const att of data) {
        original = original.replace(att, $$DEV_PROPS[att]());
      }

      component.setAttribute(key, original);
    } else {
      component.setAttribute(key, a[key]);
    }
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
