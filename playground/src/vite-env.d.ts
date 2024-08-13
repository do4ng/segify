/// <reference types="vite/client" />
declare module '*.html' {
  export = class Component {
    constructor(props: any);

    render(parent: HTMLElement);
  };
}
declare const $: Record<string, any>;
