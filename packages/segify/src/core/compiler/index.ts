import { compileLanguage } from '../../languages/setup';
import { startsWithCapital } from '../../lib/startsWith';
import { ElementAttributes, HTMLElement, parse } from '../parser';
import TEMPLATE from './template';
import { travelScript } from './travel';
import '../../languages';

const createElement = (...args) => `$$ce(${args.join(',')}, this.$$DEV_PROPS)`;
const createText = (...args) => `$$ct(${args.join(',')})`;
const createData = (...args) => `...$$cd(${args.join(',')}, this.$$subscribe)`;

const createTag = (tag: string) => (startsWithCapital(tag) ? tag : JSON.stringify(tag));

// Define event mappings
const EVENT_MAPPINGS = {
  // <div $onclick="myFunction"></div>
  $onclick: 'click',
  // <input $onchange="myFunction"></input>
  $onchange: 'input',
  // <div $onmouseover="myFunction"></div>
  $onmouseover: 'mouseover',
  // <div $onmouseout="myFunction"></div>
  $onmouseout: 'mouseout',
  // <div $onmousemove="myFunction"></div>
  $onmousemove: 'mousemove',
  // <div $onmouseup="myFunction"></div>
  $onmouseup: 'mouseup',
  // <div $onmousedown="myFunction"></div>
  $onmousedown: 'mousedown',
  // <div $onkeyup="myFunction"></div>
  $onkeyup: 'keyup',
  // <div $onkeydown="myFunction"></div>
  $onkeydown: 'keydown',
  // <div $onkeypress="myFunction"></div>
  $onkeypress: 'keypress',
  // <div $onfocus="myFunction"></div>
  $onfocus: 'focus',
  // <div $onblur="myFunction"></div>
  $onblur: 'blur',
  // <div $oninput="myFunction"></div> // <== $onchange
  $oninput: 'input',
};

if (typeof process === 'undefined') {
  // @ts-ignore
  window.process = {};
}

function append(elements: HTMLElement[], data: any[]) {
  const appends = [];

  for (const element of elements) {
    if (element.type === 'text') {
      appends.push(createText(JSON.stringify(element.text)));
    } else if (element.type === 'element') {
      if (element.tag === 'script' || element.tag === 'style') {
        continue;
      }

      if (element.attributes.$) {
        const $attributes = element.attributes.$ as unknown as ElementAttributes;

        delete element.attributes.$;

        if ($attributes && process?.env?.mode !== 'ssr') {
          // <div $mount=""></div>
          if ($attributes.$mount || $attributes.$onmount) {
            // client side rendering

            appends.push(
              `(${$attributes.$mount ? `${$attributes.$mount}=` : ''}$$mount(${
                $attributes.$mount || 'null'
              }, ${$attributes.$onmount || 'null'}, ${createElement(
                createTag(element.tag),
                JSON.stringify(element.attributes),
                `[${append(element.children || [], data)[0].join(',')}]`
              )}))`
            );
          }

          // Handle all other events
          for (const [attrName, eventName] of Object.entries(EVENT_MAPPINGS)) {
            if ($attributes[attrName]) {
              appends.push(
                `($$events.push(["${eventName}", ${createElement(
                  createTag(element.tag),
                  JSON.stringify(element.attributes),
                  `[${append(element.children || [], data)[0].join(',')}]`
                )},${$attributes[attrName]}]) && $$events[$$events.length - 1][1])`
              );
            }
          }
        } else {
          appends.push(
            createElement(
              createTag(element.tag),
              JSON.stringify(element.attributes),
              `[${append(element.children || [], data)[0].join(',')}]`
            )
          );
        }
      } else {
        appends.push(
          createElement(
            createTag(element.tag),
            JSON.stringify(element.attributes),
            `[${append(element.children || [], data)[0].join(',')}]`
          )
        );
      }
    } else {
      const index = element.value.slice(1, -1);
      appends.push(
        createData(
          `$$DEV_PROPS[${JSON.stringify(element.value)}]`,
          data[index]?.trim().slice(2, -2).trim().split(' ')[0] !== '@const'
        )
      );
    }
  }

  return [appends, data];
}

function travel(ast: HTMLElement, handler: (ast: HTMLElement) => HTMLElement) {
  ast = handler(ast);

  if (ast.children?.length !== 0) {
    for (const child of ast.children || []) {
      travel(child, handler);
    }
  }
}

export async function compile(
  source: string,
  options?: {
    noExport?: boolean;
    disableProcessor?: boolean;
    disableJavascript?: boolean;
    serverMode?: boolean;
  }
) {
  if (options?.serverMode) {
    try {
      process.env.mode = 'ssr';
    } catch (e) {
      throw new Error('Server mode is not supported in the browser');
    }
  } else if (process?.env?.mode === 'ssr') process.env.mode = 'client';

  const { ast, data } = parse(source, { keepComment: false });
  const file = [];
  const meta = {
    scripts: [],
    styles: [],
  };
  const compiledMeta = {
    scripts: [],
    styles: [],
  };
  const [fragment] = append(ast.children, data);

  travel(ast, (html) => {
    if (html.type === 'element' && html.tag === 'script') {
      meta.scripts.push([html.attributes.lang, html.text || '']);
      html.children = null;
    } else if (html.type === 'element' && html.tag === 'style') {
      meta.styles.push([html.attributes.lang, html.text || '']);

      html.children = null;
    }
    return html;
  });

  // compile scss/typescript
  if (options?.disableProcessor !== true) {
    await import('../../languages');
  }

  for await (const src of meta.scripts) {
    compiledMeta.scripts.push(
      (await compileLanguage('script', src[0] || 'js', src[1])).code
    );
  }
  for await (const src of meta.styles) {
    compiledMeta.styles.push(
      (await compileLanguage('style', src[0] || 'css', src[1])).code
    );
  }

  const [importMeta, output] = travelScript(compiledMeta.scripts.join('\n'));

  file.push(TEMPLATE());
  file.push('/*scripts*/'); // user scripts
  file.push(importMeta.join('\n'));

  file.push(`class Component {
    $$subscribe=[];
    
    constructor(props) {
      var $$subscribe = [];
      var $$events = [];
      var $ = new Proxy({__props__: {}}, {
        set(target, prop, value) {
          target[prop] = value;
          for (const subscriber of $$subscribe) {
            subscriber[0].nodeValue = subscriber[1]();
          }
          return true;
        }
      });
      
      Object.keys(props).forEach(prop => $[prop] = props[prop]);
      this.$ = $;
      this.$$events = $$events;
      this.$$subscribe = $$subscribe;
    }

    $$kill() {
      this.$$events.forEach(evt => evt[1].removeEventListener(evt[0], evt[2]));
    }

    $$components() {
      const {$, $$events, $$subscribe} = this;
      var $$DEV_PROPS = {
        ${data
          .map(
            (d, index) =>
              `"$${index}$":()=>(${(() => {
                const $data = d.trim().slice(2, -2);
                return $data?.trim().split(' ')[0] === '@const'
                  ? $data.trim().split(' ').slice(1)
                  : $data;
              })()})`
          )
          .join(',\n\t')}
      };
      this.$$DEV_PROPS = $$DEV_PROPS;
      ${
        options?.disableJavascript !== true
          ? output
          : `/*javascript disabled (due to options.disableJavascript).\n${output}*/`
      };

      return [${fragment.join(',')}];
    }

    $$stylesheet() {
      var stylesheet = document.createElement('style');
      stylesheet.innerHTML = ${JSON.stringify(
        compiledMeta.styles
          .join('')
          .replace(/\n/g, '')
          .replace(/\r/g, '')
          .replace(/\t/g, '')
      )};
      return stylesheet;
    }

    $$event() {
      this.$$events.forEach(evt => evt[1].addEventListener(evt[0], evt[2]));
    }

    render(root) {
      document.head.appendChild(this.$$stylesheet());
      [].concat(...this.$$components())
        .filter($$isElement)
        .forEach(component => root.appendChild(component));
      this.$$event();
    }
  }`);

  if (options?.noExport !== true) {
    file.push('export { Component, Component as default}');
  }

  return file.join('\n');
}
