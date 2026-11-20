/* Comparison 2.0: source-anchored, data-gated calculations (no synthetic positions). */
(function installComparison(root) {
  'use strict';
  function validTime(v) { return typeof v === 'number' && Number.isFinite(v) && v >= 0; }
  function sameCheckpoint(a, b, crossEdition) {
    if (!a || !b || a.checkpoint_id !== b.checkpoint_id || !validTime(a.elapsed_seconds) || !validTime(b.elapsed_seconds)) return false;
    if (crossEdition) return false; // no verified shared historical course version yet
    return (a.distance_km === b.distance_km) || (a.distance_km == null && b.distance_km == null);
  }
  function compare(a, b) {
    if (!a || !b || a.result_id === b.result_id) return null;
    const crossEdition = a.edition_id !== b.edition_id;
    const aObs = a.observations || [], bObs = b.observations || [];
    const bById = new Map(bObs.map((observation) => [observation.checkpoint_id, observation]));
    const checkpoints = aObs.filter((observation) => sameCheckpoint(observation, bById.get(observation.checkpoint_id), crossEdition))
      .map((observation) => {
        const peer = bById.get(observation.checkpoint_id);
        // Signed gap uses B minus A. Positive = runner A was earlier at this checkpoint.
        return { id: observation.checkpoint_id, name: observation.name, distanceKm: observation.distance_km,
          a: observation.elapsed_seconds, b: peer.elapsed_seconds, gap: peer.elapsed_seconds - observation.elapsed_seconds };
      });
    const finishComparable = !crossEdition && a.status === 'FINISHED' && b.status === 'FINISHED' &&
      validTime(a.finish_seconds) && validTime(b.finish_seconds);
    return { crossEdition, a, b, checkpoints,
      finishComparable, finishGap: finishComparable ? b.finish_seconds - a.finish_seconds : null,
      reason: crossEdition ? 'Olika års banor har inte fastställd gemensam CourseVersion. Tider visas var för sig, utan prestationsgap.' :
      checkpoints.length ? 'Jämförelsen använder endast gemensamma, verkliga mellantider i samma upplaga.' :
      'Ingen gemensam verifierad kontrollpunkt hittades.' };
  }
  const api = { compare, sameCheckpoint };
  root.GaxComparison = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
