const { roundSeconds, formatClock } = require('../web/time');

function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label}: fick ${actual}, väntade ${expected}`);
}

assertEqual(roundSeconds(3599.49), 3599, 'avrundning nedåt');
assertEqual(roundSeconds(3599.5), 3600, 'avrundning uppåt');
assertEqual(formatClock(3599.5), '1:00:00', 'timväxling efter avrundning');
assertEqual(formatClock(3661.6), '1:01:02', 'avrundade sekunder');
assertEqual(formatClock(null), '—', 'saknad tid');
if (/\./.test(formatClock(1234.56))) throw new Error('formatteringen får inte visa flyttalsdecimaler');
console.log(JSON.stringify({ pass: true, rounded_examples: ['1:00:00', '1:01:02'] }, null, 2));
