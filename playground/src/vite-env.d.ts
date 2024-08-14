/// <reference types="vite/client" />
declare module '*.seg' {
  class Component {
    constructor(props: any);
    render(parent: HTMLElement);
  }
  export { Component, Component as default };
}
declare const $: Record<string, any>;
