export type ElementType = 'element' | 'text' | 'data' | 'fragment' | 'comment';
export type ElementAttributes = Record<string, string>;

class HTMLElement {
  public type: ElementType;

  public tag: string;

  public attributes: ElementAttributes;

  // eslint-disable-next-line no-use-before-define
  public children: HTMLElement[];

  public text: string = null;

  public value: string = null;

  public position: { start?: number; end?: number } = { start: -1, end: -1 };

  public raw?: string;

  constructor({
    type,
    tag,
    attributes,
    children,
    text,
  }: {
    type: ElementType;
    tag?: string;
    attributes?: ElementAttributes;
    children?: HTMLElement[];
    text?: string;
  }) {
    this.type = type;
    this.tag = tag;
    this.attributes = attributes || {};
    this.children = children || [];
    this.text = text || null;
    this.value = null;
  }

  appendChild(element: HTMLElement) {
    if (element.type === 'text') {
      const filtered = element.text.replace(/\n/g, '').replace(/\r/g, '');
      if (filtered.trim() !== '') {
        this.children.push(element);
      }
    } else {
      this.children.push(element);
    }

    return this;
  }

  removeChild(element: HTMLElement) {
    return this.children.filter((item) => item !== element);
  }
}

export { HTMLElement };
