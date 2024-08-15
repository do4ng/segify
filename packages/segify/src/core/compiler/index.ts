import { compileLanguage } from '../../languages/setup';
import { startsWithCapital } from '../../lib/startsWith';
import { ElementAttributes, HTMLElement, parse } from '../parser';
import TEMPLATE from './template';
import { travelScript } from './travel';

const createElement = (...args) => `$$ce(${args.join(',')}, this.$$DEV_PROPS)`;
const createText = (...args) => `$$ct(${args.join(',')})`;
const createData = (...args) => `...$$cd(${args.join(',')}, this.$$subscribe)`;

const createTag = (tag: string) => (startsWithCapital(tag) ? tag : JSON.stringify(tag));

function append(elements: HTMLElement[], data: any[]) {
  const appends = [];

  for (const element of elements) {
    if (element.type === 'text') {
      appends.push(createText(JSON.stringify(element.text)));
    } else if (element.type === 'element') {
      if (element.attributes.$) {
        const $attributes = element.attributes.$ as unknown as ElementAttributes;

        delete element.attributes.$;

        if ($attributes) {
          // <div $mount=""></div>
          if ($attributes.$mount) {
            appends.push(
              `(${$attributes.$mount}=${createElement(
                createTag(element.tag),
                JSON.stringify(element.attributes),
                `[${append(element.children || [], data)[0].join(',')}]`
              )})`
            );
          }

          // <div $mount="" $onmount="myFunction"></div>
          if ($attributes.$onmount) {
            appends.push(`(${$attributes.$onmount}(${$attributes.$mount || ''}))`);
          }

          // <div $onclick="myFunction"></div>
          if ($attributes.$onclick) {
            appends.push(
              `($$events.push(["click", ${createElement(
                createTag(element.tag),
                JSON.stringify(element.attributes),
                `[${append(element.children || [], data)[0].join(',')}]`
              )},${$attributes.$onclick}]) && $$events[$$events.length - 1][1])`
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
  options?: { noExport?: boolean; disableProcessor?: boolean }
) {
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
      meta.scripts.push([html.attributes.lang, html.raw || '']);
      html.children = null;
    } else if (html.type === 'element' && html.tag === 'style') {
      meta.styles.push([html.attributes.lang, html.raw || '']);

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
    var $$events=[];
    var $ = new Proxy(
      {__props__: {}},
      {
        set(target, prop, value, receiver) {
          target[prop] = value;
          for (const subscriber of $$subscribe) {
            const s = subscriber[0].nodeValue=subscriber[1]();
          }
          return true;
        },
      }
    );
    for (const prop of Object.keys(props)) {
      $[prop] = props[prop];
    }
    this.$ = $;
    this.$$events=$$events;
    this.$$subscribe=$$subscribe;
  }

  $$components() {
    const {$, $$events, $$subscribe} = this;
    var $$DEV_PROPS={\n\t${data
      .map(
        (d, index) =>
          `"$${index}$":()=>(${(() => {
            let $data = d.trim().slice(2, -2);
            if ($data?.trim().split(' ')[0] === '@const') {
              $data = $data.trim().split(' ').slice(1);
            }

            return $data;
          })()})`
      )
      .join(',\n\t')}\n};
    this.$$DEV_PROPS=$$DEV_PROPS;
    ${output};

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
    for (const evt of this.$$events) {
      evt[1].addEventListener(evt[0], evt[2])
    }
  }

  render(root) {
    document.head.appendChild(this.$$stylesheet());
    for (const component of [].concat(...this.$$components())) {
      $$isElement(component)&&root.appendChild(component);
    }
    this.$$event();
  }
}`);

  if (options?.noExport !== true) {
    file.push('export { Component, Component as default}');
  }

  return file.join('\n');
}
