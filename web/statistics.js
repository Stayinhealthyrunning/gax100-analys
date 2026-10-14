(function attachStatistics(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GaxStatistics = factory();
}(typeof globalThis === 'object' ? globalThis : this, function createStatistics() {
  function sorted(values) { return values.filter(Number.isFinite).sort((a, b) => a - b); }
  function median(values) {
    const x = sorted(values);
    if (!x.length) return null;
    const middle = (x.length - 1) / 2;
    const lower = Math.floor(middle); const upper = Math.ceil(middle);
    return lower === upper ? x[lower] : (x[lower] + x[upper]) / 2;
  }
  function percentile(values, probability) {
    const x = sorted(values);
    if (!x.length) return null;
    const h = (x.length - 1) * probability;
    const lower = Math.floor(h); const upper = Math.ceil(h); const fraction = h - lower;
    return x[lower] + fraction * (x[upper] - x[lower]);
  }
  return { median, percentile };
}));
