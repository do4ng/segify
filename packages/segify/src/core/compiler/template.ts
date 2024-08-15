import template from '../../../client/lib.mjs';

export default () => {
  if (global.segify_asset_raw) {
    return global.segify_asset_raw;
  }

  return template;
};
