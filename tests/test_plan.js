const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { historicalPlan, timeline, allocateLargestRemainder } = require('../web/plan.js');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../web/data.json'), 'utf8'));
let plans = 0;
const editions = new Map(data.editions.map((edition) => [edition.edition_id, data.results.filter((r) => r.edition_id === edition.edition_id)]));
for (const [editionId, rows] of editions) {
  for (const result of rows) {
    const plan = historicalPlan(result, rows);
    if (!plan) continue;
    plans += 1;
    assert(plan.candidates >= 5, editionId);
    assert.equal(plan.segments[0].from, 'Start', editionId);
    assert.equal(plan.segments.at(-1).to, 'Mål', editionId);
    assert(Math.abs(plan.segments.reduce((total, segment) => total + segment.fraction, 0) - 1) < 1e-10, editionId);
    for (const target of [Math.round(plan.target), 24 * 3600, 17 * 3600 + 7]) {
      const allocations = allocateLargestRemainder(target, plan.segments.map((segment) => segment.fraction));
      assert(allocations.every((seconds) => Number.isInteger(seconds) && seconds > 0));
      assert.equal(allocations.reduce((total, seconds) => total + seconds, 0), target, editionId);
    }
    const actual = timeline(result);
    assert.equal(actual.reduce((total, segment) => total + segment.seconds, 0), result.finish_seconds, editionId);
    assert.equal(plan.target, (() => {
      const valid = rows.filter((r) => r.status === 'FINISHED' && Number.isFinite(r.finish_seconds) && r.finish_seconds > 0)
        .map((r) => r.finish_seconds).sort((a, b) => a - b);
      return valid.length % 2 ? valid[(valid.length - 1) / 2] : (valid[valid.length / 2 - 1] + valid[valid.length / 2]) / 2;
    })(), editionId);
  }
}
assert(plans >= 400, 'Historiska kompletta kontrollserier måste kunna skapa planer.');
assert([...editions.get('gax100-2024')].some((result) => historicalPlan(result, editions.get('gax100-2024'))));
assert(editions.get('gax100-2025').every((result) => historicalPlan(result, editions.get('gax100-2025')) === null));
assert(editions.get('gax100-2026').every((result) => historicalPlan(result, editions.get('gax100-2026')) === null));
assert.equal(timeline({ status: 'FINISHED', finish_seconds: 100, observations: [
  { checkpoint_id: 'a', name: 'A', elapsed_seconds: 60, distance_km: null },
  { checkpoint_id: 'b', name: 'B', elapsed_seconds: 50, distance_km: null }
] }), null, 'Bakåtriktade observationer får aldrig ge plan.');
assert.throws(() => allocateLargestRemainder(0, [0.4, 0.6]));
assert.throws(() => allocateLargestRemainder(100, [0.4, 0]));
console.log(`PASS: ${plans} verifierbara historiska planer och exakt målsumma.`);
