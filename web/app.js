const state = { data: null, year: null, query: '', club: '', gender: '', sort: 'time', page: 1, pageSize: 10, selected: null, compare: [], duel: [], favorites: new Set(), planTarget: null, segmentIndex: null };
const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const time = (seconds) => GaxTime.formatClock(seconds);
const edition = () => state.data.editions.find((item) => item.edition_id === state.year);
const editionResults = (editionId) => state.data.results.filter((result) => result.edition_id === editionId);
const median = (values) => GaxStatistics.median(values);
const percentile = (values, probability) => GaxStatistics.percentile(values, probability);
const mean = (values) => { const valid = values.filter(Number.isFinite); return valid.length ? Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length) : null; };

function rows() {
  const filtered = editionResults(state.year).filter((result) => {
    const matchesQuery = !state.query || `${result.name} ${result.bib || result.start_number || ''} ${result.club || ''}`.toLowerCase().includes(state.query.toLowerCase());
    const matchesGender = !state.gender || result.gender === state.gender;
    return matchesQuery && (!state.club || result.club === state.club) && matchesGender;
  });
  return filtered.sort((left, right) => state.sort === 'name'
    ? left.name.localeCompare(right.name, 'sv')
    : state.sort === 'status'
      ? left.status.localeCompare(right.status)
      : (left.finish_seconds ?? 1e12) - (right.finish_seconds ?? 1e12));
}

function renderFacts() {
  const all = editionResults(state.year);
  const finished = all.filter((result) => result.status === 'FINISHED' && Number.isFinite(result.finish_seconds) && result.finish_seconds > 0);
  const dnf = all.filter((result) => result.status === 'DNF');
  const women = finished.filter((result) => /Kvinnor|Damer/i.test(result.gender || ''));
  const men = finished.filter((result) => /Män|Herrar/i.test(result.gender || ''));
  const best = finished.filter((result) => Number.isFinite(result.finish_seconds)).sort((a, b) => a.finish_seconds - b.finish_seconds)[0];
  const starters = Number.isFinite(edition()?.starters) ? edition().starters : null;
  const starterLabel = starters === null ? 'Ej fastställt' : starters;
  const starterNote = edition()?.starters_note || 'officiell källa skiljer inte startande från publicerade poster';
  const groupLine = (label, values) => values.length >= 5 ? `${label} · Mediantid ${time(median(values))} · Medeltid ${time(mean(values))} · n=${values.length}` : `${label} · Underlag saknas (n=${values.length})`;
  const finishRate = starters ? ` · ${Math.round(finished.length / starters * 100)} % av fastställda startande` : '';
  $('#facts').innerHTML = `<div class="fact"><h3>STARTANDE</h3><strong>${starterLabel}</strong><small>${esc(starterNote)}</small></div><div class="fact"><h3>FULLFÖLJDE</h3><strong>${finished.length}</strong><small>${starters === null ? 'giltig officiell sluttid; startantal ej fastställt' : `giltig officiell sluttid av ${starters} startande${finishRate}`}</small></div><div class="fact"><h3>DNF</h3><strong>${dnf.length}</strong><small>${starters ? `${Math.round(dnf.length / starters * 100)} % av fastställda startande` : 'explicit källstödd status'}</small></div><div class="fact gender"><h3>TIDER KVINNOR / MÄN</h3><strong><span class="f">${esc(groupLine('Kvinnor', women.map((result) => result.finish_seconds)))}</span><span class="m">${esc(groupLine('Män', men.map((result) => result.finish_seconds)))}</span></strong></div><div class="fact"><h3>SNABBASTE TID</h3><strong>${best ? time(best.finish_seconds) : '—'}</strong><small>${best ? esc(best.name) : 'Ej fastställt'}</small></div>`;
}

function renderFilters() {
  const clubs = [...new Set(editionResults(state.year).filter((result) => result.club).map((result) => result.club))].sort((a, b) => a.localeCompare(b, 'sv'));
  $('#club').innerHTML = '<option value="">Alla klubbar</option>' + clubs.map((club) => `<option value="${esc(club)}">${esc(club)}</option>`).join('');
  $('#club').value = state.club;
  const genders = [...new Set(editionResults(state.year).filter((result) => result.gender).map((result) => result.gender))].sort((a, b) => a.localeCompare(b, 'sv'));
  $('#gender').innerHTML = '<option value="">Alla kön</option>' + genders.map((gender) => `<option value="${esc(gender)}">${esc(gender)}</option>`).join('');
  $('#gender').value = state.gender;
}

function renderRows() {
  const visibleRows = rows();
  const totalPages = Math.max(1, Math.ceil(visibleRows.length / state.pageSize));
  state.page = Math.min(state.page, totalPages);
  const pageRows = visibleRows.slice((state.page - 1) * state.pageSize, state.page * state.pageSize);
  $('#result-count').textContent = `${visibleRows.length} träffar i ${esc(edition()?.edition_label || 'vald upplaga')}`;
  $('#rows').innerHTML = pageRows.length ? pageRows.map((result) => `<tr><td data-label="Namn"><strong>${esc(result.name) || '—'}</strong></td><td data-label="Kön">${esc(result.gender) || '—'}</td><td data-label="Klubb">${esc(result.club) || '—'}</td><td data-label="Status" class="status-${esc(result.status.toLowerCase())}">${esc(result.status)}</td><td data-label="Sluttid">${time(result.finish_seconds)}</td><td data-label="Val" class="result-actions"><button type="button" data-id="${esc(result.result_id)}" aria-label="Öppna resultat för ${esc(result.name)}">Öppna</button><button type="button" data-compare="${esc(result.result_id)}" aria-label="Jämför ${esc(result.name)}">${state.compare.includes(result.result_id) ? 'Ta bort' : 'Jämför'}</button><button type="button" data-duel="${esc(result.result_id)}" aria-label="Välj ${esc(result.name)} för Kartduell">${state.duel.includes(result.result_id) ? 'Ta bort duell' : 'Kartduell'}</button><button type="button" data-favorite="${esc(result.result_id)}" aria-label="${state.favorites.has(result.result_id) ? 'Ta bort favorit för' : 'Favoritmarkera'} ${esc(result.name)}">${state.favorites.has(result.result_id) ? '★ Favorit' : '☆ Favorit'}</button><button type="button" data-share="${esc(result.result_id)}" aria-label="Kopiera länk till ${esc(result.name)}">Dela</button></td></tr>`).join('') : '<tr><td colspan="6" class="empty-cell">Ingen verifierad resultatpost matchar urvalet.</td></tr>';
  $('#result-pagination').innerHTML = totalPages > 1
    ? `<button type="button" data-page="${state.page - 1}" ${state.page === 1 ? 'disabled' : ''}>Föregående</button><span>Sida ${state.page} av ${totalPages}</span><button type="button" data-page="${state.page + 1}" ${state.page === totalPages ? 'disabled' : ''}>Nästa</button>`
    : `<span>${visibleRows.length ? `Sida 1 av 1 · ${visibleRows.length} resultat` : 'Ingen resultatsida'}</span>`;
  document.querySelectorAll('[data-id]').forEach((button) => { button.onclick = () => { state.selected = state.data.results.find((result) => result.result_id === button.dataset.id); state.planTarget = null; renderRunner(); renderPlan(); }; });
  document.querySelectorAll('[data-compare]').forEach((button) => { button.onclick = () => { const id = button.dataset.compare; state.compare = state.compare.includes(id) ? state.compare.filter((item) => item !== id) : state.compare.length < 2 ? [...state.compare, id] : state.compare; renderRows(); renderComparison(); }; });
  document.querySelectorAll('[data-duel]').forEach((button) => { button.onclick = () => { const id = button.dataset.duel; state.duel = state.duel.includes(id) ? state.duel.filter((item) => item !== id) : state.duel.length < 5 ? [...state.duel, id] : state.duel; renderRows(); renderMapDuel(); }; });
  document.querySelectorAll('[data-favorite]').forEach((button) => { button.onclick = () => { const id = button.dataset.favorite; if (state.favorites.has(id)) state.favorites.delete(id); else state.favorites.add(id); try { localStorage.setItem('gax100-favorites', JSON.stringify([...state.favorites])); } catch (error) { /* privat webbläsarlagring är valfri */ } renderRows(); }; });
  document.querySelectorAll('[data-share]').forEach((button) => { button.onclick = async () => { const url = new URL(window.location.href); url.search = ''; url.searchParams.set('edition', state.year); url.searchParams.set('result', button.dataset.share); try { await navigator.clipboard.writeText(url.toString()); button.textContent = 'Kopierad'; } catch (error) { window.history.replaceState({}, '', url); button.textContent = 'Länk klar'; } }; });
  document.querySelectorAll('[data-page]').forEach((button) => { button.onclick = () => { state.page = Number(button.dataset.page); renderRows(); }; });
}

function buildSegments(result) {
  let previous = null;
  const segments = [];
  for (const observation of (result?.observations || [])) {
    const elapsed = Number(observation.elapsed_seconds);
    const distanceKm = Number(observation.distance_km);
    if (!Number.isFinite(elapsed) || !Number.isFinite(distanceKm) || elapsed < 0 || distanceKm <= 0) { previous = null; continue; }
    if (previous && (elapsed < previous.elapsed || distanceKm <= previous.distanceKm)) { previous = null; continue; }
    if (previous) segments.push({ checkpointId: observation.checkpoint_id, name: observation.name, distanceKm: distanceKm - previous.distanceKm, checkpointKm: distanceKm, seconds: elapsed - previous.elapsed });
    previous = { elapsed, distanceKm };
  }
  return segments.filter((segment) => segment.seconds >= 0 && segment.distanceKm > 0);
}

function speedChart(segments, result, selectedIndex = null) {
  if (!segments.length) return '<p class="muted">Ingen verifierad hastighetsserie: det krävs kronologiska mellantider med källavstånd.</p>';
  const totalSeconds = Number.isFinite(result.finish_seconds) ? result.finish_seconds : segments.reduce((sum, segment) => sum + segment.seconds, 0);
  const totalDistance = segments.reduce((sum, segment) => sum + segment.distanceKm, 0);
  if (!(totalSeconds > 0) || !(totalDistance > 0)) return '<p class="muted">Ingen verifierad referens för relativ fart.</p>';
  const baseline = totalDistance / (totalSeconds / 3600);
  const ratios = segments.map((segment) => (segment.distanceKm / (segment.seconds / 3600)) / baseline * 100);
  const maxRatio = Math.max(120, ...ratios, 100) * 1.05;
  const bars = ratios.map((ratio, index) => {
    const height = Math.max(1, Math.min(140, ratio / maxRatio * 140));
    const x = 48 + index * (820 / Math.max(segments.length, 1));
    return `<rect class="speed-bar${selectedIndex === index ? ' selected' : ''}" x="${x.toFixed(1)}" y="${(165 - height).toFixed(1)}" width="${Math.max(3, 760 / Math.max(segments.length, 1) - 4).toFixed(1)}" height="${height.toFixed(1)}"><title>${esc(segments[index].name)}: ${Math.round(ratio)}% av referensfart</title></rect>`;
  }).join('');
  const referenceY = 165 - 140 * 100 / maxRatio;
  return `<p class="muted">Relativ segmentfart mot valt loppresultats verifierade referensfart. Streckad linje = 100 %. Saknade segment visas inte.</p><svg class="speed-chart" viewBox="0 0 920 180" role="img" aria-label="Relativ segmentfart"><line class="speed-axis" x1="40" y1="165" x2="900" y2="165"/><line class="speed-reference" x1="40" y1="${referenceY.toFixed(1)}" x2="900" y2="${referenceY.toFixed(1)}"/><text class="speed-label" x="4" y="${(referenceY + 4).toFixed(1)}">100 %</text>${bars}<text class="speed-label" x="800" y="178">kontrollpunkter →</text></svg>`;
}

function renderRunner() {
  const result = state.selected;
  if (!result) { $('#runner').className = 'runner empty'; $('#runner').textContent = 'Välj en rad i resultatdatabasen för individuell visning.'; return; }
  const segments = buildSegments(result);
  const rows = (result.observations || []).map((observation) => {
    const segmentIndex = segments.findIndex((item) => item.name === observation.name && item.checkpointKm === observation.distance_km);
    const segment = segmentIndex >= 0 ? segments[segmentIndex] : null;
    return `<tr class="${state.segmentIndex === segmentIndex ? 'selected-segment' : ''}"><td>${esc(observation.name)}</td><td>${esc(observation.distance_km ?? 'källavstånd saknas')}</td><td>${esc(observation.raw_time)}</td><td>${time(segment?.seconds)}${segment ? ` <button type="button" class="segment-select" data-segment-index="${segmentIndex}">${state.segmentIndex === segmentIndex ? 'Vald' : 'Visa'}</button>` : ''}</td></tr>`;
  }).join('');
  $('#runner').className = 'runner';
  const selected = Number.isInteger(state.segmentIndex) && segments[state.segmentIndex] ? `<p class="segment-callout">Vald delsträcka: <strong>${esc(segments[state.segmentIndex].name)}</strong> · ${time(segments[state.segmentIndex].seconds)} över ${segments[state.segmentIndex].distanceKm.toFixed(1)} km.</p>` : '';
  $('#runner').innerHTML = `<h3>${esc(result.name)}</h3><p>${esc(result.status)} · sluttid ${time(result.finish_seconds)} · ${esc(result.club || 'klubb saknas')}</p><h4>Verkliga mellantider och delsträckor</h4>${rows ? `<table class="segment-table"><tr><th>Kontrollpunkt</th><th>km</th><th>Källtid</th><th>Delsträcka</th></tr>${rows}</table>` : '<p>Inga importerade mellantidsobservationer för detta resultat.</p>'}${selected}<h4>Relativ segmentfart</h4>${speedChart(segments, result, state.segmentIndex)}<p class="muted">Segmentet är endast källans närmast föregående verifierade observation. Saknade eller bakåtriktade observationer bryter serien; ingen tid interpoleras. GPS-position och replay kräver årsverifierad, publicerbar GPX-geometri och tidsankare.</p>`;
  document.querySelectorAll('[data-segment-index]').forEach((button) => { button.onclick = () => { state.segmentIndex = Number(button.dataset.segmentIndex); renderRunner(); }; });
}

function historicalPlan(result) {
  const candidates = editionResults(result?.edition_id).filter((item) => item.status === 'FINISHED' && Number.isFinite(item.finish_seconds) && buildSegments(item).length >= 2);
  const selectedSegments = buildSegments(result);
  if (candidates.length < 5 || selectedSegments.length < 2) return null;
  const byKey = new Map();
  candidates.forEach((candidate) => {
    const total = candidate.finish_seconds;
    buildSegments(candidate).forEach((segment) => {
      const key = `${segment.checkpointId || segment.name}@${segment.checkpointKm}`;
      if (!byKey.has(key)) byKey.set(key, []);
      byKey.get(key).push({ seconds: segment.seconds, fraction: segment.seconds / total });
    });
  });
  const segments = selectedSegments.map((segment) => {
    const key = `${segment.checkpointId || segment.name}@${segment.checkpointKm}`;
    const observations = byKey.get(key) || [];
    return { ...segment, key, cohort: observations.length, fraction: observations.length >= 5 ? median(observations.map((item) => item.fraction)) : null };
  });
  if (segments.some((segment) => !Number.isFinite(segment.fraction))) return null;
  const cohortTimes = candidates.map((candidate) => candidate.finish_seconds).filter(Number.isFinite);
  return { candidates, segments, target: median(cohortTimes) };
}

function allocateLargestRemainder(total, fractions) {
  const raw = fractions.map((fraction) => total * fraction);
  const values = raw.map(Math.floor);
  let remaining = total - values.reduce((sum, value) => sum + value, 0);
  raw.map((value, index) => ({ index, remainder: value - Math.floor(value) })).sort((a, b) => b.remainder - a.remainder).forEach(({ index }) => { if (remaining > 0) { values[index] += 1; remaining -= 1; } });
  return values;
}

function renderPlan() {
  const result = state.selected;
  const personal = buildSegments(result);
  const plan = historicalPlan(result);
  if (!plan) { $('#plan').className = 'runner empty'; $('#plan').textContent = 'Personlig loppplan är gated: samma upplaga behöver minst fem FINISHED-resultat med en gemensam verifierad segmentserie. Den valda löparens historiska referens kan fortfarande visas i individuell analys.'; return; }
  const target = Number.isFinite(state.planTarget) ? state.planTarget : plan.target;
  const simulatedSeconds = allocateLargestRemainder(Math.round(target), plan.segments.map((segment) => segment.fraction));
  const rows = plan.segments.map((segment, index) => `<tr><td>${esc(segment.name)}</td><td>${segment.checkpointKm.toFixed(1)}</td><td>${Math.round(segment.fraction * 100)} % · n=${segment.cohort}</td><td>${time(simulatedSeconds[index])}</td></tr>`).join('');
  $('#plan').className = 'runner';
  $('#plan').innerHTML = `<h3>Historisk referensprofil och måltidssimulering</h3><p>Den valda löparens faktiska mellantider används som referens i individuell analys. Den här separata planen använder ${plan.candidates.length} verifierade FINISHED-resultat från samma upplaga, medianiserade segmentproportioner och största restmetoden så att delsträckorna summerar exakt till måltiden. Den är en matematisk scenariofördelning, inte en prognos.</p><div class="plan-controls"><label for="plan-target">Valbar simulerad måltid (TT:MM:SS)<input id="plan-target" type="text" inputmode="numeric" placeholder="t.ex. 24:00:00" value="${target ? esc(time(target)) : ''}"></label><button type="button" id="apply-plan-target">Simulera</button><span id="plan-target-message" class="muted">Standardvärde: medianen av kohortens sluttider (${time(plan.target)}).</span></div><table class="segment-table"><tr><th>Kontrollpunkt</th><th>km</th><th>Kohortandel</th><th>Simulerad delsträcka</th></tr>${rows}</table><p class="muted">Personlig historisk referens: ${personal.length} verifierade delsträckor från ${esc(result.name)}. Planunderlag: ${plan.candidates.length} FINISHED.</p>`;
  $('#apply-plan-target').onclick = () => { const value = $('#plan-target').value.trim(); const match = value.match(/^(\d+):([0-5]\d):([0-5]\d)$/); if (!match) { $('#plan-target-message').textContent = 'Ange TT:MM:SS.'; return; } state.planTarget = Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]); renderPlan(); };
}

function renderComparison() {
  const selected = state.compare.map((id) => state.data.results.find((result) => result.result_id === id)).filter(Boolean);
  if (selected.length !== 2) { $('#comparison').className = 'runner empty'; $('#comparison').textContent = `${selected.length}/2 resultat valda.`; return; }
  const maps = selected.map((result) => new Map((result.observations || []).map((observation) => [observation.checkpoint_id, observation])));
  const common = [...maps[0].keys()].filter((key) => maps[1].has(key) && Number.isFinite(maps[0].get(key).elapsed_seconds) && Number.isFinite(maps[1].get(key).elapsed_seconds) && (maps[0].get(key).distance_km == null || maps[1].get(key).distance_km == null || maps[0].get(key).distance_km === maps[1].get(key).distance_km));
  const lines = common.map((key) => {
    const first = maps[0].get(key); const second = maps[1].get(key); const gap = first.elapsed_seconds - second.elapsed_seconds;
    return `<tr><td>${esc(first.name)}</td><td>${time(first.elapsed_seconds)}</td><td>${time(second.elapsed_seconds)}</td><td>${gap >= 0 ? '+' : '-'}${time(Math.abs(gap))}</td></tr>`;
  }).join('');
  $('#comparison').className = 'runner';
  const crossEditionNote = selected[0].edition_id !== selected[1].edition_id ? '<p class="muted">Olika upplagor: endast exakt gemensamma kontrollpunkter med likvärdigt källavstånd visas. Sluttider över år jämförs inte som prestationsmått.</p>' : '';
  $('#comparison').innerHTML = `<h3>${esc(selected[0].name)} vs ${esc(selected[1].name)}</h3>${crossEditionNote}${lines ? `<table class="segment-table"><tr><th>Kontrollpunkt</th><th>${esc(selected[0].name)}</th><th>${esc(selected[1].name)}</th><th>Gap</th></tr>${lines}</table>` : '<p>Ingen gemensam verifierad mellantid med likvärdigt källavstånd.</p>'}`;
}

function renderMapDuel() {
  const selected = state.duel.map((id) => state.data.results.find((result) => result.result_id === id)).filter(Boolean);
  if (selected.length < 2) { $('#map-duel-panel').className = 'runner empty'; $('#map-duel-panel').textContent = `${selected.length}/2–5 resultat valda. Välj minst två.`; return; }
  $('#map-duel-panel').className = 'runner';
  $('#map-duel-panel').innerHTML = `<h3>Förberedda kartduellresultat (${selected.length}/5)</h3><ol>${selected.map((result) => `<li>${esc(result.name)} · ${esc(result.status)} · ${time(result.finish_seconds)}</li>`).join('')}</ol><p>Kartduell/replay är fortfarande gated: lokala kandidatspår finns, men autentisk årsanknytning, publiceringsrätt, checkpoint-geometri och verifierad tidskoppling saknas.</p>`;
}

function chart() {
  const finished = editionResults(state.year).filter((result) => result.status === 'FINISHED' && Number.isFinite(result.finish_seconds));
  if (!finished.length) { $('#histogram').textContent = 'Ingen verifierad sluttidsdata.'; $('#scatter').textContent = 'Ingen verifierad placeringsdata.'; $('#stats-note').textContent = 'Diagrammen visas inte när vald upplaga saknar verifierad sluttidsdata.'; return; }
  const width = 420; const height = 160; const min = Math.min(...finished.map((result) => result.finish_seconds)); const max = Math.max(...finished.map((result) => result.finish_seconds)); const bins = Math.max(8, Math.min(35, Math.ceil((max - min) / 900) || 1)); const step = Math.max(1, (max - min) / bins); const counts = Array(bins).fill(0);
  finished.forEach((result) => { counts[Math.min(bins - 1, Math.floor((result.finish_seconds - min) / step))] += 1; });
  const barWidth = 350 / bins; const maxCount = Math.max(...counts);
  const histogramTicks = [0, .25, .5, .75, 1].map((fraction) => `<line class="gridline" x1="32" y1="${140 - fraction * 105}" x2="400" y2="${140 - fraction * 105}"/><text x="2" y="${144 - fraction * 105}">${Math.round(maxCount * fraction)}</text>`).join('');
  const percentileMarkers = [.1, .5, .9].map((probability) => { const value = percentile(finished.map((result) => result.finish_seconds), probability); const x = 38 + ((value - min) / Math.max(max - min, 1)) * 350; return `<line class="percentile-marker" x1="${x.toFixed(1)}" y1="18" x2="${x.toFixed(1)}" y2="140"/><text x="${Math.min(380, Math.max(34, x - 8)).toFixed(1)}" y="14">P${probability * 100}</text>`; }).join('');
  $('#histogram').innerHTML = `<svg viewBox="0 0 ${width} ${height}" aria-label="Sluttid i ${bins} intervall"><line class="axis" x1="32" y1="140" x2="400" y2="140"/>${histogramTicks}${percentileMarkers}${counts.map((count, index) => `<rect class="bar" x="${38 + index * barWidth}" y="${140 - count / maxCount * 105}" width="${Math.max(2, barWidth - 5)}" height="${count / maxCount * 105}"/><text x="${38 + index * barWidth}" y="155">${time(min + index * step).slice(0, 8)}</text>`).join('')}<text x="4" y="20">antal</text><text x="142" y="158">sluttid (TT:MM) →</text></svg>`;
  const points = finished.filter((result) => /^\d+$/.test(String(result.rank || ''))).slice(0, 120);
  if (!points.length) { $('#scatter').textContent = 'Ingen verifierad placeringsdata i vald upplaga.'; $('#stats-note').textContent = `${finished.length} FINISHED-resultat med sluttid används; placeringsdiagrammet saknar verifierade placeringar.`; return; }
  const maxRank = Math.max(...points.map((result) => Number(result.rank)), 1); const maxTime = max;
  const scatterTicks = [0, .25, .5, .75, 1].map((fraction) => `<line class="gridline" x1="32" y1="${135 - fraction * 120}" x2="400" y2="${135 - fraction * 120}"/><text x="2" y="${139 - fraction * 120}">${time(maxTime * fraction).slice(0, 5)}</text>`).join('');
  $('#scatter').innerHTML = `<svg viewBox="0 0 420 160" aria-label="Tid mot placering"><line class="axis" x1="32" y1="140" x2="400" y2="140"/><line class="axis" x1="32" y1="10" x2="32" y2="140"/>${scatterTicks}${points.map((result) => `<circle class="dot" cx="${38 + Number(result.rank) / maxRank * 350}" cy="${135 - result.finish_seconds / maxTime * 120}" r="2.5"><title>${esc(result.name)}: placering ${esc(result.rank)}, ${time(result.finish_seconds)}</title></circle>`).join('')}<text x="160" y="155">placering →</text><text x="4" y="20">sluttid</text></svg>`;
  $('#stats-note').textContent = `${finished.length} FINISHED-resultat med sluttid används. Diagrammen är beskrivande och bygger inte på saknade observationer.`;
}

function renderPercentiles() {
  const values = editionResults(state.year).filter((result) => result.status === 'FINISHED' && Number.isFinite(result.finish_seconds)).map((result) => result.finish_seconds).sort((a, b) => a - b);
  if (!values.length) { $('#percentiles').textContent = 'Ingen verifierad sluttidsdata.'; return; }
  $('#percentiles').className = 'runner';
  $('#percentiles').innerHTML = `<table class="segment-table"><tr><th>P10</th><th>P25</th><th>P50 median</th><th>P75</th><th>P90</th><th>Underlag</th></tr><tr><td>${time(percentile(values, .1))}</td><td>${time(percentile(values, .25))}</td><td>${time(percentile(values, .5))}</td><td>${time(percentile(values, .75))}</td><td>${time(percentile(values, .9))}</td><td>${values.length} FINISHED med sluttid · linjär interpolation</td></tr></table>`;
}

function renderHistory() {
  const editions = state.data.editions.slice().sort((a, b) => b.year - a.year || b.edition_id.localeCompare(a.edition_id));
  $('#history').innerHTML = editions.map((item) => {
    const results = editionResults(item.edition_id); const finished = results.filter((result) => result.status === 'FINISHED'); const times = finished.map((result) => result.finish_seconds); const observations = results.reduce((sum, result) => sum + (result.observations || []).length, 0); const fastest = times.filter(Number.isFinite).sort((a, b) => a - b)[0];
    return `<tr><td>${esc(item.edition_label)}</td><td>${finished.length}</td><td>${results.filter((result) => result.status === 'DNF').length}</td><td>${time(median(times))}</td><td>${time(fastest)}</td><td>${observations}</td></tr>`;
  }).join('');
}

function renderQuality() {
  $('#quality-rows').innerHTML = state.data.editions.slice().sort((a, b) => b.year - a.year || b.edition_id.localeCompare(a.edition_id)).map((item) => {
    const results = editionResults(item.edition_id);
    const finished = results.filter((result) => result.status === 'FINISHED').length;
    const dnf = results.filter((result) => result.status === 'DNF').length;
    const dns = results.filter((result) => result.status === 'DNS').length;
    const gender = results.filter((result) => result.gender).length;
    const observations = results.reduce((sum, result) => sum + (result.observations || []).length, 0);
    const source = item.source_id === 'result-2025' ? 'officiell PDF · importerad' : item.source_id === 'result-index-2026' ? 'officiellt index · importerad' : 'officiell resultatsida · importerad';
    return `<tr><td>${esc(item.edition_label)}</td><td>${results.length}</td><td>${finished} / ${dnf} / ${dns}</td><td>${gender ? `${gender} poster` : 'saknas'}</td><td>${item.starters ?? 'ej fastställt'}</td><td>${observations || 'saknas'}</td><td class="${results.length ? 'quality-good' : 'quality-partial'}">${source}</td></tr>`;
  }).join('');
}

function renderExtended() {
  const all = editionResults(state.year); const finished = all.filter((result) => result.status === 'FINISHED' && Number.isFinite(result.finish_seconds)); const dnf = all.filter((result) => result.status === 'DNF'); const clubs = new Set(all.map((result) => result.club).filter(Boolean));
  const genderCounts = ['Kvinnor', 'Män'].map((label) => `${label}: ${finished.filter((result) => new RegExp(label === 'Kvinnor' ? 'Kvinnor|Damer' : 'Män|Herrar', 'i').test(result.gender || '')).length}`).join(' · ');
  $('#extended-analysis-content').innerHTML = `<div class="analysis-grid"><article class="analysis-card"><h3>Statusflöde</h3><p><strong>${finished.length}</strong> FINISHED · <strong>${dnf.length}</strong> DNF · <strong>${all.filter((result) => result.status === 'DNS').length}</strong> DNS · <strong>${all.filter((result) => result.status === 'UNKNOWN').length}</strong> UNKNOWN</p><small>Endast källstödda statuskoder räknas; UNKNOWN är inte omtolkad till DNF.</small></article><article class="analysis-card"><h3>Köns- och klubbunderlag</h3><p>${esc(genderCounts)} · ${clubs.size ? `${clubs.size} publicerade klubbvärden` : 'klubbunderlag saknas'}</p><small>Ålder, klass och fullständig klubbhistorik saknar ett gemensamt verifierat datakontrakt.</small></article><article class="analysis-card"><h3>Segmentanalys</h3><p>${finished.filter((result) => buildSegments(result).length >= 2).length} FINISHED har minst två kronologiska segment.</p><small>Segmentlab, placeringsvinster och starkaste avslut aktiveras först när källans kontrollpunkter är jämförbara.</small></article><article class="analysis-card"><h3>Ban- och replayförmåga</h3><p>Geometri: lokal forskningspreview · höjdprofil: lokal GPX-preview · replay: avstängd.</p><small>Årsanknytning, rättigheter, checkpoint-koordinater och tidsstämplad löpar-GPS saknas för publik replay.</small></article></div>`;
}

function setupHelpDialog() {
  const dialog = $('#help-dialog'); const title = $('#help-dialog-title'); const body = $('#help-dialog-body');
  if (!dialog) return;
  document.querySelectorAll('.help summary').forEach((summary) => summary.addEventListener('click', (event) => { event.preventDefault(); title.textContent = summary.getAttribute('aria-label') || 'Metodförklaring'; body.textContent = summary.parentElement.querySelector('p')?.textContent || 'Metodförklaring saknas.'; dialog.showModal(); }));
  $('#help-dialog-close').onclick = () => dialog.close();
}

function render() { renderFacts(); renderFilters(); renderRows(); renderRunner(); renderPlan(); renderComparison(); renderMapDuel(); chart(); renderPercentiles(); renderHistory(); renderQuality(); renderExtended(); }

setupHelpDialog();
try { state.favorites = new Set(JSON.parse(localStorage.getItem('gax100-favorites') || '[]')); } catch (error) { state.favorites = new Set(); }
fetch('data.json').then((response) => response.json()).then((data) => { state.data = data; const params = new URLSearchParams(window.location.search); state.year = data.editions.some((item) => item.edition_id === params.get('edition')) ? params.get('edition') : data.editions.slice().sort((a, b) => b.year - a.year || b.edition_id.localeCompare(a.edition_id))[0].edition_id; $('#year').innerHTML = data.editions.map((item) => `<option value="${esc(item.edition_id)}">${esc(item.edition_label)}</option>`).join(''); $('#year').value = state.year; const requested = data.results.find((result) => result.result_id === params.get('result')); if (requested) state.selected = requested; render(); });
$('#year').onchange = (event) => { state.year = event.target.value; state.page = 1; state.selected = null; state.club = ''; state.gender = ''; state.compare = []; state.duel = []; state.planTarget = null; state.segmentIndex = null; render(); };
$('#search').oninput = (event) => { state.query = event.target.value; state.page = 1; renderRows(); };
$('#club').onchange = (event) => { state.club = event.target.value; state.page = 1; renderRows(); };
$('#gender').onchange = (event) => { state.gender = event.target.value; state.page = 1; renderRows(); };
$('#sort').onchange = (event) => { state.sort = event.target.value; state.page = 1; renderRows(); };
$('#clear-comparison').onclick = () => { state.compare = []; renderRows(); renderComparison(); };
