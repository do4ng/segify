export default () => {
  if (global.segify_asset_raw) {
    return global.segify_asset_raw;
  }

  throw new Error('Cannot find asset');
};
