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
import App from './app.html.js';
$.counter = 0;
function increase() {
  $.counter += 1;
}
function decrease() {
  $.counter -= 1;
}

var $$DEV_PROPS = {
  $0$: () => $.counter,
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
      $$ce('main', {}, [
        $$ce('div', { class: 'counter' }, [
          $$ce('div', { class: 'counter-container' }, [
            $$ce('h1', {}, [$$ct('Segify!!')]),
            $$ce('h1', { class: 'counting' }, [$$cd($$DEV_PROPS['$0$'], true)]),
            $$ce('div', {}, [
              $$events.push(['click', $$ce('button', {}, [$$ct('+ 1')]), increase]) &&
                $$events[$$events.length - 1][1],
              $$events.push(['click', $$ce('button', {}, [$$ct('- 1')]), decrease]) &&
                $$events[$$events.length - 1][1],
            ]),
          ]),
        ]),
        $$ce(App, {}, []),
      ]),
      $$ce('style', { lang: 'scss' }, []),
    ];
  }

  $$stylesheet() {
    var stylesheet = document.createElement('style');
    stylesheet.innerHTML =
      'summary {  margin: 10px 5px;}h1 a,h2 a {  color: #2f80eb;  margin-right: 5px;}h2 {  margin-top: 35px;}.result {  border: 1px solid #d8d8d8;  border-radius: 5px;  padding: 5px 10px;  margin: 15px 0px;}.result p {  margin: 0;}.counter {  text-align: center;  height: 30vh;  padding-bottom: 50px;  border-bottom: 1px solid #d4d4d4;}.counter .counter-container {  margin-top: 20vh;}.counter h1 {  color: #262838;}.counter h1.counting {  color: #486ed6;  margin: 10px;}.counter button {  color: #272c3a;  background-color: #e9e9e9;  border: none;  border-radius: 5px;  padding: 5px 8px;  margin: 5px;  transition: all 0.5s ease;}.counter button:hover {  background-color: #d8d7d7;  cursor: pointer;}.main {  width: 65%;  margin: 50px auto;}';

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
