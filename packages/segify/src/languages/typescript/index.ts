/* eslint-disable no-unreachable-loop */
/* eslint-disable space-in-parens */
import type { TsConfigJsonResolved } from 'get-tsconfig';
import { defineLanguage } from '../setup';

export default defineLanguage('script', 'ts', async (code) => {
  let typescript: typeof import('typescript');

  try {
    typescript = await import('typescript');
  } catch (e) {
    throw new Error(
      'To compile typescript code, you have to install typescript. npm i --save-dev typescript'
    );
  }

  const tsconfig: TsConfigJsonResolved =
    typeof global !== 'undefined'
      ? (await import('get-tsconfig')).getTsconfig().config
      : { compilerOptions: { module: 'esnext' } };

  const compiled = typescript.transpileModule(code, {
    ...(tsconfig as any),
    fileName: '.html.js',
  });

  return {
    code: compiled.outputText,
    attributes: {
      __lang: 'typescript',
    },
  };
});
