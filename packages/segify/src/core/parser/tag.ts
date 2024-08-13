/* eslint-disable prefer-destructuring */

/**
 * `<MyComponent class="hello">`
 * @param tag tag string
 */
export function parseTag(tag: string) {
  tag = tag.slice(1, -1).trim();

  if (tag[tag.length - 1] === '/') {
    tag = tag.slice(0, -1);
  }

  const slices = tag.split(' ');

  const result: { tagName: string; attributes: any } = {
    tagName: '',
    attributes: {},
  };

  result.tagName = slices.shift().replace('\n', '');

  tag = slices.join(' ');

  let current = 0;
  const string = {
    opened: false,
    start: null,
  };
  // <h1 hello="world" => enabled <= >
  let suspected = false;

  let selected = '';

  let currentAttribute = null;

  while (current < tag.length) {
    const text = tag[current];

    // console.log(current, text, '[enter]', string.opened, suspected);

    if (string.opened) {
      if (text === string.start) {
        result.attributes[currentAttribute] = selected;
        string.opened = false;
        suspected = false;
        current += 1;
        selected = '';

        continue;
      }

      if (text === '$') {
        throw new Error('Attribute value type must be "string" or "data".');
        /*
        // open data
        const to = until('$');

        if (to < 0) throw new Error('$ must be closed');

        console.log(tag.slice(current, to));

        current = to;

        continue;
        */
      }

      selected += text;
      current += 1;

      continue;
    }

    if (!string.opened && ['"', "'"].includes(text)) {
      if (selected !== '' && selected !== null) {
        throw new Error(`parse error - ${tag.slice(current - 5)} <`);
      }

      suspected = false;
      string.opened = true;
      string.start = text;
      current += 1;
      continue;
    }

    if (text === ' ') {
      suspected = true;
      current += 1;
      continue;
    }

    if (text === '=') {
      suspected = false;
      currentAttribute = selected;
      selected = '';
      current += 1;
      continue;
    }

    if (suspected) {
      if (selected !== '') {
        result.attributes[selected] = true;
      }
      suspected = false;
      selected = text;
      current += 1;
      continue;
    }

    current += 1;
    selected += text;
    // console.log(current, selected, '[leave]');
  }

  if (selected.trim() !== '' && selected.trim() !== null) {
    result.attributes[selected] = true;
  }

  // eslint-disable-next-line guard-for-in
  for (const key in result.attributes) {
    const element = result.attributes[key];

    if (key.startsWith('$')) {
      if (!result.attributes.$) {
        result.attributes.$ = {};
      }

      result.attributes.$[key] = element;

      delete result.attributes[key];
    }
  }

  return result;
}
