/* GAX100 field analytics: verified results only, no inferred checkpoint or GPS data. */
(function installGaxField(root) {
  'use strict';
  const api = (() => {
    const validFinish = (r) => r && r.status === 'FINISHED' && Number.isFinite(r.finish_seconds) && r.finish_seconds > 0;
    const median = (v) => quantile(v, 0.5);
    function quantile(input, p) {
      const values = input.filter(Number.isFinite).slice().sort((a, b) => a - b);
      if (!values.length || !Number.isFinite(p) || p < 0 || p > 1) return null;
      const offset = (values.length - 1) * p;
      const low = Math.floor(offset), high = Math.ceil(offset), fraction = offset - low;
      return values[low] + (values[high] - values[low]) * fraction;
    }
    function groupGender(raw) {
      if (/^(kvinnor|damer)$/i.test(String(raw || '').trim())) return 'Kvinnor';
      if (/^(män|herrar)$/i.test(String(raw || '').trim())) return 'Män';
      return null;
    }
    // A historical cohort must have the same *actual* checkpoint sequence and
    // compatible published distances within ONE edition; no year-to-year merge.
    function cohortSignature(segments) {
      return JSON.stringify(segments.map((segment) => [segment.checkpointId, segment.checkpointKm == null ? null : Math.round(segment.checkpointKm * 100) / 100]));
    }
    function cohort(results) {
      const groups = new Map();
      for (const runner of results.filter(validFinish)) {
        const segments = root.GaxPlan.timeline(runner);
        if (!segments || segments.length < 3) continue;
        const key = cohortSignature(segments);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push({runner, segments});
      }
      const largest = [...groups.values()].sort((a, b) => b.length - a.length)[0] || [];
      if (largest.length < 5) return null;
      const segments = largest[0].segments.map((segment, index) => {
        const durations = largest.map(({segments}) => segments[index].seconds);
        const fractions = largest.map(({runner, segments}) => 100 * segments[index].seconds / runner.finish_seconds);
        return {
          from: segment.from, to: segment.to, checkpointId: segment.checkpointId,
          distanceKm: segment.distanceKm, checkpointKm: segment.checkpointKm,
          n: largest.length, medianSeconds: median(durations),
          p25Seconds: largest.length >= 10 ? quantile(durations, 0.25) : null,
          p75Seconds: largest.length >= 10 ? quantile(durations, 0.75) : null,
          p10Seconds: largest.length >= 20 ? quantile(durations, 0.10) : null,
          p90Seconds: largest.length >= 20 ? quantile(durations, 0.90) : null,
          medianPercent: median(fractions)
        };
      });
      return { runners: largest, n: largest.length, segments };
    }
    function dnfObserved(results) {
      const abandoned = results.filter((r) => r.status === 'DNF');
      const seen = new Map();
      let withoutPassage = 0;
      for (const runner of abandoned) {
        const obs = (runner.observations || []).filter((o) =>
          typeof o.name === 'string' && o.name && typeof o.checkpoint_id === 'string' &&
          Number.isFinite(o.elapsed_seconds) && o.elapsed_seconds >= 0);
        const monotonic = obs.every((o, i) => !i || o.elapsed_seconds >= obs[i - 1].elapsed_seconds);
        if (!obs.length || !monotonic) { withoutPassage += 1; continue; }
        const last = obs[obs.length - 1];
        const key = last.checkpoint_id;
        if (!seen.has(key)) seen.set(key, { name:last.name, count:0 });
        seen.get(key).count++;
      }
      return {total: abandoned.length, withoutPassage, observed: [...seen.values()].sort((a,b) => b.count - a.count)};
    }
    function finishSprint(cohortData) {
      if (!cohortData || cohortData.n < 5) return null;
      const entries = cohortData.runners.map(({runner, segments}) => ({
        resultId:runner.result_id, name:runner.name,
        gender:groupGender(runner.gender), seconds:segments[segments.length - 1].seconds
      })).filter((r) => Number.isFinite(r.seconds) && r.seconds > 0)
        .sort((a,b) => a.seconds - b.seconds || a.resultId.localeCompare(b.resultId));
      const genders = {};
      for (const label of ['Kvinnor','Män']) {
        const group = entries.filter((x) => x.gender === label);
        genders[label] = group.length >= 5 ? {n:group.length, top:group.slice(0,3)} : null;
      }
      return {checkpoint:cohortData.segments[cohortData.segments.length-2].to,
        n:entries.length, top:entries.slice(0,5), genders};
    }
    function clubs(results) {
      const groups = new Map();
      for (const r of results.filter(validFinish)) {
        if (typeof r.club !== 'string' || !r.club.trim()) continue;
        const club = r.club.trim();
        if (!groups.has(club)) groups.set(club, []);
        groups.get(club).push(r.finish_seconds);
      }
      return [...groups.entries()].filter(([,times]) => times.length >= 5)
        .map(([name,times]) => ({name,n:times.length,medianSeconds:median(times)}))
        .sort((a,b) => b.n - a.n || a.name.localeCompare(b.name, 'sv')).slice(0, 6);
    }
    function genders(results) {
      const finishers = results.filter(validFinish);
      const data = {};
      for (const label of ['Kvinnor','Män']) {
        const values = finishers.filter((r) => groupGender(r.gender) === label).map((r)=>r.finish_seconds);
        data[label] = values.length >= 5 ? {n:values.length,medianSeconds:median(values)} : null;
      }
      return { ...data, reported:finishers.filter((r) => groupGender(r.gender)).length, total:finishers.length };
    }
    function targetPosition(results, seconds) {
      const finishers = results.filter(validFinish);
      if (finishers.length < 5 || !Number.isSafeInteger(seconds) || seconds <= 0) return null;
      const faster = finishers.filter((r) => r.finish_seconds < seconds).length;
      const atOrBefore = finishers.filter((r) => r.finish_seconds <= seconds).length;
      return {n:finishers.length, faster, atOrBefore, fraction:atOrBefore / finishers.length,
        approximatePlace:faster+1, medianSeconds:median(finishers.map((r)=>r.finish_seconds)) };
    }

    function runnerGap(runner, results) {
      if (!runner || !Array.isArray(results) || results.some((r) => r.edition_id !== runner.edition_id)) return null;
      const complete = cohort(results);
      if (!complete) return null;
      const selected = complete.runners.find((entry) => entry.runner.result_id === runner.result_id);
      if (!selected) return null;
      const rows = [{name:'Start',checkpointId:'START', elapsedSeconds:0, medianElapsedSeconds:0, gapSeconds:0}];
      let cumulative = 0;
      for (let i = 0; i < selected.segments.length; i++) {
        cumulative += selected.segments[i].seconds;
        const cohortCumulative = complete.runners.map(({segments}) =>
          segments.slice(0,i+1).reduce((sum,seg) => sum + seg.seconds,0));
        const reference = median(cohortCumulative);
        rows.push({
          name: selected.segments[i].to,
          checkpointId: selected.segments[i].checkpointId,
          elapsedSeconds:cumulative,
          medianElapsedSeconds:reference,
          gapSeconds:cumulative-reference
        });
      }
      return {n:complete.n,editionId:runner.edition_id,rows};
    }


    // Two REAL cohort anchors (START, verified checkpoints or official FINISH).
    // This deliberately exposes only cohort aggregates: participant-level ranks
    // are withheld until the publication/privacy gate for historical minors
    // and opt-outs has been independently established.
    function segmentLab(results, fromIndex, toIndex, group = 'all') {
      if (!Array.isArray(results)) return null;
      const distinct = new Set(results.map(r => r.edition_id));
      if (distinct.size !== 1) return null;
      const complete = cohort(results);
      if (!complete) return null;
      const anchors = [{name:'Start',id:'START',km:0}, ...complete.segments.map((segment, i) => ({
        name:segment.to, id:segment.checkpointId,
        km:segment.checkpointKm == null ? null : segment.checkpointKm
      }))];
      if (!Number.isInteger(fromIndex) || !Number.isInteger(toIndex) ||
          fromIndex < 0 || toIndex <= fromIndex || toIndex >= anchors.length ||
          !['all','female','male'].includes(group)) return null;
      const neededGender = group === 'female' ? 'Kvinnor' : group === 'male' ? 'Män' : null;
      const cohortRows = complete.runners.filter(({runner}) =>
        !neededGender || groupGender(runner.gender) === neededGender);
      if (cohortRows.length < 5) return null;
      const durations = cohortRows.map(({segments}) => segments
        .slice(fromIndex,toIndex).reduce((acc,segment)=>acc+segment.seconds,0));
      if (durations.some(n=>!Number.isFinite(n)||n<=0)) return null;
      const distance = Number.isFinite(anchors[fromIndex].km) && Number.isFinite(anchors[toIndex].km) &&
        anchors[toIndex].km>anchors[fromIndex].km ?
          anchors[toIndex].km-anchors[fromIndex].km : null;
      return {
        anchors, fromIndex, toIndex, group, n:cohortRows.length,
        from:anchors[fromIndex].name, to:anchors[toIndex].name,
        distanceKm:distance, medianSeconds:median(durations),
        q25Seconds:cohortRows.length >= 10 ? quantile(durations,.25) : null,
        q75Seconds:cohortRows.length >= 10 ? quantile(durations,.75) : null,
        p10Seconds:cohortRows.length >= 20 ? quantile(durations,.10) : null,
        p90Seconds:cohortRows.length >= 20 ? quantile(durations,.90) : null,
        // Cohort rows stay internal; return only aggregated public statistics.
      };
    }

    function analyze(results) {
      if (!Array.isArray(results)) throw new TypeError('Edition results expected');
      const editions = new Set(results.map((r) => r.edition_id));
      if (editions.size > 1) throw new RangeError('Never combine editions into a single historical cohort');
      const full = cohort(results);
      return {complete:full ? {n:full.n,segments:full.segments} : null, sprint:finishSprint(full),
        dnf:dnfObserved(results), genders:genders(results), clubs:clubs(results)};
    }
    return {quantile, groupGender, cohort, dnfObserved, targetPosition, runnerGap, segmentLab, analyze};
  })();
  root.GaxField = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
