#!/usr/bin/env node

/* Geometry primitives for private/local GPX analysis.
 * No raw GPX or derived coordinates are written by this module.
 */
const EARTH_RADIUS_M = 6371008.8;

function attr(tag, name) {
  const match = new RegExp(`${name}="([^"]+)"`).exec(tag);
  return match ? Number(match[1]) : null;
}

function textBetween(block, tag) {
  const match = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i').exec(block);
  return match ? match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : null;
}

function haversine(a, b) {
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLon = (b.lon - a.lon) * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

function project(point, origin) {
  const lat0 = origin.lat * Math.PI / 180;
  return {
    x: (point.lon - origin.lon) * Math.PI / 180 * EARTH_RADIUS_M * Math.cos(lat0),
    y: (point.lat - origin.lat) * Math.PI / 180 * EARTH_RADIUS_M,
    lat: point.lat,
    lon: point.lon,
    ele: point.ele ?? null
  };
}

function distancePointToSegment(point, first, second) {
  const dx = second.x - first.x;
  const dy = second.y - first.y;
  const length2 = dx * dx + dy * dy;
  if (!length2) return Math.hypot(point.x - first.x, point.y - first.y);
  const t = Math.max(0, Math.min(1, ((point.x - first.x) * dx + (point.y - first.y) * dy) / length2));
  return Math.hypot(point.x - (first.x + t * dx), point.y - (first.y + t * dy));
}

function parseTrackPoints(block) {
  return [...block.matchAll(/<trkpt\b[^>]*(?:\/>|>[\s\S]*?<\/trkpt>)/gi)].map((match) => {
    const pointBlock = match[0];
    const start = /^<trkpt\b[^>]*>/i.exec(pointBlock)?.[0] || pointBlock;
    const ele = Number(textBetween(pointBlock, 'ele'));
    const time = textBetween(pointBlock, 'time');
    return {
      lat: attr(start, 'lat'),
      lon: attr(start, 'lon'),
      ele: Number.isFinite(ele) ? ele : null,
      time: time || null
    };
  }).filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lon));
}

function splitAtGaps(points, maxGapM, segmentIndex) {
  const runs = [];
  const interruptions = [];
  const gapEndpoints = [];
  let run = [];
  for (let index = 0; index < points.length; index += 1) {
    const point = points[index];
    if (run.length && haversine(run[run.length - 1], point) > maxGapM) {
      const meters = haversine(run[run.length - 1], point);
      interruptions.push({ segment_index: segmentIndex, index, meters });
      gapEndpoints.push(run[run.length - 1], point);
      if (run.length > 1) runs.push(run);
      run = [];
    }
    run.push(point);
  }
  if (run.length > 1) runs.push(run);
  return { runs, interruptions, gapEndpoints };
}

function parseGpx(xml, options = {}) {
  const maxGapM = options.maxGapM ?? 250;
  const segmentBlocks = [...xml.matchAll(/<trkseg\b[^>]*>[\s\S]*?<\/trkseg>/gi)].map((match) => match[0]);
  const blocks = segmentBlocks.length ? segmentBlocks : [xml];
  const rawSegments = blocks.map(parseTrackPoints).filter((points) => points.length > 1);
  const runs = [];
  const interruptions = [];
  const gapEndpoints = [];
  rawSegments.forEach((points, segmentIndex) => {
    const split = splitAtGaps(points, maxGapM, segmentIndex);
    runs.push(...split.runs);
    interruptions.push(...split.interruptions);
    gapEndpoints.push(...split.gapEndpoints);
  });
  const points = rawSegments.flat();
  return { points, rawSegments, runs, interruptions, gapEndpoints, maxGapM };
}

function resampleRun(run, spacingM, origin) {
  const projected = run.map((point) => project(point, origin));
  const samples = [projected[0]];
  let nextTarget = spacingM;
  let cumulative = 0;
  for (let index = 1; index < projected.length; index += 1) {
    const first = projected[index - 1];
    const second = projected[index];
    const length = Math.hypot(second.x - first.x, second.y - first.y);
    if (!length) continue;
    while (nextTarget <= cumulative + length) {
      const t = (nextTarget - cumulative) / length;
      samples.push({
        x: first.x + (second.x - first.x) * t,
        y: first.y + (second.y - first.y) * t,
        lat: first.lat + (second.lat - first.lat) * t,
        lon: first.lon + (second.lon - first.lon) * t,
        ele: Number.isFinite(first.ele) && Number.isFinite(second.ele) ? first.ele + (second.ele - first.ele) * t : null
      });
      nextTarget += spacingM;
    }
    cumulative += length;
  }
  const last = projected[projected.length - 1];
  const tail = samples[samples.length - 1];
  if (!tail || tail.x !== last.x || tail.y !== last.y) samples.push(last);
  return samples;
}

function resampleRoute(route, options = {}) {
  const spacingM = options.spacingM ?? 25;
  const origin = options.origin ?? route.points[0];
  return route.runs.map((run) => resampleRun(run, spacingM, origin));
}

function lineSegments(samples) {
  return samples.flatMap((sampleRun) => sampleRun.slice(1).map((point, index) => ({ first: sampleRun[index], second: point })));
}

function nearestPointDistance(point, points) {
  let best = Infinity;
  points.forEach((candidate) => { best = Math.min(best, Math.hypot(point.x - candidate.x, point.y - candidate.y)); });
  return best;
}

function nearestLineDistance(point, segments) {
  let best = Infinity;
  segments.forEach((segment) => { best = Math.min(best, distancePointToSegment(point, segment.first, segment.second)); });
  return best;
}

function percentile(values, p) {
  if (!values.length) return null;
  const sorted = values.slice().sort((a, b) => a - b);
  const h = (sorted.length - 1) * p;
  const lo = Math.floor(h);
  const hi = Math.ceil(h);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (h - lo);
}

function summarize(values, thresholds) {
  if (!values.length) return null;
  return {
    samples: values.length,
    median_m: percentile(values, 0.5),
    p95_m: percentile(values, 0.95),
    max_m: Math.max(...values),
    share_over: Object.fromEntries(thresholds.map((threshold) => [String(threshold), values.filter((value) => value > threshold).length / values.length]))
  };
}

function localSamples(sampleRuns, origin, radiusM) {
  const radius = radiusM ?? Infinity;
  return sampleRuns.flat().filter((point) => Math.hypot(point.x, point.y) <= radius);
}

function removeGapMargins(samples, gapEndpoints, origin, bufferM) {
  if (!gapEndpoints.length || !bufferM) return samples;
  const gaps = gapEndpoints.map((point) => project(point, origin));
  return samples.filter((sample) => gaps.every((gap) => Math.hypot(sample.x - gap.x, sample.y - gap.y) > bufferM));
}

function compareRoutes(routeA, routeB, options = {}) {
  const origin = options.origin;
  const radiusM = options.radiusM ?? 5000;
  const spacingM = options.spacingM ?? 25;
  const gapBufferM = options.gapBufferM ?? 250;
  const thresholds = options.thresholds ?? [10, 25, 50, 100, 250];
  const samplesA = resampleRoute(routeA, { spacingM, origin });
  const samplesB = resampleRoute(routeB, { spacingM, origin });
  const segmentsA = lineSegments(samplesA);
  const segmentsB = lineSegments(samplesB);
  const localA = localSamples(samplesA, origin, radiusM);
  const localB = localSamples(samplesB, origin, radiusM);
  const pointsA = removeGapMargins(localA, routeA.gapEndpoints, origin, gapBufferM);
  const pointsB = removeGapMargins(localB, routeB.gapEndpoints, origin, gapBufferM);
  const lineAB = pointsA.map((point) => nearestLineDistance(point, segmentsB));
  const lineBA = pointsB.map((point) => nearestLineDistance(point, segmentsA));
  const pointAB = pointsA.map((point) => nearestPointDistance(point, pointsB));
  const pointBA = pointsB.map((point) => nearestPointDistance(point, pointsA));
  return {
    method: 'projected point-to-line-segment; symmetric; fixed-spacing resampling',
    spacing_m: spacingM,
    radius_m: radiusM,
    gap_buffer_m: gapBufferM,
    gap_threshold_m: routeA.maxGapM,
    line: { a_to_b: summarize(lineAB, thresholds), b_to_a: summarize(lineBA, thresholds), symmetric: summarize(lineAB.concat(lineBA), thresholds) },
    legacy_nearest_point: { a_to_b: summarize(pointAB, thresholds), b_to_a: summarize(pointBA, thresholds), symmetric: summarize(pointAB.concat(pointBA), thresholds) },
    sampled: { a: pointsA.length, b: pointsB.length, local_before_gap_filter: { a: localA.length, b: localB.length } },
    interruptions: { a: routeA.interruptions, b: routeB.interruptions }
  };
}

module.exports = {
  EARTH_RADIUS_M,
  haversine,
  project,
  parseGpx,
  resampleRoute,
  lineSegments,
  distancePointToSegment,
  nearestLineDistance,
  compareRoutes,
  percentile
};
