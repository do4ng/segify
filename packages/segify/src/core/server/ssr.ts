import { compile } from '../compiler';

const runtime = /* js */ `
const document = {
  createElement: (tag) => {
    const $ = {
      attributes: {},
      children: []
    }
    return { 
      appendChild: (element) => {
        $.children.push(element.getText());
      },
      setAttribute: (name, value) => {
        $.attributes[name] = value;
      },
      getText: () => {
        return "<" + tag + Object.keys($.attributes).map((a) => a + "=" + '"' + $.attributes[a].replace(/"/g, '\\"') + '\\"').join(" ") + ">" + $.children.map((c) => {
          if ($$isElement(c)) {
            return c.getText();
          } 
          return c;
        }).join("") + "</" + tag + ">";
      },
      __component__: true
    }
  },
  createTextNode: (text) => {
    const $ = {
      nodeValue: text,
      getText: () => $.nodeValue,
      __component__: true
    }

    return $;
  },
};

var env = "ssr" 
var window={__env__: env}
`;

export async function serverRender(code: string) {
  process.env.mode = 'ssr';
  const js = await compile(code, { noExport: true, disableJavascript: true });

  const script = `${runtime}${js};const __serverside_component = new Component({}); return __serverside_component.$$components();`;

  try {
    const output: Array<{ getText: () => string }> = new Function(script)();

    return {
      output,
      script,
    };
  } catch (e) {
    console.error('error occurred while generating html (ssr mode)');
    throw new Error(e);
  }
}
