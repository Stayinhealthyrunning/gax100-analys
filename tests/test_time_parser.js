const { parseClockSeconds } = require('../scripts/time');
function assertEqual(actual, expected, label) { if (actual !== expected) throw new Error(`${label}: fick ${actual}, väntade ${expected}`); }
assertEqual(parseClockSeconds('4:51(31)'), 4 * 3600 + 51 * 60, 'parentesrank');
assertEqual(parseClockSeconds('4.12.12 (1)'), 4 * 3600 + 12 * 60 + 12, 'punktformat');
assertEqual(parseClockSeconds('4,38,50(5)'), 4 * 3600 + 38 * 60 + 50, 'kommaformat');
assertEqual(parseClockSeconds('18:49;30(2)'), 18 * 3600 + 49 * 60 + 30, 'semikolonformat');
assertEqual(parseClockSeconds('05h39m'), 5 * 3600 + 39 * 60, 'textformat');
assertEqual(parseClockSeconds('Ended the race'), null, 'statusfri text');
assertEqual(parseClockSeconds('7,54,3016)'), null, 'otydigt felvärde');
console.log(JSON.stringify({ pass: true, parser_checks: 7 }, null, 2));
