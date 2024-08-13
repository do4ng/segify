/* eslint-disable no-cond-assign */
import { HTMLElement } from './element';
import { parseTag } from './tag';

export interface ParserOptions {
  keepComment?: boolean;
}

export interface ParserStats {
  current: number;
  parent: HTMLElement;
  start?: number;
  end?: number;
  element: HTMLElement;
  selected: string;
  // tag: <h1></h1>
  // text: Hello
  // comment: <!--insert data-->
  // data: $1
  status: 'tag' | 'text' | 'comment' | 'data' | null;
  dataTagStatus: {
    stringOpened: boolean;
    stringOpenStr: string;
  };
  dataAllowed: boolean;
}

export function processBeforeParse(code: string = '') {
  const pattern = /\{\{\s*((?:\{[^{}]*\}|[^{}])*)\s*\}\}/g;

  let index = 0;

  const data = [];

  code = code.replace(pattern, (match) => {
    data.push(match);
    // eslint-disable-next-line no-plusplus
    return `$${index++}$`;
  });

  return { code, data };
}

export class Parser {
  code: string;

  options: ParserOptions;

  stats: ParserStats;

  result: HTMLElement[];

  constructor(code: string, options?: ParserOptions) {
    this.code = code;
    this.options = options || {};
    this.result = [new HTMLElement({ type: 'fragment' })];
    this.stats = {
      current: 0,
      parent: this.result[0],
      element: null,
      selected: '',
      status: null,
      start: -1,
      end: -1,
      dataTagStatus: {
        stringOpened: false,
        stringOpenStr: null,
      },
      dataAllowed: true,
    };
  }

  next(jump: number = 1) {
    /*
    console.log(
      `${this.code[this.stats.current]} - ${this.stats.selected}, ${this.stats.status}`
    );
    */
    this.stats.current += jump;
  }

  willBe(text: string) {
    const sliced = this.code.slice(this.stats.current);
    return sliced.startsWith(text);
  }

  reset() {
    this.stats = {
      ...this.stats,
      element: null,
      selected: '',
      status: null,
      dataTagStatus: {
        stringOpened: false,
        stringOpenStr: null,
      },
    };
  }

  addChild() {
    this.stats.element.text = this.stats.selected;
    this.stats.parent.appendChild(this.stats.element);
  }

  until(target: string, openStr: Record<string, string> = {}) {
    const opens = Object.keys(openStr);
    const closes = Object.values(openStr);
    const result = {
      start: this.stats.current,
      end: -1,
      text: null,
    };
    const $ = {
      opened: false,
      start: null,
    };

    while (this.stats.current < this.code.length) {
      const text = this.code[this.stats.current];

      if (!$.opened && opens.includes(text)) {
        $.opened = true;
        $.start = opens.indexOf(text);
        this.next();
        continue;
      }

      if ($.opened && closes[$.start] === text) {
        $.opened = false;
        this.next();
        continue;
      }

      if (!$.opened && text === target) {
        result.end = this.stats.current;
        result.text = this.code.slice(result.start, result.end + 1);

        return result;
      }

      this.next();
    }

    return result;
  }

  parse() {
    while (this.stats.current < this.code.length) {
      const text = this.code[this.stats.current];

      // close comment
      if (this.stats.status === 'comment' && this.willBe('-->')) {
        if (this.options.keepComment) {
          this.addChild();
        }

        this.reset();
        this.next(3);

        continue;
      }
      if (this.stats.status === null && this.willBe('<!--')) {
        this.stats.status = 'comment';
        this.stats.element = new HTMLElement({ type: 'comment' });
        this.next(4);

        continue;
      }

      // skip comment
      if (this.stats.status === 'comment') {
        if (this.options.keepComment) {
          this.stats.selected += text;
        }
        this.next();

        continue;
      }

      /*
      tags
      */

      if (text === '$') {
        if (this.stats.selected) {
          const element = new HTMLElement({ type: 'text' });
          element.text = this.stats.selected;

          this.stats.parent.appendChild(element);

          this.reset();
        }

        this.next();
        const data = this.until('$');

        const element = new HTMLElement({ type: 'data' });
        element.value = this.code.slice(data.start - 1, data.end + 1);

        this.stats.parent.appendChild(element);

        this.reset();

        this.stats.current = data.end + 1;

        continue;
      }

      if (text === '<' && !this.willBe('</')) {
        // open tag

        if (this.stats.selected) {
          const element = new HTMLElement({ type: 'text' });
          element.text = this.stats.selected;

          this.stats.parent.appendChild(element);

          this.reset();
        }

        const tag = this.until('>', { '"': '"', "'": "'" });
        const parsedTag = parseTag(tag.text);

        // <script> / <style>
        if (parsedTag.tagName === 'script' || parsedTag.tagName === 'style') {
          this.stats.start = this.stats.current;
          this.stats.dataAllowed = false;
          this.stats.element = new HTMLElement({
            type: 'element',
            tag: parsedTag.tagName as string,
            attributes: parsedTag.attributes || {},
          });

          while (this.stats.current < this.code.length) {
            this.until('<', { '"': '"', "'": "'", '`': '`' });

            if (this.code[this.stats.current + 1] === '/') {
              break;
            }
            this.next();
          }

          this.stats.element.position = {
            start: this.stats.start,
            end: this.stats.current - 1,
          };
          this.stats.end = this.stats.current;
          this.stats.element.raw = this.code.slice(this.stats.start + 1, this.stats.end);
          this.stats.parent.appendChild(this.stats.element);
          this.until('>', { '"': '"', "'": "'" });
          this.next();

          this.reset();
          continue;
        }

        this.stats.element = new HTMLElement({
          type: 'element',
          tag: parsedTag.tagName as string,
          attributes: parsedTag.attributes || {},
        });

        this.stats.start = this.stats.current;

        if (this.code[tag.end - 1] !== '/') {
          const parser = new Parser(this.code, this.options);

          parser.stats.current = this.stats.current + 1;
          parser.stats.parent = this.stats.element;

          const result = parser.parse();

          this.stats.element = result.parent;
          this.stats.current = result.current + 1;
          this.stats.end = this.stats.current;
        } else {
          this.stats.current += 1;
        }

        this.stats.element.position = {
          start: this.stats.start,
          end: this.stats.current - 1,
        };
        this.stats.element.raw = this.code.slice(
          this.stats.start + 1,
          this.stats.end - parsedTag.tagName.length - 3
        );

        this.stats.parent.appendChild(this.stats.element);

        this.reset();

        continue;
      } else if (this.willBe('</')) {
        // close tag
        if (this.stats.selected) {
          const element = this.stats.element || new HTMLElement({ type: 'text' });
          element.text = this.stats.selected;

          this.stats.parent.appendChild(element);

          this.reset();
        }

        this.until('>');

        return this.stats;
      }

      this.stats.selected += text;
      this.next();
    }

    if (this.stats.selected.trim() !== '') {
      const element = this.stats.element || new HTMLElement({ type: 'text' });
      element.text = this.stats.selected;

      this.stats.parent.appendChild(element);
    }

    return this.stats;
  }
}
