(function attachTime(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GaxTime = factory();
}(typeof globalThis === 'object' ? globalThis : this, function createTime() {
  function roundSeconds(value) {
    return Number.isFinite(value) ? Math.round(value) : null;
  }

  function formatClock(value) {
    const rounded = roundSeconds(value);
    if (rounded === null) return '—';
    const sign = rounded < 0 ? '-' : '';
    const seconds = Math.abs(rounded);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    const remainder = seconds % 60;
    return `${sign}${hours}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  }

  return { roundSeconds, formatClock };
}));
