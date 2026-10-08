const state = { data: null, year: null, query: '', club: '', sort: 'time', selected: null, compare: [], duel: [] };
const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const time = (seconds) => seconds == null ? '—' : `${Math.floor(seconds / 3600)}:${String(Math.floor(seconds % 3600 / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
const edition = () => state.data.editions.find((item) => item.edition_id === state.year);
const editionResults = (editionId) => state.data.results.filter((result) => result.edition_id === editionId);
const median = (values) => { const sorted = values.filter(Number.isFinite).sort((a, b) => a - b); return sorted.length ? sorted[Math.floor((sorted.length - 1) / 2)] : null; };
const mean = (values) => { const valid = values.filter(Number.isFinite); return valid.length ? Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length) : null; };

function rows() {
  const filtered = editionResults(state.year).filter((result) => {
    const matchesQuery = !state.query || `${result.name} ${result.club || ''}`.toLowerCase().includes(state.query.toLowerCase());
    return matchesQuery && (!state.club || result.club === state.club);
  });
  return filtered.sort((left, right) => state.sort === 'name'
    ? left.name.localeCompare(right.name, 'sv')
    : state.sort === 'status'
      ? left.status.localeCompare(right.status)
      : (left.finish_seconds ?? 1e12) - (right.finish_seconds ?? 1e12));
}

function renderFacts() {
  const all = editionResults(state.year);
  const finished = all.filter((result) => result.status === 'FINISHED');
  const dnf = all.filter((result) => result.status === 'DNF');
  const women = finished.filter((result) => /Kvinnor|Damer/i.test(result.gender || ''));
  const men = finished.filter((result) => /Män|Herrar/i.test(result.gender || ''));
  const best = finished.filter((result) => Number.isFinite(result.finish_seconds)).sort((a, b) => a.finish_seconds - b.finish_seconds)[0];
  $('#facts').innerHTML = `<div class="fact"><h3>STARTANDE</h3><strong>Ej fastställt</strong><small>källan skiljer inte alltid startande från publicerade poster</small></div><div class="fact"><h3>FULLFÖLJDE</h3><strong>${finished.length}</strong><small>${all.length ? Math.round(finished.length / all.length * 1000) / 10 : 0}% av importerade poster</small></div><div class="fact"><h3>DNF</h3><strong>${dnf.length}</strong><small>explicit källstödd status</small></div><div class="fact gender"><h3>TIDER KVINNOR / MÄN</h3><strong><span class="f">Kvinnor median ${time(median(women.map((result) => result.finish_seconds)))} · medel ${time(mean(women.map((result) => result.finish_seconds)))}</span><span class="m">Män median ${time(median(men.map((result) => result.finish_seconds)))} · medel ${time(mean(men.map((result) => result.finish_seconds)))}</span></strong></div><div class="fact"><h3>SNABBASTE TID</h3><strong>${best ? time(best.finish_seconds) : '—'}</strong><small>${best ? esc(best.name) : 'Ej fastställt'}</small></div>`;
}

function renderFilters() {
  const clubs = [...new Set(editionResults(state.year).filter((result) => result.club).map((result) => result.club))].sort((a, b) => a.localeCompare(b, 'sv'));
  $('#club').innerHTML = '<option value="">Alla klubbar</option>' + clubs.map((club) => `<option value="${esc(club)}">${esc(club)}</option>`).join('');
  $('#club').value = state.club;
}

function renderRows() {
  const visibleRows = rows();
  $('#result-count').textContent = `${visibleRows.length} träffar i ${esc(edition()?.edition_label || 'vald upplaga')}`;
  $('#rows').innerHTML = visibleRows.slice(0, 300).map((result) => `<tr><td>${esc(result.name) || '—'}</td><td>${esc(result.gender) || '—'}</td><td>${esc(result.club) || '—'}</td><td class="status-${esc(result.status.toLowerCase())}">${esc(result.status)}</td><td>${time(result.finish_seconds)}</td><td><button data-id="${esc(result.result_id)}">Öppna</button><button data-compare="${esc(result.result_id)}">${state.compare.includes(result.result_id) ? 'Ta bort' : 'Jämför'}</button><button data-duel="${esc(result.result_id)}">${state.duel.includes(result.result_id) ? 'Ta bort duell' : 'Kartduell'}</button></td></tr>`).join('');
  document.querySelectorAll('[data-id]').forEach((button) => { button.onclick = () => { state.selected = state.data.results.find((result) => result.result_id === button.dataset.id); renderRunner(); renderPlan(); }; });
  document.querySelectorAll('[data-compare]').forEach((button) => { button.onclick = () => { const id = button.dataset.compare; state.compare = state.compare.includes(id) ? state.compare.filter((item) => item !== id) : state.compare.length < 2 ? [...state.compare, id] : state.compare; renderRows(); renderComparison(); }; });
  document.querySelectorAll('[data-duel]').forEach((button) => { button.onclick = () => { const id = button.dataset.duel; state.duel = state.duel.includes(id) ? state.duel.filter((item) => item !== id) : state.duel.length < 5 ? [...state.duel, id] : state.duel; renderRows(); renderMapDuel(); }; });
}

function renderRunner() {
  const result = state.selected;
  if (!result) { $('#runner').className = 'runner empty'; $('#runner').textContent = 'Välj en rad i resultatdatabasen för individuell visning.'; return; }
  const observations = result.observations || [];
  const segments = observations.map((observation, index) => {
    const previous = index ? observations[index - 1].elapsed_seconds : 0;
    const segmentSeconds = Number.isFinite(observation.elapsed_seconds) ? observation.elapsed_seconds - previous : null;
    return `<tr><td>${esc(observation.name)}</td><td>${esc(observation.distance_km ?? 'källavstånd saknas')}</td><td>${esc(observation.raw_time)}</td><td>${time(segmentSeconds)}</td></tr>`;
  }).join('');
  $('#runner').className = 'runner';
  $('#runner').innerHTML = `<h3>${esc(result.name)}</h3><p>${esc(result.status)} · sluttid ${time(result.finish_seconds)} · ${esc(result.club || 'klubb saknas')}</p><h4>Verkliga mellantider och delsträckor</h4>${segments ? `<table class="segment-table"><tr><th>Kontrollpunkt</th><th>km</th><th>Källtid</th><th>Delsträcka</th></tr>${segments}</table>` : '<p>Inga importerade mellantidsobservationer för detta resultat.</p>'}<p class="muted">GPS-position och replay är otillgängliga utan verifierad GPX-geometri.</p>`;
}

function renderPlan() {
  const result = state.selected;
  const observations = result?.observations || [];
  if (observations.length < 2) { $('#plan').className = 'runner empty'; $('#plan').textContent = 'Personlig loppplan är gated: välj ett resultat med minst två verifierade mellantider.'; return; }
  const segments = observations.map((observation, index) => {
    const previous = index ? observations[index - 1].elapsed_seconds : 0;
    return `<tr><td>${esc(observation.name)}</td><td>${esc(observation.distance_km ?? 'källavstånd saknas')}</td><td>${time(Number.isFinite(observation.elapsed_seconds) ? observation.elapsed_seconds - previous : null)}</td></tr>`;
  }).join('');
  $('#plan').className = 'runner';
  $('#plan').innerHTML = `<h3>Historisk personlig referens: ${esc(result.name)}</h3><p>Planen återger verifierade delsträckor från valt resultat. Den prognostiserar inte saknade tider och ersätter inte GPX-baserad banplanering.</p><table class="segment-table"><tr><th>Kontrollpunkt</th><th>km</th><th>Verifierad delsträcka</th></tr>${segments}</table>`;
}

function renderComparison() {
  const selected = state.compare.map((id) => state.data.results.find((result) => result.result_id === id)).filter(Boolean);
  if (selected.length !== 2) { $('#comparison').className = 'runner empty'; $('#comparison').textContent = `${selected.length}/2 resultat valda.`; return; }
  const maps = selected.map((result) => new Map((result.observations || []).map((observation) => [observation.checkpoint_id, observation])));
  const common = [...maps[0].keys()].filter((key) => maps[1].has(key));
  const lines = common.map((key) => {
    const first = maps[0].get(key); const second = maps[1].get(key); const gap = first.elapsed_seconds - second.elapsed_seconds;
    return `<tr><td>${esc(first.name)}</td><td>${time(first.elapsed_seconds)}</td><td>${time(second.elapsed_seconds)}</td><td>${gap >= 0 ? '+' : '-'}${time(Math.abs(gap))}</td></tr>`;
  }).join('');
  $('#comparison').className = 'runner';
  $('#comparison').innerHTML = `<h3>${esc(selected[0].name)} vs ${esc(selected[1].name)}</h3>${lines ? `<table class="segment-table"><tr><th>Kontrollpunkt</th><th>${esc(selected[0].name)}</th><th>${esc(selected[1].name)}</th><th>Gap</th></tr>${lines}</table>` : '<p>Ingen gemensam verifierad mellantid.</p>'}`;
}

function renderMapDuel() {
  const selected = state.duel.map((id) => state.data.results.find((result) => result.result_id === id)).filter(Boolean);
  if (selected.length < 2) { $('#map-duel').className = 'runner empty'; $('#map-duel').textContent = `${selected.length}/2–5 resultat valda. Välj minst två.`; return; }
  $('#map-duel').className = 'runner';
  $('#map-duel').innerHTML = `<h3>Förberedda kartduellresultat (${selected.length}/5)</h3><ol>${selected.map((result) => `<li>${esc(result.name)} · ${esc(result.status)} · ${time(result.finish_seconds)}</li>`).join('')}</ol><p>Kartduell/replay är fortfarande gated: autentisk GPX-geometri och verifierad tidskoppling saknas.</p>`;
}

function chart() {
  const finished = editionResults(state.year).filter((result) => result.status === 'FINISHED' && Number.isFinite(result.finish_seconds));
  if (!finished.length) { $('#histogram').textContent = 'Ingen verifierad sluttidsdata.'; $('#scatter').textContent = 'Ingen verifierad placeringsdata.'; return; }
  const width = 420; const height = 160; const bins = 6; const min = Math.min(...finished.map((result) => result.finish_seconds)); const max = Math.max(...finished.map((result) => result.finish_seconds)); const step = Math.max(1, (max - min) / bins); const counts = Array(bins).fill(0);
  finished.forEach((result) => { counts[Math.min(bins - 1, Math.floor((result.finish_seconds - min) / step))] += 1; });
  const barWidth = 350 / bins; const maxCount = Math.max(...counts);
  $('#histogram').innerHTML = `<svg viewBox="0 0 ${width} ${height}" aria-label="Sluttid i ${bins} tidsintervall"><line class="axis" x1="32" y1="140" x2="400" y2="140"/>${counts.map((count, index) => `<rect class="bar" x="${38 + index * barWidth}" y="${140 - count / maxCount * 105}" width="${barWidth - 5}" height="${count / maxCount * 105}"/><text x="${38 + index * barWidth}" y="155">${time(min + index * step).slice(0, 5)}</text>`).join('')}<text x="4" y="20">antal</text></svg>`;
  const points = finished.filter((result) => /^\d+$/.test(String(result.rank || ''))).slice(0, 120); const maxRank = Math.max(...points.map((result) => Number(result.rank)), 1); const maxTime = max;
  $('#scatter').innerHTML = `<svg viewBox="0 0 420 160" aria-label="Tid mot placering"><line class="axis" x1="32" y1="140" x2="400" y2="140"/><line class="axis" x1="32" y1="10" x2="32" y2="140"/>${points.map((result) => `<circle class="dot" cx="${38 + Number(result.rank) / maxRank * 350}" cy="${135 - result.finish_seconds / maxTime * 120}" r="2.5"/>`).join('')}<text x="160" y="155">placering →</text><text x="4" y="20">tid</text></svg>`;
  $('#stats-note').textContent = `${finished.length} FINISHED-resultat med sluttid används. Diagrammen är beskrivande och bygger inte på saknade observationer.`;
}

function renderPercentiles() {
  const values = editionResults(state.year).filter((result) => result.status === 'FINISHED' && Number.isFinite(result.finish_seconds)).map((result) => result.finish_seconds).sort((a, b) => a - b);
  if (!values.length) { $('#percentiles').textContent = 'Ingen verifierad sluttidsdata.'; return; }
  const percentile = (fraction) => time(values[Math.min(values.length - 1, Math.floor((values.length - 1) * fraction))]);
  $('#percentiles').className = 'runner';
  $('#percentiles').innerHTML = `<table class="segment-table"><tr><th>P10</th><th>P50 median</th><th>P90</th><th>Underlag</th></tr><tr><td>${percentile(.1)}</td><td>${percentile(.5)}</td><td>${percentile(.9)}</td><td>${values.length} FINISHED med sluttid</td></tr></table>`;
}

function renderHistory() {
  const editions = state.data.editions.slice().sort((a, b) => b.year - a.year || b.edition_id.localeCompare(a.edition_id));
  $('#history').innerHTML = editions.map((item) => {
    const results = editionResults(item.edition_id); const finished = results.filter((result) => result.status === 'FINISHED'); const times = finished.map((result) => result.finish_seconds); const observations = results.reduce((sum, result) => sum + (result.observations || []).length, 0); const fastest = times.filter(Number.isFinite).sort((a, b) => a - b)[0];
    return `<tr><td>${esc(item.edition_label)}</td><td>${finished.length}</td><td>${results.filter((result) => result.status === 'DNF').length}</td><td>${time(median(times))}</td><td>${time(fastest)}</td><td>${observations}</td></tr>`;
  }).join('');
}

function render() { renderFacts(); renderFilters(); renderRows(); renderRunner(); renderPlan(); renderComparison(); renderMapDuel(); chart(); renderPercentiles(); renderHistory(); }

fetch('data.json').then((response) => response.json()).then((data) => { state.data = data; state.year = data.editions.slice().sort((a, b) => b.year - a.year || b.edition_id.localeCompare(a.edition_id))[0].edition_id; $('#year').innerHTML = data.editions.map((item) => `<option value="${esc(item.edition_id)}">${esc(item.edition_label)}</option>`).join(''); $('#year').value = state.year; render(); });
$('#year').onchange = (event) => { state.year = event.target.value; state.selected = null; state.club = ''; state.compare = []; state.duel = []; render(); };
$('#search').oninput = (event) => { state.query = event.target.value; renderRows(); };
$('#club').onchange = (event) => { state.club = event.target.value; renderRows(); };
$('#sort').onchange = (event) => { state.sort = event.target.value; renderRows(); };
$('#clear-comparison').onclick = () => { state.compare = []; renderRows(); renderComparison(); };
