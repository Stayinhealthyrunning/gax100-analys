const { median, percentile } = require('../web/statistics');
function assertEqual(actual, expected, label) { if (actual !== expected) throw new Error(`${label}: fick ${actual}, väntade ${expected}`); }
assertEqual(median([1, 2, 3, 4, 5]), 3, 'median udda');
assertEqual(median([1, 2, 3, 4]), 2.5, 'median jämn');
assertEqual(percentile([0, 10, 20, 30, 40], 0.1), 4, 'P10 interpolation');
assertEqual(percentile([0, 10, 20, 30, 40], 0.5), 20, 'P50 interpolation');
assertEqual(percentile([0, 10, 20, 30, 40], 0.9), 36, 'P90 interpolation');
console.log(JSON.stringify({ pass: true, median_even: 2.5, percentile_method: 'linear interpolation h=(n-1)*p' }, null, 2));
