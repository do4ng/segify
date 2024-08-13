export type Processor = (code: string) => Promise<{
  code: string;
  attributes?: Record<string, string>;
}>;

const languages: { script: Record<string, Processor>; style: Record<string, Processor> } =
  {
    script: {},
    style: {},
  };

export function defineLanguage(
  type: 'script' | 'style',
  lang: string,
  processor: Processor
) {
  languages[type][lang] = processor;

  return {
    type,
    processor,
  };
}

export async function compileLanguage(
  type: 'script' | 'style',
  lang: string,
  code: string
) {
  const processor = languages[type][lang];

  if (processor) {
    try {
      return await processor(code);
    } catch (e) {
      console.log(e);
      throw new Error(`[${type}][${lang}] ${e}`);
    }
  }

  return {
    code,
  };
}
