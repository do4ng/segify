// @ts-expect-error
import Component from '../0.js';

const component = new Component({});

component.render(document.querySelector('#app') as HTMLElement);
