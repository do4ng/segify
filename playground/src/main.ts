// @ts-expect-error
// eslint-disable-next-line import/no-named-as-default
import Component from './components/component.html.js';

const component = new Component({});

component.render(document.querySelector('#app') as HTMLElement);
