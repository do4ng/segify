// packages/segify/src/client/lib.ts
var $$cc = (t, a, c = []) => {
  a.children = c;
  const component = new t(a);
  return component.$$components();
};
var $$ce = (t, a, c = []) => {
  if (typeof t !== "string")
    return $$cc(t, a, c);
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
  return element instanceof Element || element instanceof HTMLDocument || element instanceof Text;
}
window.$$$$ = {
  $$cc,
  $$ce,
  $$ct,
  $$cd,
  $$isElement
};
