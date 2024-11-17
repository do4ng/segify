/* eslint-disable no-cond-assign */
import { HTMLElement } from './element';
import { parseTag } from './tag';

const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

const RAW_TEXT_ELEMENTS = new Set(['script', 'style', 'textarea', 'title']);

export interface ParserOptions {
  keepComment?: boolean;
  preserveWhitespace?: boolean;
  maxNestingLevel?: number;
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
  nestingLevel?: number;
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

  errors: string[] = [];

  constructor(code: string, options?: ParserOptions) {
    this.code = code;
    this.options = {
      keepComment: false,
      preserveWhitespace: false,
      maxNestingLevel: 100,
      ...options,
    };
    this.result = [new HTMLElement({ type: 'fragment' })];
    this.stats = {
      current: 0,
      parent: this.result[0],
      element: null,
      selected: '',
      status: null,
      start: -1,
      end: -1,
      nestingLevel: 0,
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

  private addError(message: string) {
    const line = this.code.slice(0, this.stats.current).split('\n').length;

    this.errors.push(`Line ${line}: ${message}`);
  }

  private handleText() {
    if (!this.stats.selected) return;

    const text = this.options.preserveWhitespace
      ? this.stats.selected
      : this.stats.selected.trim();

    if (!text) return;

    const element = new HTMLElement({ type: 'text' });
    element.text = text;
    this.stats.parent.appendChild(element);
  }

  private parseTag(tagText: string) {
    const tag = parseTag(tagText);

    if (!tag.tagName || /[^a-zA-Z0-9-]/.test(tag.tagName)) {
      this.addError(`Invalid tag name: ${tag.tagName}`);
    }

    return tag;
  }

  parse() {
    while (this.stats.current < this.code.length) {
      const text = this.code[this.stats.current];

      if (this.stats.nestingLevel > this.options.maxNestingLevel) {
        this.addError('Maximum nesting level exceeded');
        break;
      }

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

      if (this.stats.status === 'comment') {
        if (this.options.keepComment) {
          this.stats.selected += text;
        }
        this.next();

        continue;
      }

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
        if (this.stats.selected) {
          this.handleText();
          this.reset();
        }

        const tag = this.until('>', { '"': '"', "'": "'" });

        const parsedTag = this.parseTag(tag.text);

        if (VOID_ELEMENTS.has(parsedTag.tagName.toLowerCase())) {
          const element = new HTMLElement({
            type: 'element',
            tag: parsedTag.tagName,
            attributes: parsedTag.attributes || {},
          });
          this.stats.parent.appendChild(element);
          this.next();
          continue;
        }

        if (RAW_TEXT_ELEMENTS.has(parsedTag.tagName.toLowerCase())) {
          parsedTag.tagName = parsedTag.tagName.trim();
          this.stats.element = new HTMLElement({
            type: 'element',
            tag: parsedTag.tagName,
            attributes: parsedTag.attributes || {},
          });

          const endTag = `</${parsedTag.tagName}`;
          const contentStart = this.stats.current + 1;
          const contentEnd = this.code.indexOf(endTag, contentStart);

          if (contentEnd === -1) {
            this.addError(`Unclosed ${parsedTag.tagName} tag`);
            this.next();
            continue;
          }

          const content = this.code.slice(contentStart, contentEnd);

          this.stats.element.text = content;
          this.stats.parent.appendChild(this.stats.element);

          this.stats.current = contentEnd + endTag.length + 1;
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

        this.stats.nestingLevel += 1;

        continue;
      } else if (this.willBe('</')) {
        this.stats.nestingLevel -= 1;
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

    if (this.stats.selected.trim()) {
      this.handleText();
    }

    return {
      ...this.stats,
      errors: this.errors,
    };
  }
}
