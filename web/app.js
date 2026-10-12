const state = { data: null, year: null, query: '', club: '', gender: '', status: '', searchScope: 'year', sort: 'time', page: 1, pageSize: 10, selected: null, compare: [], duel: [], favorites: new Set(), planTarget: null, segmentIndex: null };
const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const time = (seconds) => GaxTime.formatClock(seconds);
const edition = () => state.data.editions.find((item) => item.edition_id === state.year);
const editionResults = (editionId) => state.data.results.filter((result) => result.edition_id === editionId);
const runnerYear = (result) => {
  const ed = state.data.editions.find((item) => item.edition_id === result.edition_id);
  return ed ? (ed.year === 2021 ? (result.edition_id.endsWith('-a') ? '2021 A' : '2021 B') : String(ed.year)) : '–';
};
const runnerChip = (result) => result.name + ' (' + runnerYear(result) + ')';
const median = (values) => GaxStatistics.median(values);
const percentile = (values, probability) => GaxStatistics.percentile(values, probability);
const mean = (values) => { const valid = values.filter(Number.isFinite); return valid.length ? Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length) : null; };

function rows() {
  const filtered = (state.searchScope === 'all' ? state.data.results : editionResults(state.year)).filter((result) => {
    const matchesQuery = !state.query || `${result.name} ${result.bib || result.start_number || ''} ${result.club || ''}`.toLowerCase().includes(state.query.toLowerCase());
    const matchesGender = !state.gender || result.gender === state.gender;
    return matchesQuery && (!state.club || result.club === state.club) && matchesGender && (!state.status || result.status === state.status);
  });
  return filtered.sort((left, right) => state.sort === 'name'
    ? left.name.localeCompare(right.name, 'sv')
    : state.sort === 'status'
      ? left.status.localeCompare(right.status)
      : (left.finish_seconds ?? 1e12) - (right.finish_seconds ?? 1e12));
}

function syncUrl(push = false) {
  if (!state.data || !state.year) return;
  const url = new URL(window.location.href);
  url.searchParams.set('edition', state.year);
  if (state.searchScope === 'all') url.searchParams.set('scope', 'all'); else url.searchParams.delete('scope');
  if (state.selected) url.searchParams.set('result', state.selected.result_id); else url.searchParams.delete('result');
  if (state.compare.length) url.searchParams.set('compare', state.compare.join(',')); else url.searchParams.delete('compare');
  if (state.duel.length) url.searchParams.set('duel', state.duel.join(',')); else url.searchParams.delete('duel');
  if (push) history.pushState(null, '', url); else history.replaceState(null, '', url);
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
  const clubs = [...new Set((state.searchScope === 'all' ? state.data.results : editionResults(state.year)).filter((result) => result.club).map((result) => result.club))].sort((a, b) => a.localeCompare(b, 'sv'));
  $('#club').innerHTML = '<option value="">Alla klubbar</option>' + clubs.map((club) => `<option value="${esc(club)}">${esc(club)}</option>`).join('');
  $('#club').value = state.club;
  const genders = [...new Set((state.searchScope === 'all' ? state.data.results : editionResults(state.year)).filter((result) => result.gender).map((result) => result.gender))].sort((a, b) => a.localeCompare(b, 'sv'));
  $('#gender').innerHTML = '<option value="">Alla kön</option>' + genders.map((gender) => `<option value="${esc(gender)}">${esc(gender)}</option>`).join('');
  $('#gender').value = state.gender;
  $('#search-scope').value = state.searchScope;
  $('#status-filter').value = state.status;
}

function renderRows() {
  const visibleRows = rows();
  const totalPages = Math.max(1, Math.ceil(visibleRows.length / state.pageSize));
  state.page = Math.min(state.page, totalPages);
  const pageRows = visibleRows.slice((state.page - 1) * state.pageSize, state.page * state.pageSize);
  $('#result-count').textContent = `${visibleRows.length} träffar i ${state.searchScope === 'all' ? 'alla år' : esc(edition()?.edition_label || 'vald upplaga')}`;
  $('#rows').innerHTML = pageRows.length ? pageRows.map((result) => `<tr><td data-label="Namn"><strong>${esc(result.name) || '—'}</strong></td><td data-label="År">${esc(runnerYear(result))}</td><td data-label="Kön">${esc(result.gender) || '—'}</td><td data-label="Klubb">${esc(result.club) || '—'}</td><td data-label="Status" class="status-${esc(result.status.toLowerCase())}">${esc(result.status)}</td><td data-label="Sluttid">${time(result.finish_seconds)}</td><td data-label="Val" class="result-actions"><button type="button" data-id="${esc(result.result_id)}" aria-label="Öppna resultat för ${esc(result.name)}">Öppna</button><button type="button" data-compare="${esc(result.result_id)}" aria-label="Jämför ${esc(result.name)}">${state.compare.includes(result.result_id) ? 'Ta bort' : 'Jämför'}</button><button type="button" data-duel="${esc(result.result_id)}" aria-label="Välj ${esc(result.name)} för Kartduell">${state.duel.includes(result.result_id) ? 'Ta bort duell' : 'Kartduell'}</button><button type="button" data-favorite="${esc(result.result_id)}" aria-label="${state.favorites.has(result.result_id) ? 'Ta bort favorit för' : 'Favoritmarkera'} ${esc(result.name)}">${state.favorites.has(result.result_id) ? '★ Favorit' : '☆ Favorit'}</button><button type="button" data-share="${esc(result.result_id)}" aria-label="Kopiera länk till ${esc(result.name)}">Dela</button></td></tr>`).join('') : '<tr><td colspan="7" class="empty-cell">Ingen verifierad resultatpost matchar urvalet.</td></tr>';
  $('#result-pagination').innerHTML = totalPages > 1
    ? `<button type="button" data-page="${state.page - 1}" ${state.page === 1 ? 'disabled' : ''}>Föregående</button><span>Sida ${state.page} av ${totalPages}</span><button type="button" data-page="${state.page + 1}" ${state.page === totalPages ? 'disabled' : ''}>Nästa</button>`
    : `<span>${visibleRows.length ? `Sida 1 av 1 · ${visibleRows.length} resultat` : 'Ingen resultatsida'}</span>`;
  // Search results are actionable directly below the finder, while the full database stays near the footer.
  const preview = $('#finder-preview');
  preview.innerHTML = state.query.trim() ? '<div class="table-wrap finder-table-wrap"><table class="result-table"><thead><tr><th>Namn</th><th>År</th><th>Kön</th><th>Klubb</th><th>Status</th><th>Sluttid</th><th>Val</th></tr></thead><tbody>' + $('#rows').innerHTML + '</tbody></table></div>' :
    '<p class="muted">Skriv ett namn, startnummer eller en klubb för att visa och välja löpare här.</p>';
  const comparisonChips = state.compare.map((id) => state.data.results.find((result) => result.result_id === id)).filter(Boolean);
  const duelChips = state.duel.map((id) => state.data.results.find((result) => result.result_id === id)).filter(Boolean);
  const chips = (values, type) => values.map((result) => '<button type="button" data-remove-' + type + '="' + esc(result.result_id) + '">' + esc(runnerChip(result)) + ' ×</button>').join('');
  $('#selection-bar').innerHTML = '<div class="selection-line"><strong>Direktjämförelse (' + comparisonChips.length + '/2)</strong><div class="selection-chips">' + (chips(comparisonChips, 'compare') || '<span>Välj två löpare</span>') + '</div></div>' +
    '<div class="selection-line"><strong>Kartduell (' + duelChips.length + '/5)</strong><div class="selection-chips">' + (chips(duelChips, 'duel') || '<span>Välj upp till fem</span>') + '</div></div>';
  document.querySelectorAll('[data-remove-compare]').forEach((button) => { button.onclick = () => {
    state.compare = state.compare.filter((id) => id !== button.dataset.removeCompare);
    renderRows(); renderComparison(); syncUrl(true);
  }; });
  document.querySelectorAll('[data-remove-duel]').forEach((button) => { button.onclick = () => {
    state.duel = state.duel.filter((id) => id !== button.dataset.removeDuel);
    renderRows(); renderMapDuel(); syncUrl(true);
  }; });
  document.querySelectorAll('[data-id]').forEach((button) => { button.onclick = () => {
    state.selected = state.data.results.find((result) => result.result_id === button.dataset.id);
    if (!state.selected) return;
    state.planTarget = null; state.segmentIndex = null;
    if (state.year !== state.selected.edition_id) {
      state.year = state.selected.edition_id;
      $('#year').value = state.year;
      render();
    } else { renderRunner(); renderPlan(); }
    syncUrl(true);
    $('#runner').focus({preventScroll:true});
    $('#runner-analysis').scrollIntoView({block:'start'});
  }; });
  document.querySelectorAll('[data-compare]').forEach((button) => { button.onclick = () => { const id = button.dataset.compare; state.compare = state.compare.includes(id) ? state.compare.filter((item) => item !== id) : state.compare.length < 2 ? [...state.compare, id] : state.compare; renderRows(); renderComparison(); syncUrl(true); }; });
  document.querySelectorAll('[data-duel]').forEach((button) => { button.onclick = () => { const id = button.dataset.duel; state.duel = state.duel.includes(id) ? state.duel.filter((item) => item !== id) : state.duel.length < 5 ? [...state.duel, id] : state.duel; renderRows(); renderMapDuel(); syncUrl(true); }; });
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

function renderPlan() {
  const result = state.selected;
  const plan = result ? GaxPlan.historicalPlan(result, editionResults(result.edition_id)) : null;
  if (!plan) {
    $('#plan').className = 'runner empty';
    $('#plan').textContent = 'Ingen historiskt vägd loppplan för detta resultat: minst fem fullföljare i samma upplaga måste ha samma kompletta, kronologiska checkpointserie från Start till Mål. Utan passager visas ingen påhittad delsträckeplan.';
    return;
  }
  const target = Number.isSafeInteger(state.planTarget) ? state.planTarget : Math.round(plan.target);
  let simulatedSeconds;
  try {
    simulatedSeconds = GaxPlan.allocateLargestRemainder(target, plan.segments.map((segment) => segment.fraction));
  } catch (error) {
    state.planTarget = null;
    simulatedSeconds = GaxPlan.allocateLargestRemainder(Math.round(plan.target), plan.segments.map((segment) => segment.fraction));
  }
  let cumulative = 0;
  const rows = plan.segments.map((segment, index) => {
    cumulative += simulatedSeconds[index];
    const distance = Number.isFinite(segment.distanceKm) ? segment.distanceKm.toLocaleString('sv-SE', { maximumFractionDigits: 1 }) + ' km' : 'Ej verifierad';
    return `<tr><td>${esc(segment.from)}</td><td>${esc(segment.to)}</td><td>${distance}</td><td>${(segment.fraction * 100).toLocaleString('sv-SE', { maximumFractionDigits: 1 })} %</td><td>${time(simulatedSeconds[index])}</td><td>${time(cumulative)}</td><td>n=${segment.cohort}</td></tr>`;
  }).join('');
  $('#plan').className = 'runner';
  $('#plan').innerHTML = `<h3>Simulera ditt lopp baserat på faktiska tidigare tider per delsträcka</h3><p>Historiskt vägd fördelning från ${plan.candidates} fullföljare med kompletta, gemensamma passager i ${esc(edition()?.edition_label || 'vald upplaga')}. Start→första kontrollen och sista kontrollen→Mål ingår; inga tider eller positioner hittas på. Medianiserade andelar normaliseras till 100 % före sekundavrundning. Detta är en matematisk simulering, inte en prognos.</p><div class="plan-controls"><label for="plan-target">Måltid (H:MM:SS)<input id="plan-target" type="text" inputmode="numeric" placeholder="t.ex. 24:00:00" value="${time(simulatedSeconds.reduce((a, b) => a + b, 0))}"></label><button type="button" id="apply-plan-target">Bygg loppplan</button><button type="button" data-plan-adjust="-900">−15 min</button><button type="button" data-plan-adjust="-300">−5 min</button><button type="button" data-plan-adjust="300">+5 min</button><button type="button" data-plan-adjust="900">+15 min</button><button type="button" id="reset-plan-target">Återställ mediantid</button><span id="plan-target-message" class="muted" role="status">Standard: upplagans mediantid ${time(plan.target)}.</span></div><div class="table-wrap"><table class="segment-table"><thead><tr><th>Från</th><th>Till</th><th>Distans</th><th>Andel av loppet</th><th>Beräknad segmenttid</th><th>Ackumulerad passagetid</th><th>Underlag</th></tr></thead><tbody>${rows}</tbody></table></div><p class="muted">Sista passagetiden är exakt måltiden. Distans och pace visas endast när motsvarande geografiska underlag är verifierat. En annan vald löpares enskilda tider används inte som sammanblandat referensfält.</p>`;
  $('#apply-plan-target').onclick = () => {
    const value = $('#plan-target').value.trim();
    const match = value.match(/^(\d+):([0-5]\d):([0-5]\d)$/);
    if (!match) { $('#plan-target-message').textContent = 'Ange måltiden som H:MM:SS.'; return; }
    const seconds = Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
    if (!Number.isSafeInteger(seconds) || seconds < plan.segments.length ||
        !Number.isFinite(seconds)) {
      $('#plan-target-message').textContent = 'Ange en positiv och rimlig måltid.';
      return;
    }
    try {
      GaxPlan.allocateLargestRemainder(seconds, plan.segments.map((segment) => segment.fraction));
      state.planTarget = seconds;
      renderPlan();
    } catch (error) {
      $('#plan-target-message').textContent = 'Måltiden ger ogiltiga delsträckor. Ange en längre måltid.';
    }
  };
  document.querySelectorAll('[data-plan-adjust]').forEach((button) => { button.onclick = () => {
    const seconds = simulatedSeconds.reduce((a, b) => a + b, 0) + Number(button.dataset.planAdjust);
    if (seconds > plan.segments.length) { state.planTarget = seconds; renderPlan(); }
  }; });
  $('#reset-plan-target').onclick = () => { state.planTarget = null; renderPlan(); };
}

function comparisonTimeChart(model) {
  const stops = model.checkpoints;
  if (model.crossEdition || stops.length < 2) return '<p class="muted">En sammanhängande tvålinjegraf kräver minst två jämförbara, officiella mellantider i samma upplaga.</p>';
  const series = [{ name: model.a.name, key: 'a', color: '#2563eb' }, { name: model.b.name, key: 'b', color: '#c026d3' }];
  const maximum = Math.max(1, ...stops.map((stop) => Math.max(stop.a, stop.b)));
  const chartLeft = 82, chartRight = 850, chartBottom = 225, chartTop = 30;
  const x = (index) => chartLeft + index * (chartRight - chartLeft) / (stops.length - 1);
  const y = (value) => chartBottom - value / maximum * (chartBottom - chartTop);
  const grid = [0, .25, .5, .75, 1].map((fraction) => '<line class="gridline" x1="' + chartLeft + '" x2="' + chartRight + '" y1="' + y(maximum * fraction) + '" y2="' + y(maximum * fraction) + '"/>' +
    '<text x="4" y="' + (y(maximum * fraction) + 4) + '">' + time(maximum * fraction) + '</text>').join('');
  const marks = stops.map((stop, index) =>
    '<text class="compare-x-label" x="' + x(index) + '" y="247" text-anchor="middle">' +
    esc(stop.name.replace(/(\d+)\s*km.*$/i, '$1 km').slice(0, 18)) + '</text>').join('');
  const paths = series.map((seriesInfo) => {
    const coords = stops.map((stop, index) => x(index) + ',' + y(stop[seriesInfo.key])).join(' ');
    const dots = stops.map((stop, index) => '<circle cx="' + x(index) + '" cy="' + y(stop[seriesInfo.key]) +
      '" r="5" fill="' + seriesInfo.color + '"><title>' + esc(seriesInfo.name) + ' · ' + esc(stop.name) +
      ': ' + time(stop[seriesInfo.key]) + '</title></circle>').join('');
    return '<polyline fill="none" stroke="' + seriesInfo.color + '" stroke-width="3" points="' + coords + '"/>' + dots;
  }).join('');
  return '<figure class="compare-figure"><figcaption>Ackumulerad officiell tid vid gemensamma kontroller</figcaption>' +
    '<div class="comparison-legend"><span class="role-a">' + esc(runnerChip(model.a)) + '</span><span class="role-b">' + esc(runnerChip(model.b)) + '</span></div>' +
    '<svg viewBox="0 0 900 260" role="img" aria-label="Två officiella ackumulerade tidsserier, A blå och B magenta">' +
    grid + '<line class="axis" x1="' + chartLeft + '" x2="' + chartRight + '" y1="' + chartBottom + '" y2="' + chartBottom +
    '"/>' + paths + marks + '</svg><p class="muted">X: gemensamma kontrollpunkter i ordning. Y: tid från start. Kurvorna är inte GPS-positioner.</p></figure>';
}
function renderComparison() {
  const selected = state.compare.map((id) => state.data.results.find((result) => result.result_id === id)).filter(Boolean);
  if (selected.length !== 2) {
    $('#comparison').className = 'runner empty';
    $('#comparison').textContent = selected.length + '/2 resultat valda. Välj exakt två löpare via söklistan eller resultatdatabasen.';
    $('#swap-comparison').disabled = true;
    $('#share-comparison').disabled = true;
    return;
  }
  $('#swap-comparison').disabled = false;
  $('#share-comparison').disabled = false;
  const model = GaxComparison.compare(selected[0], selected[1]);
  if (!model) { $('#comparison').textContent = 'Samma resultat kan inte jämföras med sig självt.'; return; }
  const person = (runner, letter, role) => {
    const finish = runner.status === 'FINISHED' ? time(runner.finish_seconds) : esc(runner.status);
    const rank = runner.rank != null && String(runner.rank).trim() ? ' · officiell placering ' + esc(runner.rank) : '';
    return '<div class="compare-person ' + role + '"><h3>' + letter + ' · ' + esc(runnerChip(runner)) + '</h3><p>' +
      finish + rank + '</p><small>' + esc(runner.club || 'Klubb ej publicerad') + ' · ' +
      (runner.observations || []).length + ' verifierade passager</small></div>';
  };
  const delta = model.finishComparable ?
    '<p class="compare-summary">Måltidsgap: <strong>' +
    (model.finishGap === 0 ? 'Samma sluttid' : model.finishGap > 0 ? 'A före B med ' + time(model.finishGap) : 'B före A med ' + time(-model.finishGap)) +
    '</strong> · samma upplaga</p>' : '<p class="compare-summary">Sluttider visas som separata tävlingsresultat, inte ett jämförbart helbanelopp.</p>';
  const signedGap = (seconds) => seconds === 0 ? 'Samma tid' :
    seconds > 0 ? 'A före med ' + time(seconds) : 'B före med ' + time(-seconds);
  const table = model.checkpoints.length ?
    '<div class="table-wrap"><table class="segment-table"><thead><tr><th>Kontrollpunkt</th><th>' + esc(runnerChip(model.a)) +
    '</th><th>' + esc(runnerChip(model.b)) + '</th><th>Tidslucka</th></tr></thead><tbody>' +
    model.checkpoints.map((stop) => '<tr><td>' + esc(stop.name) + '</td><td>' + time(stop.a) + '</td><td>' +
    time(stop.b) + '</td><td>' + signedGap(stop.gap) + '</td></tr>').join('') + '</tbody></table></div>' :
    '<p class="muted">Gemensamma jämförbara mellantider saknas. Det går fortfarande att se de två resultaten ovan.</p>';
  $('#comparison').className = 'runner';
  $('#comparison').innerHTML =
    '<div class="compare-cards">' + person(model.a, 'A', 'role-a') + person(model.b, 'B', 'role-b') + '</div>' +
    delta + '<p class="evidence-note">' + esc(model.reason) + '</p>' +
    comparisonTimeChart(model) + table +
    '<p class="muted">Placeringsresa, höjdprofil och kartreplay kräver verifierade källdata och är därför inte konstruerade från kontrollpassagerna.</p>';
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
fetch('data.json').then((response) => response.json()).then((data) => { state.data = data; const params = new URLSearchParams(window.location.search); state.searchScope = params.get('scope') === 'all' ? 'all' : 'year'; state.year = data.editions.some((item) => item.edition_id === params.get('edition')) ? params.get('edition') : data.editions.slice().sort((a, b) => b.year - a.year || b.edition_id.localeCompare(a.edition_id))[0].edition_id; $('#year').innerHTML = data.editions.map((item) => `<option value="${esc(item.edition_id)}">${esc(item.edition_label)}</option>`).join(''); $('#year').value = state.year; const requested = data.results.find((result) => result.result_id === params.get('result')); if (requested) { state.selected = requested; state.year = requested.edition_id; $('#year').value = state.year; }
  const validIds = new Set(data.results.map((result) => result.result_id));
  state.compare = (params.get('compare') || '').split(',').filter((id) => validIds.has(id)).slice(0, 2);
  state.duel = (params.get('duel') || '').split(',').filter((id) => validIds.has(id)).slice(0, 5);
  render(); });
$('#year').onchange = (event) => { state.year = event.target.value; state.page = 1; state.selected = null; state.club = ''; state.gender = ''; if (state.searchScope !== 'all') { state.compare = []; state.duel = []; } state.planTarget = null; state.segmentIndex = null; render(); syncUrl(true); };
$('#search-scope').onchange = (event) => { state.searchScope = event.target.value; state.page = 1; state.club = ''; state.gender = ''; renderFilters(); renderRows(); syncUrl(true); };
$('#status-filter').onchange = (event) => { state.status = event.target.value; state.page = 1; renderRows(); };
$('#search').oninput = (event) => { state.query = event.target.value; state.page = 1; renderRows(); };
$('#club').onchange = (event) => { state.club = event.target.value; state.page = 1; renderRows(); };
$('#gender').onchange = (event) => { state.gender = event.target.value; state.page = 1; renderRows(); };
$('#sort').onchange = (event) => { state.sort = event.target.value; state.page = 1; renderRows(); };
$('#clear-comparison').onclick = () => { state.compare = []; renderRows(); renderComparison(); syncUrl(true); };
$('#swap-comparison').onclick = () => { if (state.compare.length === 2) { state.compare.reverse(); renderRows(); renderComparison(); syncUrl(true); } };
$('#share-comparison').onclick = async () => {
  if (state.compare.length !== 2) return;
  const url = new URL(window.location.href);
  url.searchParams.set('edition', state.year);
  url.searchParams.set('compare', state.compare.join(','));
  if (state.searchScope === 'all') url.searchParams.set('scope', 'all');
  try { await navigator.clipboard.writeText(url.toString()); $('#comparison-feedback').textContent = 'Jämförelselänken kopierad.'; }
  catch (error) { history.replaceState(null, '', url); $('#comparison-feedback').textContent = 'Kopiera jämförelselänken från adressfältet.'; }
};
