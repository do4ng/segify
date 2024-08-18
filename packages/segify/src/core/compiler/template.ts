import template from '../../../client/lib.mjs';

export default () => {
  // @ts-expect-error
  if (typeof global === 'undefined') window.global = {};
  if (typeof global !== 'undefined' && global?.segify_asset_raw) {
    return global.segify_asset_raw;
  }

  return template;
};
