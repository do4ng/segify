const target = require('path').join(__dirname, 'client/lib.mjs');

const data = require('fs').readFileSync(target).toString();

require('fs').writeFileSync(target, `export default ${JSON.stringify(data)}`);
