// packages/segify/src/client/lib.ts
var $$cc = (t, a, c = []) => {
  a.children = c;
  const component = new t(a);
  return component.$$components();
};
var $$ce = (t, a, c = []) => {
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
var $$ct = (t) => document.createTextNode(t);
var $$cd = (t, s = true) => {
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
window.$$$$ = {
  $$cc,
  $$ce,
  $$ct,
  $$cd,
  $$isElement,
};

var $ = new Proxy(
  { __props__: {} },
  {
    set(target, prop, value, receiver) {
      target[prop] = value;
      for (const subscriber of $$subscribe) {
        const s = (subscriber[0].nodeValue = subscriber[1]());
      }
      return true;
    },
  }
);
var $$subscribe = [];
var $$events = [];
/*scripts*/
import { example1, example2 } from '../lib';
$.count = 0;
setInterval(() => {
  $.count += 1;
}, 1000);
$.count = 0;
setInterval(() => {
  $.count += 1;
}, 1000);
const example$ = `<script>
    $.count = 0;
    setInterval(() => {
      $.count += 1;
    }, 1000);
  </script>
  <p>{{$.count}}</p>
  `;

var $$DEV_PROPS = {
  $0$: () => $.count,
  $1$: () => '$',
  $2$: () => '$',
  $3$: () => '$',
  $4$: () => '$',
  $5$: () => '$',
  $6$: () => example$,
  $7$: () => $.count,
  $8$: () => example1,
  $9$: () => example2,
  $10$: () => '$',
};
class Component {
  constructor(props) {
    for (const prop of Object.keys(props)) {
      $[prop] = props[prop];
    }
  }

  $$components() {
    return [
      $$ce('script', { lang: 'ts', type: 'text/typescript' }, []),
      $$ce('div', { class: 'main' }, [
        $$ce('h2', { id: 'what-is-segify' }, [
          $$ce('a', { href: '#what-is-segify' }, [$$ct('#')]),
          $$ct('What is segify?'),
        ]),
        $$ct('\r\n  segify is a '),
        $$ce('b', {}, [$$ct('compiler')]),
        $$ct(' that helps you create interactive and super fast web\r\n  pages.'),
        $$ce('br', {}, []),
        $$ct(
          '\r\n  It compiles vanilla HTML code into vanilla JavaScript modules (which has no\r\n  dependencies!)\r\n\r\n  '
        ),
        $$ce('h2', { id: 'usage' }, [
          $$ce('a', { href: '#usage' }, [$$ct('#')]),
          $$ct('How to use?'),
        ]),
        $$ct('\r\n  Visit '),
        $$ce('a', { href: 'https://github.com/do4ng/segify' }, [$$ct('our repository')]),
        $$ct(' to learn segify!\r\n\r\n  '),
        $$ce('h2', { id: 'usage-s' }, [
          $$ce('a', { href: '#usage-s' }, [$$ct('#')]),
          $$ct('What is "'),
          $$cd($$DEV_PROPS['$1$'], false),
          $$ct('"?'),
        ]),
        $$ct('\r\n  In HTML files compiled with segify, the `'),
        $$cd($$DEV_PROPS['$2$'], false),
        $$ct('`(dollar sign) plays a very\r\n  important role.'),
        $$ce('br', {}, []),
        $$ct('\r\n  `'),
        $$cd($$DEV_PROPS['$3$'], false),
        $$ct('` serves as '),
        $$ce('b', {}, [$$ct('"state"')]),
        $$ct(' in other frameworks.'),
        $$ce('br', {}, []),
        $$ce('br', {}, []),
        $$ct('\r\n  `'),
        $$cd($$DEV_PROPS['$4$'], false),
        $$ct(
          '` is an object that can be used publicly within one page, and it works\r\n  in such a way that modifying the value of `'
        ),
        $$cd($$DEV_PROPS['$5$'], false),
        $$ct('` updates HTML DOM.\r\n\r\n  '),
        $$ce('pre', {}, [$$ce('code', {}, [$$cd($$DEV_PROPS['$6$'], false)])]),
        $$ce('div', { class: 'result' }, [
          $$ce('p', {}, [$$cd($$DEV_PROPS['$7$'], true)]),
        ]),
        $$ce('h2', { id: 'examples' }, [
          $$ce('a', { href: '#examples' }, [$$ct('#')]),
          $$ct('Examples'),
        ]),
        $$ce('h3', {}, [$$ct('Example 1 - Basic')]),
        $$ce('li', {}, [$$ct('Input (.html)')]),
        $$ce('pre', {}, [$$ce('code', {}, [$$cd($$DEV_PROPS['$8$'], false)])]),
        $$ce('li', {}, [$$ct('Output (.html)')]),
        $$ce('div', { class: 'result' }, [$$ce('div', {}, [$$ct('Hello World!')])]),
        $$ce('h3', {}, [$$ct('Example 2 - Inserting Data')]),
        $$ce('li', {}, [$$ct('Input (.html)')]),
        $$ce('pre', {}, [$$ce('code', {}, [$$cd($$DEV_PROPS['$9$'], false)])]),
        $$ce('div', { class: 'tip' }, [
          $$ce('h4', {}, [$$ct('TIP')]),
          $$ce('p', {}, [
            $$ct('\r\n      Inserted data is updated whenever '),
            $$cd($$DEV_PROPS['$10$'], false),
            $$ct(
              ' is updated, so use the `@const`\r\n      prefix before constant data to prevent updates.\r\n    '
            ),
          ]),
        ]),
        $$ce('li', {}, [$$ct('Output (.html)')]),
        $$ce('div', { class: 'result' }, [$$ce('div', {}, [$$ct('Hello World')])]),
      ]),
    ];
  }

  $$stylesheet() {
    var stylesheet = document.createElement('style');
    stylesheet.innerHTML = '';

    return stylesheet;
  }

  render(root) {
    document.head.appendChild(this.$$stylesheet());

    for (const component of this.$$components()) {
      $$isElement(component) && root.appendChild(component);
    }

    for (const evt of $$events) {
      evt[1].addEventListener(evt[0], evt[2]);
    }
  }
}
export { Component, Component as default };
