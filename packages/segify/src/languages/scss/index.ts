/* eslint-disable no-unreachable-loop */
/* eslint-disable space-in-parens */
import { defineLanguage } from '../setup';

export default defineLanguage('style', 'scss', async (code) => {
  let sass: typeof import('sass');

  try {
    sass = await import('sass');
  } catch (e) {
    throw new Error(
      'To compile sass code, you have to install sass. npm i --save-dev sass'
    );
  }

  const compiled = sass.compileString(code).css;

  return {
    code: compiled,
    attributes: {
      __lang: 'scss',
    },
  };
});
