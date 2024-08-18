import { readFileSync } from 'fs';
import { serverRender } from './core/server/ssr';

const output = serverRender(
  readFileSync('./playground/src/components/app.seg').toString()
);

output.then(({ output }) => {
  let ret = output.map((a) => a.getText()).join('');
  console.log(ret);
});
