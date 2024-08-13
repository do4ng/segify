import { Parser, ParserOptions, processBeforeParse } from './parser';

export function parse(code: string, options?: ParserOptions) {
  const { code: c, data } = processBeforeParse(code);

  const parser = new Parser(c, options);
  parser.parse();

  return { ast: parser.stats.parent, data };
}

export * from './tag';
export * from './parser';
export * from './element';
