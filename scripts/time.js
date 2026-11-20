function parseClockSeconds(value) {
  if (value == null) return null;
  let text = String(value).trim();
  if (!text) return null;

  // Resultatkällorna använder ibland en parentes för mellantidsplacering.
  // Den är inte en del av klocktiden och måste tas bort före parsing.
  text = text.replace(/\s*\(\s*\d+\s*\)\s*$/, '').trim();

  const hm = text.match(/^(\d{1,3})h(?:(\d{1,2})m)?$/i);
  if (hm) return Number(hm[1]) * 3600 + Number(hm[2] || 0) * 60;

  const normalized = text.replace(/[;,]/g, ':').replace(/\s+/g, '');
  const parts = normalized.split(/[.:]/).filter(Boolean).map(Number);
  if (parts.some(Number.isNaN) || parts.length < 2 || parts.length > 3) return null;
  if (parts.length === 3 && parts[1] < 60 && parts[2] < 60) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2 && parts[1] < 60) return parts[0] * 3600 + parts[1] * 60;
  return null;
}

module.exports = { parseClockSeconds };
