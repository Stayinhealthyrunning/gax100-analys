"use strict";

// Privacy safeguard for the public GAX100 export. Shared SHA-256 fingerprints
// from the other Loppanalys race tools are matched BEFORE public JSON is written.
// The original, attributable data remains in the local (non-public) curated DB.
// Masking is pseudonymisation, NOT GDPR anonymisation.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const RULES_PATH = path.join(__dirname, "..", "config", "privacy-suppressions.json");
function normalizeName(value) {
  return String(value == null ? "" : value).normalize("NFKC")
    .toLowerCase().replace(/\u00df/g, "ss").replace(/\s+/g, " ").trim();
}
function fingerprint(value) {
  return crypto.createHash("sha256").update(normalizeName(value), "utf8").digest("hex");
}
function candidateNames(name) {
  const raw = String(name == null ? "" : name).trim();
  if (!raw) return [];
  const candidates = [raw];
  // Most historical GAX results use "Surname, Given name". The shared
  // suppressions use the runner's "Given name Surname" fingerprint.
  const parts = raw.split(",");
  if (parts.length === 2 && parts[0].trim() && parts[1].trim()) {
    candidates.push(parts[1].trim() + " " + parts[0].trim());
    candidates.push(parts[0].trim() + " " + parts[1].trim());
  }
  return candidates;
}
function loadRules(file = RULES_PATH) {
  const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
  if (parsed.schema_version !== 1 || !Array.isArray(parsed.suppressed_name_sha256)) {
    throw new Error("Unsupported Loppanalys privacy suppression format");
  }
  for (const value of parsed.suppressed_name_sha256) {
    if (!/^[a-f0-9]{64}$/i.test(value)) throw new Error("Invalid suppression fingerprint");
  }
  return {
    displayName: parsed.display_name || "Anonym löpare",
    fingerprints: new Set(parsed.suppressed_name_sha256.map(v => v.toLowerCase())),
  };
}
function isSuppressed(name, rules) {
  return candidateNames(name).some(candidate => rules.fingerprints.has(fingerprint(candidate)));
}
function sanitizePublicRecord(record, rules) {
  if (!isSuppressed(record.name, rules)) return record;
  // Deterministic opaque key must not expose name, club or original result_id.
  const opaque = "anon-" + crypto.createHash("sha256")
    .update("gax100-public|" + record.edition_id + "|" + record.result_id)
    .digest("hex").slice(0, 24);
  return {
    ...record,
    result_id: opaque,
    name: rules.displayName,
    club: null,
    observations: (record.observations || []).map(o => ({ ...o, result_id: opaque })),
  };
}
module.exports = { RULES_PATH, normalizeName, fingerprint, loadRules, isSuppressed, sanitizePublicRecord };
