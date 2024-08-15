import { parse } from 'acorn';
import { simple } from 'acorn-walk';

function replaceRange(s, start, end, substitute) {
  return s.substring(0, start) + substitute + s.substring(end);
}

export function travelScript(code: string): [string[], string] {
  const parsed = parse(code, { ecmaVersion: 'latest', sourceType: 'module' });
  const imports = [];
  const remove: Array<[number, number]> = [];

  simple(parsed, {
    ImportDeclaration(node) {
      imports.push(code.slice(node.start, node.end));
      remove.push([node.start, node.end]);
    },
  });

  remove.forEach(([start, end]) => {
    code = replaceRange(code, start, end, ' '.repeat(end - start));
  });

  return [imports, code];
}
