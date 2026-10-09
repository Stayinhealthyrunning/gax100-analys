#!/usr/bin/env node

/* Reproducible, dependency-free GPX audit.
 * GPX files in data/raw/gpx are private/raw inputs and are intentionally not
 * copied into web/ or committed to the repository.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { parseGpx } = require('./gpx_geometry');

const repo = path.resolve(__dirname, '..');
const inputDir = path.resolve(process.env.GAX_GPX_INPUT_DIR || path.join(repo, 'data', 'raw', 'gpx'));
const outputPath = process.argv[2] ? path.resolve(process.argv[2]) : null;
const EARTH_RADIUS_M = 6371008.8;
const KNAEBACKSHUSEN = { lat: 55.64097, lon: 14.27477 };

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

function percentile(values, p) {
  if (!values.length) return null;
  const sorted = values.slice().sort((a, b) => a - b);
  const h = (sorted.length - 1) * p;
  const lo = Math.floor(h);
  const hi = Math.ceil(h);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (h - lo);
}

function audit(fileName) {
  const filePath = path.join(inputDir, fileName);
  const xml = fs.readFileSync(filePath);
  const source = xml.toString('utf8');
  const points = [...source.matchAll(/<trkpt\b[^>]*>[\s\S]*?<\/trkpt>/gi)].map((match) => {
    const block = match[0];
    const start = /^<trkpt\b[^>]*>/i.exec(block)?.[0] || block;
    const ele = Number(textBetween(block, 'ele'));
    const timeText = textBetween(block, 'time');
    return {
      lat: attr(start, 'lat'),
      lon: attr(start, 'lon'),
      ele: Number.isFinite(ele) ? ele : null,
      time: timeText || null
    };
  }).filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lon));
  const geometry = parseGpx(source, { maxGapM: 250 });
  const distances = [];
  let cumulativeM = 0;
  geometry.runs.forEach((run) => {
    for (let i = 1; i < run.length; i += 1) {
      const distance = haversine(run[i - 1], run[i]);
      distances.push(distance);
      cumulativeM += distance;
    }
  });
  const jumps = geometry.interruptions.map((item) => ({ index: item.index, meters: Math.round(item.meters * 10) / 10 }));
  let nearest = null;
  let nearestRouteKm = null;
  cumulativeM = 0;
  geometry.runs.forEach((run) => run.forEach((point, index) => {
    if (index > 0) cumulativeM += haversine(run[index - 1], point);
    const distance = haversine(point, KNAEBACKSHUSEN);
    if (!nearest || distance < nearest.meters) {
      nearest = { index, meters: Math.round(distance * 10) / 10, lat: point.lat, lon: point.lon };
      nearestRouteKm = Math.round(cumulativeM / 10) / 100;
    }
  }));
  const elevations = points.map((point) => point.ele).filter(Number.isFinite);
  const times = points.map((point) => point.time ? Date.parse(point.time) : NaN).filter(Number.isFinite);
  const creator = /<gpx\b[^>]*\bcreator="([^"]+)"/i.exec(source)?.[1] || null;
  const name = textBetween(source, 'name');
  const sourceLink = /<link\b[^>]*href="([^"]+)"/i.exec(source)?.[1] || null;
  const totalDistanceM = distances.reduce((sum, value) => sum + value, 0);
  const intervals = times.slice(1).map((time, index) => (time - times[index]) / 1000).filter(Number.isFinite);
  const currentExport = times.length && new Date(times[0]).getUTCFullYear() >= 2026 && new Date(times[0]).getUTCFullYear() <= 2027;
  const timeQuality = !times.length ? 'saknas' : currentExport ? 'exporttid; ej löpartid' : 'ej verifierad som löpartid';
  return {
    file: fileName,
    sha256: crypto.createHash('sha256').update(xml).digest('hex'),
    bytes: xml.length,
    creator,
    name,
    sourceLink,
    points: points.length,
    track_segments: geometry.rawSegments.length,
    continuous_runs: geometry.runs.length,
    interruptions_over_250m: jumps,
    distance_km: Math.round(totalDistanceM / 10) / 100,
    bounds: points.length ? {
      min_lat: Math.min(...points.map((point) => point.lat)),
      max_lat: Math.max(...points.map((point) => point.lat)),
      min_lon: Math.min(...points.map((point) => point.lon)),
      max_lon: Math.max(...points.map((point) => point.lon))
    } : null,
    knaebackshusen: { reference: KNAEBACKSHUSEN, nearest, route_km: nearestRouteKm },
    elevation: elevations.length ? {
      points: elevations.length,
      min_m: Math.min(...elevations),
      max_m: Math.max(...elevations),
      p10_m: Math.round(percentile(elevations, 0.1) * 100) / 100,
      p50_m: Math.round(percentile(elevations, 0.5) * 100) / 100,
      p90_m: Math.round(percentile(elevations, 0.9) * 100) / 100,
      missing_points: points.length - elevations.length
    } : { points: 0, missing_points: points.length },
    timestamps: {
      points: times.length,
      first: times.length ? new Date(times[0]).toISOString() : null,
      last: times.length ? new Date(times[times.length - 1]).toISOString() : null,
      quality: timeQuality,
      median_interval_s: intervals.length ? percentile(intervals, 0.5) : null,
      monotonic: intervals.every((value) => value >= 0)
    },
    jumps_over_250m: jumps.slice(0, 20),
    likely_geometry: points.length > 1000 && totalDistanceM > 150000,
    likely_exported_route: creator === 'www.plotaroute.com' || creator === 'AllTrails.com' || creator === 'AllTrails.com'
  };
}

if (!fs.existsSync(inputDir)) {
  console.error(`GPX-katalog saknas: ${inputDir}`);
  process.exit(1);
}
const files = fs.readdirSync(inputDir).filter((file) => file.toLowerCase().endsWith('.gpx')).sort();
const report = { generated_at: new Date().toISOString(), input_dir: 'data/raw/gpx', files: files.map(audit) };
if (outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
}
for (const item of report.files) {
  console.log(`${item.file}\t${item.points} points\t${item.distance_km} km\t${item.creator || 'creator saknas'}\t${item.timestamps.quality}\t${item.sha256}`);
}
console.log(`PASS: ${report.files.length} GPX-filer analyserade`);
