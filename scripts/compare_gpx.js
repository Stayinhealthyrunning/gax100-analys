#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const repo = path.resolve(__dirname, '..');
const inputDir = path.join(repo, 'data', 'raw', 'gpx');
const reference = { lat: 55.64097, lon: 14.27477 };
const radiusM = Number(process.argv[2] || 5000);
const earthM = 6371008.8;

function distanceM(a, b) {
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLon = (b.lon - a.lon) * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * earthM * Math.asin(Math.sqrt(h));
}

function points(file) {
  const xml = fs.readFileSync(path.join(inputDir, file), 'utf8');
  return [...xml.matchAll(/<trkpt\b[^>]*>/gi)].map((match) => ({
    lat: Number(/lat="([^"]+)"/.exec(match[0])[1]),
    lon: Number(/lon="([^"]+)"/.exec(match[0])[1])
  }));
}

function nearest(point, track) {
  let minimum = Infinity;
  for (const candidate of track) minimum = Math.min(minimum, distanceM(point, candidate));
  return minimum;
}

const files = fs.readdirSync(inputDir).filter((file) => file.toLowerCase().endsWith('.gpx')).sort();
const tracks = Object.fromEntries(files.map((file) => [file, points(file)]));
const local = Object.fromEntries(files.map((file) => [file, tracks[file].filter((point) => distanceM(point, reference) <= radiusM)]));
console.log(`Knäbäckshusen referens ${reference.lat},${reference.lon}; analysradie ${radiusM} m`);
for (const file of files) console.log(`${file}\t${local[file].length} lokala punkter`);
for (let i = 0; i < files.length; i += 1) {
  for (let j = i + 1; j < files.length; j += 1) {
    const a = files[i];
    const b = files[j];
    const ab = Math.max(...local[a].map((point) => nearest(point, local[b])));
    const ba = Math.max(...local[b].map((point) => nearest(point, local[a])));
    console.log(`${a} vs ${b}\tHausdorff-liknande lokal avvikelse ${Math.round(Math.max(ab, ba) * 10) / 10} m`);
  }
}
