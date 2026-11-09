"use strict";

// Adapter for the access-controlled Loppanalys publication-block registry.
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
  if (parsed.schema_version !== 2) throw new Error("Unsupported public privacy policy schema");
  const encoded = String(process.env.LOPPANALYS_PRIVACY_REGISTRY_B64 || "").trim();
  const registryPath = String(process.env.LOPPANALYS_PRIVACY_REGISTRY_PATH || "").trim();
  if (encoded && registryPath) throw new Error("Configure one private registry source, not both");
  let registry = null;
  try {
    if (encoded) registry = JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
    else if (registryPath) registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  } catch (error) {
    throw new Error("Invalid private privacy registry secret", { cause: error });
  }
  const required = /^(1|true|yes)$/i.test(String(process.env.LOPPANALYS_REQUIRE_PRIVATE_REGISTRY || ""));
  if (!registry && required) throw new Error("Private registry missing; publication stopped");
  if (registry && registry.schema_version !== 2) throw new Error("Unsupported private privacy registry schema");
  const entries = registry?.entries || [];
  for (const entry of entries) {
    if (!['restrict_identifiers', 'remove_result', 'temporary_restriction'].includes(entry.action)) {
      throw new Error("Unsupported privacy action");
    }
    if (!/^[a-f0-9]{64}$/i.test(entry.match?.normalized_name_sha256 || "")) {
      throw new Error("Invalid suppression fingerprint");
    }
    if (['name', 'email', 'birthdate'].some(key => Object.hasOwn(entry, key))) {
      throw new Error("Private registry must not contain plaintext identity fields");
    }
  }
  return {
    displayName: parsed.display_name || "Anonym löpare",
    entries,
    registryLoaded: Boolean(registry),
  };
}
function isSuppressed(name, rules) {
  const candidates = new Set(candidateNames(name).map(fingerprint));
  const now = Date.now();
  return rules.entries.some(entry => {
    if (entry.action === 'temporary_restriction' && entry.expires_at && Date.parse(entry.expires_at) <= now) return false;
    return candidates.has(String(entry.match.normalized_name_sha256).toLowerCase());
  });
}
function suppressionAction(record, rules) {
  const candidates = new Set(candidateNames(record.name).map(fingerprint));
  const scope = String(record.edition_id || "*");
  const now = Date.now();
  for (const entry of rules.entries) {
    if (entry.action === 'temporary_restriction' && entry.expires_at && Date.parse(entry.expires_at) <= now) continue;
    if (!candidates.has(String(entry.match.normalized_name_sha256).toLowerCase())) continue;
    // Narrow restrictions apply only to their configured race/edition scope.
    // A missing scopes field means global protection for legacy entries.
    if (Array.isArray(entry.scopes) && !entry.scopes.includes('*') && !entry.scopes.includes(scope)) continue;
    if (entry.require_review_for_new_matches) {
      const approved = (entry.approved_matches || []).some(item =>
        ['*', scope].includes(String(item.scope || '*')) &&
        Object.keys(item.identifiers || {}).length > 0 &&
        Object.entries(item.identifiers).every(([key, value]) =>
          Object.hasOwn(record, key) && record[key] !== null && record[key] !== '' &&
          value !== null && value !== '' && String(record[key]) === String(value))
      );
      if (!approved) throw new Error('Potential protected-identity match requires private manual review; publication stopped');
    }
    return entry.action;
  }
  return null;
}
// Definitive-age policy: exact source age <18, age at maximum based on birth
// year <18, or a bounded source age category ending at 17. An unknown age
// must remain unknown rather than being inferred from a name.
function confirmedMinor(record) {
  if (Number.isInteger(record.age) && record.age >= 0 && record.age < 18) return true;
  const matchedYear = String(record.edition_id || "").match(/20\d{2}/)?.[0];
  const year = Number(record.edition_year ?? record.year ?? matchedYear);
  const birthYear = Number(record.birth_year);
  if (Number.isInteger(year) && year >= 1900 &&
      Number.isInteger(birthYear) && birthYear >= 1900 &&
      birthYear <= year && year - birthYear < 18) return true;
  for (const key of ["age_category", "class_name"]) {
    const label = String(record[key] || "").trim();
    const range = label.match(/^(?:\([A-Za-z]\)\s*)?(\d{1,2})\s*[-–]\s*(\d{1,2})(?:\s+(?:män|kvinnor))?$/i);
    if (range && +range[1] <= +range[2] && +range[2] < 18) return true;
  }
  return false;
}
function shouldWithhold(record, rules) {
  return confirmedMinor(record) || suppressionAction(record, rules) !== null;
}
module.exports = { RULES_PATH, normalizeName, fingerprint, loadRules, isSuppressed, suppressionAction, confirmedMinor, shouldWithhold };
