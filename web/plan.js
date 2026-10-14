/* Source-backed segment planning shared by the browser and regression tests. */
(function installGaxPlan(root) {
  'use strict';
  const api = (() => {
    const median = (input) => {
      const values = input.filter(Number.isFinite).slice().sort((a, b) => a - b);
      if (!values.length) return null;
      const mid = Math.floor(values.length / 2);
      return values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
    };
    const validFinish = (result) => result?.status === 'FINISHED' &&
      Number.isFinite(result.finish_seconds) && result.finish_seconds > 0;

    // Each interval is backed by two chronological observations: START=0,
    // published checkpoint elapsed time, or a recorded FINISHED time at MÅL.
    // Missing intermediate checkpoints invalidate the candidate's cohort match.
    function timeline(result) {
      if (!validFinish(result) || !Array.isArray(result.observations) || !result.observations.length) return null;
      let previousSeconds = 0;
      let previousName = 'Start';
      let previousKm = 0;
      const used = new Set();
      const segments = [];
      for (const observation of result.observations) {
        const elapsed = observation.elapsed_seconds;
        const checkpointId = observation.checkpoint_id;
        const name = observation.name;
        const distanceKm = observation.distance_km == null ? null : Number(observation.distance_km);
        if (typeof checkpointId !== 'string' || !checkpointId || used.has(checkpointId) ||
            typeof name !== 'string' || !name ||
            !Number.isFinite(elapsed) || elapsed <= previousSeconds || elapsed >= result.finish_seconds ||
            (distanceKm !== null && (!Number.isFinite(distanceKm) || distanceKm <= 0 ||
               (previousKm !== null && distanceKm <= previousKm)))) return null;
        segments.push({
          checkpointId, from: previousName, to: name,
          seconds: elapsed - previousSeconds,
          distanceKm: previousKm !== null && distanceKm !== null ? distanceKm - previousKm : null,
          checkpointKm: distanceKm
        });
        previousName = name;
        previousSeconds = elapsed;
        previousKm = distanceKm;
        used.add(checkpointId);
      }
      if (result.finish_seconds <= previousSeconds) return null;
      segments.push({
        checkpointId: 'FINISH', from: previousName, to: 'Mål',
        seconds: result.finish_seconds - previousSeconds, distanceKm: null, checkpointKm: null
      });
      return segments;
    }

    function historicalPlan(result, editionResults) {
      const selected = timeline(result);
      if (!selected || selected.length < 3 || !Array.isArray(editionResults)) return null;
      const finishers = editionResults.filter((item) =>
        item.edition_id === result.edition_id && validFinish(item));
      const cohort = finishers.map((item) => ({ result: item, segments: timeline(item) }))
        .filter(({ segments }) => segments && segments.length === selected.length &&
          segments.every((segment, index) => segment.checkpointId === selected[index].checkpointId &&
            (segment.checkpointKm === null || selected[index].checkpointKm === null ||
             Math.abs(segment.checkpointKm - selected[index].checkpointKm) < 0.01)));
      if (cohort.length < 5) return null;
      const weights = selected.map((segment, index) => median(cohort.map(({ result: runner, segments }) =>
        segments[index].seconds / runner.finish_seconds)));
      const sum = weights.reduce((acc, weight) => acc + weight, 0);
      if (!(sum > 0) || weights.some((weight) => !Number.isFinite(weight) || weight <= 0)) return null;
      const target = median(finishers.map((item) => item.finish_seconds));
      if (!(target > 0)) return null;
      return {
        candidates: cohort.length,
        target,
        segments: selected.map((segment, index) => ({
          ...segment,
          cohort: cohort.length,
          fraction: weights[index] / sum
        }))
      };
    }

    function allocateLargestRemainder(total, fractions) {
      if (!Number.isSafeInteger(total) || !Array.isArray(fractions) ||
          !fractions.length || total < fractions.length ||
          fractions.some((part) => !Number.isFinite(part) || part <= 0)) {
        throw new RangeError('Ogiltig måltid eller segmentandel.');
      }
      const sum = fractions.reduce((a, b) => a + b, 0);
      const raw = fractions.map((fraction) => fraction / sum * total);
      const rounded = raw.map(Math.floor);
      const order = raw.map((amount, index) => ({ index, rest: amount - rounded[index] }))
        .sort((a, b) => b.rest - a.rest || a.index - b.index);
      const remaining = total - rounded.reduce((a, b) => a + b, 0);
      for (let i = 0; i < remaining; i += 1) rounded[order[i % order.length].index] += 1;
      if (rounded.some((seconds) => seconds <= 0) ||
          rounded.reduce((a, b) => a + b, 0) !== total) {
        throw new RangeError('Måltiden ger ogiltiga segmenttider.');
      }
      return rounded;
    }
    return { timeline, historicalPlan, allocateLargestRemainder };
  })();
  root.GaxPlan = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
