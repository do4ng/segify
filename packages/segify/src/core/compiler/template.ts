export const CREATE_ELEMENT = `var $$ce = (t, a, c=[]) => {
  var component = document.createElement(t);
  for (const key in a) {
    component.setAttribute(key, a[key]);
  }
  for (const child of c) {
    $$isElement(child)&&component.appendChild(child);
  }
  return component;
};`.replace(/[\r\n\t]/g, '');

export const CREATE_TEXT = `var $$ct = (t) => {
  return document.createTextNode(t);
};`.replace(/[\r\n\t]/g, '');
export const CREATE_DATA = `
var $$cd = (t,s=true) => {
  var subscriber = document.createTextNode(t());
  s && $$subscribe.push([subscriber, t]);
  return subscriber;
};
`.replace(/[\r\n\t]/g, '');

export const IS_ELEMENT = `
function $$isElement(element) {
return element instanceof Element || element instanceof HTMLDocument || element instanceof Text;  
}
`.replace(/[\r\n\t]/g, '');
