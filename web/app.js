const state = { data: null, year: null, query: '', club: '', clubQuery: '', gender: '', status: '', searchScope: 'year', sort: 'time', page: 1, pageSize: 10, selected: null, compare: [], duel: [], favorites: new Set(), planTarget: null, targetSeconds: null, fieldSegmentIndex: null, finishGroup: 'all', labFrom: null, labTo: null, labGroup: 'all', segmentIndex: null };
const $ = (selector) => document.querySelector(selector);
function labelMobileTable(table, columnLabels) {
  if (!table) return;
  table.classList.add('mobile-card-table');
  table.querySelectorAll('tbody tr').forEach((row) => {
    [...row.cells].forEach((cell, index) => { cell.dataset.label = columnLabels[index] || ''; if (cell.dataset.label) cell.setAttribute('aria-label', cell.dataset.label + ': ' + cell.textContent.trim()); });
  });
}

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
  const query = state.query.trim().toLocaleLowerCase('sv-SE');
  const filtered = (state.searchScope === 'all' ? state.data.results : editionResults(state.year)).filter((result) => {
    const matchesQuery = !query || `${result.name} ${result.bib || result.start_number || ''} ${result.club || ''}`.toLocaleLowerCase('sv-SE').includes(query);
    const matchesGender = !state.gender || result.gender === state.gender;
    return matchesQuery && (!state.club || result.club === state.club) && (!state.clubQuery || String(result.club || '').toLocaleLowerCase('sv-SE').includes(state.clubQuery.trim().toLocaleLowerCase('sv-SE'))) && matchesGender && (!state.status || result.status === state.status);
  });
  return filtered.sort((left, right) => {
    const compare = state.sort === 'name'
      ? left.name.localeCompare(right.name, 'sv')
      : state.sort === 'status'
        ? left.status.localeCompare(right.status, 'sv')
        : (left.finish_seconds ?? Number.MAX_SAFE_INTEGER) - (right.finish_seconds ?? Number.MAX_SAFE_INTEGER);
    return compare || left.result_id.localeCompare(right.result_id);
  });
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
  const groupCard = (label, values, color) => {
    const available = values.length >= 5;
    return '<span class="gender-group '+color+'"><span class="group-header">'+esc(label)+' <span>n='+values.length+'</span></span>'+
      (available ? '<span class="group-row"><span>Median</span><b>'+time(median(values))+'</b></span>'+
        '<span class="group-row"><span>Medel</span><b>'+time(mean(values))+'</b></span>' :
        '<span class="group-row"><span>Underlag saknas</span></span>')+'</span>';
  };
  const finishRate = starters ? ` · ${Math.round(finished.length / starters * 100)} % av fastställda startande` : '';
  $('#facts').innerHTML = `<div class="fact"><h3>STARTANDE</h3><strong>${starterLabel}</strong><small>${esc(starterNote)}</small></div><div class="fact"><h3>FULLFÖLJDE</h3><strong>${finished.length}</strong><small>${starters === null ? 'giltig officiell sluttid; startantal ej fastställt' : `giltig officiell sluttid av ${starters} startande${finishRate}`}</small></div><div class="fact"><h3>DNF</h3><strong>${dnf.length}</strong><small>${starters ? `${Math.round(dnf.length / starters * 100)} % av fastställda startande` : 'explicit källstödd status'}</small></div><div class="fact gender"><h3>TIDER KVINNOR / MÄN</h3><div class="gender-values">${groupCard('Kvinnor', women.map((result) => result.finish_seconds), 'f')}${groupCard('Män', men.map((result) => result.finish_seconds), 'm')}</div></div><div class="fact"><h3>SNABBASTE TID</h3><strong>${best ? time(best.finish_seconds) : '—'}</strong><small>${best ? esc(best.name) : 'Ej fastställt'}</small></div>`;
}

function renderFilters() {
  const clubs = [...new Set((state.searchScope === 'all' ? state.data.results : editionResults(state.year)).filter((result) => result.club).map((result) => result.club))].sort((a, b) => a.localeCompare(b, 'sv'));
  $('#club').innerHTML = '<option value="">Alla klubbar</option>' + clubs.map((club) => `<option value="${esc(club)}">${esc(club)}</option>`).join('');
  $('#club').value = state.club;
  $('#club-suggestions').innerHTML = clubs.map((club) => '<option value="' + esc(club) + '"></option>').join('');
  $('#club-autocomplete').value = state.clubQuery;
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
  $('#page-size').value = String(state.pageSize);
  const firstIndex = visibleRows.length ? (state.page - 1) * state.pageSize + 1 : 0;
  const lastIndex = Math.min(state.page * state.pageSize, visibleRows.length);
  $('#results-page-count').textContent = 'Visar ' + firstIndex + '–' + lastIndex + ' av ' + visibleRows.length + ' träffar.';
  $('#result-count').textContent = `${visibleRows.length} träffar i ${state.searchScope === 'all' ? 'alla år' : esc(edition()?.edition_label || 'vald upplaga')}`;
  $('#rows').innerHTML = pageRows.length ? pageRows.map((result) => `<tr><td data-label="Namn"><strong>${esc(result.name) || '—'}</strong></td><td data-label="År">${esc(runnerYear(result))}</td><td data-label="Kön">${esc(result.gender) || '—'}</td><td data-label="Klubb">${esc(result.club) || '—'}</td><td data-label="Status" class="status-${esc(result.status.toLowerCase())}">${esc(result.status)}</td><td data-label="Sluttid">${time(result.finish_seconds)}</td><td data-label="Val" class="result-actions"><button type="button" data-id="${esc(result.result_id)}" aria-label="Öppna resultat för ${esc(result.name)}">Öppna</button><button type="button" data-compare="${esc(result.result_id)}" aria-label="Jämför ${esc(result.name)}">${state.compare.includes(result.result_id) ? 'Ta bort' : 'Jämför'}</button><button type="button" data-duel="${esc(result.result_id)}" aria-label="Välj ${esc(result.name)} för Kartduell">${state.duel.includes(result.result_id) ? 'Ta bort duell' : 'Kartduell'}</button><button type="button" data-favorite="${esc(result.result_id)}" aria-label="${state.favorites.has(result.result_id) ? 'Ta bort favorit för' : 'Favoritmarkera'} ${esc(result.name)}">${state.favorites.has(result.result_id) ? '★ Favorit' : '☆ Favorit'}</button><button type="button" data-share="${esc(result.result_id)}" aria-label="Kopiera länk till ${esc(result.name)}">Dela</button></td></tr>`).join('') : '<tr><td colspan="7" class="empty-cell">Ingen verifierad resultatpost matchar urvalet.</td></tr>';
  $('#result-pagination').innerHTML = totalPages > 1
    ? `<button type="button" data-page="${state.page - 1}" ${state.page === 1 ? 'disabled' : ''}>Föregående</button><span>Sida ${state.page} av ${totalPages}</span><button type="button" data-page="${state.page + 1}" ${state.page === totalPages ? 'disabled' : ''}>Nästa</button>`
    : `<span>${visibleRows.length ? `Sida 1 av 1 · ${visibleRows.length} resultat` : 'Ingen resultatsida'}</span>`;
  // Search results are actionable directly below the finder, while the full database stays near the footer.
  const preview = $('#finder-preview');
  const previewRows = [...$('#rows').querySelectorAll('tr')].slice(0,7).map((row) => row.outerHTML).join('');
  preview.innerHTML = (state.query.trim() || state.clubQuery.trim()) ?
    '<p class="muted">Visar upp till sju träffar direkt här. Alla ' + visibleRows.length + ' resultat finns i databasen nedan.</p><div class="table-wrap finder-table-wrap"><table class="result-table"><thead><tr><th>Namn</th><th>År</th><th>Kön</th><th>Klubb</th><th>Status</th><th>Sluttid</th><th>Val</th></tr></thead><tbody>' + previewRows + '</tbody></table></div>' :
    '<p class="muted">Skriv ett namn, startnummer eller en klubb för att visa och välja löpare här.</p>';
  const comparisonChips = state.compare.map((id) => state.data.results.find((result) => result.result_id === id)).filter(Boolean);
  const duelChips = state.duel.map((id) => state.data.results.find((result) => result.result_id === id)).filter(Boolean);
  const chips = (values, type) => values.map((result) => '<button type="button" data-remove-' + type + '="' + esc(result.result_id) + '">' + esc(runnerChip(result)) + ' ×</button>').join('');
  $('#selection-bar').innerHTML = '<div class="selection-line"><strong>Direktjämförelse (' + comparisonChips.length + '/2)</strong><div class="selection-chips">' + (chips(comparisonChips, 'compare') || '<span>Välj två löpare</span>') + '</div></div>' +
    '<div class="selection-line"><strong>Kartduell (' + duelChips.length + '/5)</strong><div class="selection-chips">' + (chips(duelChips, 'duel') || '<span>Välj upp till fem</span>') + '</div></div>' +
    (state.favorites.size ? '<details class="saved"><summary>Sparade resultat (' + state.favorites.size + ')</summary><div class="selection-chips">' +
      [...state.favorites].map((id) => state.data.results.find((result) => result.result_id === id)).filter(Boolean).map((result) =>
        '<button type="button" data-id="' + esc(result.result_id) + '">' + esc(runnerChip(result)) + '</button>').join('') +
      '</div></details>' : '');
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
  document.querySelectorAll('[data-share]').forEach((button) => { button.onclick = async () => { const url = new URL(window.location.href); url.search = ''; const sharedResult = state.data.results.find((result) => result.result_id === button.dataset.share); url.searchParams.set('edition', sharedResult?.edition_id || state.year); url.searchParams.set('result', button.dataset.share); try { await navigator.clipboard.writeText(url.toString()); button.textContent = 'Kopierad'; } catch (error) { window.history.replaceState({}, '', url); button.textContent = 'Länk klar'; } }; });
  document.querySelectorAll('[data-page]').forEach((button) => { button.onclick = () => { state.page = Number(button.dataset.page); renderRows(); }; });
}

function buildSegments(result) {
  const observations = result?.observations || [];
  if (!observations.length) return [];
  const segments = [];
  let previousTime = 0;
  let previousDistance = 0;
  let previousName = 'Start';
  for (const observation of observations) {
    const elapsed = observation.elapsed_seconds;
    const distanceKm = observation.distance_km == null ? null : Number(observation.distance_km);
    if (!Number.isFinite(elapsed) || elapsed <= previousTime ||
        (result.status === 'FINISHED' && Number.isFinite(result.finish_seconds) && elapsed >= result.finish_seconds)) break;
    if (distanceKm !== null && (!Number.isFinite(distanceKm) || distanceKm <= 0 ||
        (previousDistance !== null && distanceKm <= previousDistance))) break;
    segments.push({ checkpointId: observation.checkpoint_id, from: previousName,
      name: observation.name, distanceKm: previousDistance !== null && distanceKm !== null ? distanceKm - previousDistance : null,
      checkpointKm: distanceKm, seconds: elapsed - previousTime, elapsedSeconds: elapsed });
    previousTime = elapsed;
    previousDistance = distanceKm;
    previousName = observation.name;
  }
  if (result.status === 'FINISHED' && Number.isFinite(result.finish_seconds) &&
      result.finish_seconds > previousTime && segments.length === observations.length) {
    segments.push({ checkpointId: 'FINISH', from: previousName, name: 'Mål', distanceKm: null,
      checkpointKm: null, seconds: result.finish_seconds - previousTime, elapsedSeconds: result.finish_seconds });
  }
  return segments;
}
function speedChart(segments, result, selectedIndex = null) {
  const eligible = segments.map((segment, index) => ({ segment, index }))
    .filter(({ segment }) => Number.isFinite(segment.distanceKm) && segment.distanceKm > 0 && segment.seconds > 0);
  if (!eligible.length) return '<p class="muted">Fysisk fart kan inte beräknas: verifierade kontrollavstånd saknas för denna upplaga. De verkliga tidsåtgångarna visas nedan.</p>';
  const totalSeconds = eligible.reduce((sum, item) => sum + item.segment.seconds, 0);
  const totalKm = eligible.reduce((sum, item) => sum + item.segment.distanceKm, 0);
  if (!(totalSeconds > 0) || !(totalKm > 0)) return '<p class="muted">Inget tillförlitligt fartunderlag.</p>';
  const baseline = totalKm / (totalSeconds / 3600);
  const ratios = eligible.map(({ segment }) => segment.distanceKm / (segment.seconds / 3600) / baseline * 100);
  const maxRatio = Math.max(120, ...ratios) * 1.1;
  const width = 900, left = 58, right = 860, bottom = 183, top = 20;
  const height = bottom - top;
  const bars = eligible.map(({ segment, index }, rank) => {
    const ratio = ratios[rank], barWidth = (right - left) / eligible.length;
    const h = ratio / maxRatio * height;
    const x = left + rank * barWidth + 6;
    return '<rect class="speed-bar' + (selectedIndex === index ? ' selected' : '') +
      '" data-segment-index="' + index + '" tabindex="0" role="button" aria-label="Välj delsträckan ' + esc(segment.name) +
      '" x="' + x + '" y="' + (bottom - h) + '" width="' + Math.max(4, barWidth - 12) +
      '" height="' + h + '"><title>' + esc(segment.name) + ': ' + Math.round(ratio) + ' %</title></rect>';
  }).join('');
  const refY = bottom - 100 / maxRatio * height;
  const axis = [0, .25, .5, .75, 1].map((v) => {
    const y = bottom - maxRatio * v / maxRatio * height;
    return '<text class="speed-label" x="2" y="' + (y + 4) + '">' + Math.round(maxRatio * v) + ' %</text>' +
      '<line class="gridline" x1="' + left + '" x2="' + right + '" y1="' + y + '" y2="' + y + '"/>';
  }).join('');
  return '<p class="muted">Fart per delsträcka relativt snittet för enbart de verifierade avståndsintervallen. Detta är inte hela loppets snittfart. Streckad linje = 100 %.</p>' +
    '<svg class="speed-chart" viewBox="0 0 900 215" role="group" aria-label="Relativ fart per verifierad delsträcka">' +
    axis + '<line class="speed-reference" x1="' + left + '" x2="' + right + '" y1="' + refY + '" y2="' + refY + '"/>' +
    bars + '<text class="speed-label" x="' + left + '" y="209">Start → kontroller i ordning</text></svg>';
}
function durationChart(segments, selectedIndex = null) {
  if (!segments.length) return '<p class="muted">Ingen tidsserie finns för denna löpare.</p>';
  const maximum = Math.max(...segments.map((segment) => segment.seconds), 1);
  const left = 75, right = 850, bottom = 185, top = 20;
  const step = (right - left) / segments.length;
  const grid = [0, .25, .5, .75, 1].map((v) => {
    const y = bottom - v * (bottom - top);
    return '<line class="gridline" x1="' + left + '" x2="' + right + '" y1="' + y + '" y2="' + y +
      '"/><text class="speed-label" x="2" y="' + (y + 5) + '">' + time(maximum * v) + '</text>';
  }).join('');
  const bars = segments.map((segment, index) => {
    const h = segment.seconds / maximum * (bottom - top);
    const x = left + index * step + 8;
    return '<rect data-segment-index="' + index + '" tabindex="0" role="button" aria-label="Välj delsträckan ' + esc(segment.name) +
      '" class="duration-bar' + (selectedIndex === index ? ' selected' : '') + '" x="' + x + '" y="' + (bottom - h) +
      '" width="' + Math.max(5, step - 16) + '" height="' + h + '"><title>' +
      esc(segment.from + ' – ' + segment.name) + ': ' + time(segment.seconds) + '</title></rect>';
  }).join('');
  return '<svg class="duration-chart" viewBox="0 0 900 225" role="group" aria-label="Tidsåtgång per verifierad delsträcka, från Start till sista observation">' +
    grid + bars + '<text class="speed-label" x="' + left + '" y="215">Start → kontrollpunkter → Mål (om officiell sluttid finns)</text></svg>';
}
function runnerMedianGapChart(result) {
  const model = GaxField.runnerGap(result, editionResults(result.edition_id));
  if (!model) return '<p class="muted">Tidslucka mot fältet visas inte: det saknas en komplett jämförbar kontrollserie med minst fem fullföljare i samma upplaga. Ingen passage eller placering har uppskattats.</p>';
  const rows = model.rows;
  const absoluteMaximum = Math.max(1,...rows.map((point) => Math.abs(point.gapSeconds)));
  const left=80, right=865, middle=132, scale=90/absoluteMaximum;
  const xp=(index)=>left+index*(right-left)/(rows.length-1);
  const yp=(seconds)=>middle+seconds*scale;
  const signed=(seconds)=>seconds===0 ? '0:00:00' : (seconds>0?'+':'−')+time(Math.abs(seconds));
  const path=rows.map((point,index)=>xp(index)+','+yp(point.gapSeconds)).join(' ');
  const points=rows.map((point,index) => {
    const selected=index>0 && state.segmentIndex===index-1;
    const button=index===0?'': ' data-segment-index="'+(index-1)+'" tabindex="0" role="button"';
    return '<circle class="gap-dot'+(selected?' selected':'')+'" cx="'+xp(index)+'" cy="'+yp(point.gapSeconds)+
      '" r="'+(selected?7:5)+'"'+button+' aria-label="'+esc(point.name)+
      ', tidslucka '+signed(point.gapSeconds)+'"><title>'+esc(point.name)+' · '+signed(point.gapSeconds)+
      '</title></circle>';
  }).join('');
  const labels=rows.map((point,index) => '<text x="'+xp(index)+'" y="252" text-anchor="middle" class="gap-checkpoint">'+
    esc(point.name.slice(0,15))+'</text>').join('');
  const ticks=[-1,-0.5,0,0.5,1].map((fraction) => '<line class="gridline" x1="'+left+'" y1="'+yp(fraction*absoluteMaximum)+
    '" x2="'+right+'" y2="'+yp(fraction*absoluteMaximum)+'"/><text x="1" y="'+(yp(fraction*absoluteMaximum)+5)+'">'+
    signed(fraction*absoluteMaximum)+'</text>').join('');
  const table='<div class="table-wrap"><table class="segment-table"><thead><tr><th>Kontroll</th><th>Denna löpare</th>'+
    '<th>Fältets median</th><th>Skillnad</th></tr></thead><tbody>'+
    rows.map((point)=>'<tr><td>'+esc(point.name)+'</td><td>'+time(point.elapsedSeconds)+'</td><td>'+
      time(point.medianElapsedSeconds)+'</td><td>'+signed(point.gapSeconds)+'</td></tr>').join('')+'</tbody></table></div>';
  return '<p class="muted">Fast referensgrupp med <strong>'+model.n+
    ' fullföljare</strong> som har samma verifierade kontrollserie. Positiv skillnad betyder senare än medianen; negativ betyder tidigare. Inga placeringar eller GPS-positioner härleds.</p>'+
    '<svg class="gap-chart" role="group" viewBox="0 0 940 272" aria-label="Tidslucka i sekunder mot en fast komplett referenskohort">'+
    ticks+'<line class="gap-zero" x1="'+left+'" x2="'+right+'" y1="'+middle+'" y2="'+middle+'"/>'+
    '<polyline class="gap-line" points="'+path+'" fill="none"/>'+points+labels+'</svg>'+table;
}

function renderRunner() {
  const result = state.selected;
  if (!result) {
    $('#runner').className = 'runner empty';
    $('#runner').textContent = 'Sök en löpare ovan och öppna resultatet för individuell analys.';
    return;
  }
  const segments = buildSegments(result);
  const observationRows = segments.map((segment, index) =>
    '<tr class="' + (state.segmentIndex === index ? 'selected-segment' : '') +
    '"><td>' + esc(segment.name) + '</td><td>' +
    (Number.isFinite(segment.checkpointKm) ? segment.checkpointKm.toLocaleString('sv-SE') + ' km' : 'Ej verifierad') +
    '</td><td>' + time(segment.elapsedSeconds) + '</td><td>' + time(segment.seconds) +
    ' <button type="button" class="segment-select" data-segment-index="' + index + '">' +
    (state.segmentIndex === index ? 'Vald' : 'Visa') + '</button></td></tr>').join('');
  const selected = Number.isInteger(state.segmentIndex) && segments[state.segmentIndex] ?
    segments[state.segmentIndex] : null;
  const callout = selected ? '<p class="segment-callout">Vald delsträcka: <strong>' + esc(selected.from) + ' → ' +
    esc(selected.name) + '</strong> · ' + time(selected.seconds) +
    (Number.isFinite(selected.distanceKm) ? ' · ' + selected.distanceKm.toLocaleString('sv-SE') + ' km' : ' · distans ej verifierad') + '</p>' : '';
  const officialRank = result.rank != null && String(result.rank).trim() ? esc(result.rank) : 'Ej publicerad';
  const finish = result.status === 'FINISHED' ? time(result.finish_seconds) : esc(result.status);
  $('#runner').className = 'runner';
  const runnerGender = GaxField.groupGender(result.gender);
  $('#runner').style.setProperty('--runner-gender-color',
    runnerGender === 'Män' ? '#2563eb' : runnerGender === 'Kvinnor' ? '#db2777' : '#1689a7');
  $('#runner').innerHTML = '<h3>' + esc(runnerChip(result)) + '</h3>' +
    '<p>' + esc(result.status) + ' · ' + esc(result.club || 'Klubb ej publicerad') + '</p>' +
    '<div class="runner-facts"><div><small>Sluttid / status</small><strong>' + finish + '</strong></div>' +
    '<div><small>Officiell placering</small><strong>' + officialRank + '</strong></div>' +
    '<div><small>Publicerade passager</small><strong>' + (result.observations || []).length + '</strong></div></div>' +
    '<div class="runner-toolbar"><button type="button" id="runner-to-comparison">' +
    (state.compare.includes(result.result_id) ? 'Ta bort från Direktjämförelse' : 'Lägg till Direktjämförelse') +
    '</button><button type="button" id="runner-plan-link">Visa personlig loppplan</button></div>' +
    '<h4>Verkliga mellantider</h4>' +
    (segments.length ? '<div class="table-wrap"><table class="segment-table"><thead><tr><th>Kontrollpunkt</th><th>Distans</th><th>Ackumulerad tid</th><th>Delsträcka</th></tr></thead><tbody>' +
      '<tr><td>Start</td><td>0 km</td><td>0:00:00</td><td>–</td></tr>' + observationRows + '</tbody></table></div>' :
      '<p>Inga importerade, verifierade mellantidsobservationer för detta resultat.</p>') +
    callout + '<h4>Fart på verifierade delsträckor</h4>' + speedChart(segments, result, state.segmentIndex) +
    '<h4>Tidsåtgång per delsträcka</h4>' + durationChart(segments, state.segmentIndex) +
    '<h4>Tidslucka mot fältets median</h4>' + runnerMedianGapChart(result) +
    '<p class="muted">Start är tid 0. Mål används bara när en positiv officiell sluttid finns. Saknade observationer eller okänt avstånd ger ingen fabricerad fart eller GPS-replay.</p>';
  const runnerTables = $('#runner').querySelectorAll('.segment-table');
  labelMobileTable(runnerTables[0], ['Kontrollpunkt', 'Distans', 'Ackumulerad tid', 'Delsträckstid']);
  labelMobileTable(runnerTables[1], ['Kontrollpunkt', 'Denna löpare', 'Fältets median', 'Skillnad']);
  enhanceChartViewports();
  const select = (index) => { state.segmentIndex = index; renderRunner(); };
  document.querySelectorAll('[data-segment-index]').forEach((button) => {
    button.onclick = () => select(Number(button.dataset.segmentIndex));
    button.onkeydown = (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(Number(button.dataset.segmentIndex)); } };
  });
  $('#runner-to-comparison').onclick = () => {
    if (state.compare.includes(result.result_id)) state.compare = state.compare.filter((id) => id !== result.result_id);
    else if (state.compare.length < 2) state.compare.push(result.result_id);
    else { $('#runner-to-comparison').textContent = 'Ta först bort ett av de två valda resultaten'; return; }
    renderRows(); renderComparison(); renderRunner(); syncUrl(true);
  };
  $('#runner-plan-link').onclick = () => { $('#personal-plan').scrollIntoView({ block: 'start' }); };
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
  labelMobileTable($('#plan .segment-table'), ['Från', 'Till', 'Distans', 'Andel av loppet', 'Segmenttid', 'Ackumulerad tid', 'Underlag']);
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

function comparisonColor(result, role) {
  const gender = GaxField.groupGender(result.gender);
  // No guessing from names. Roles are differentiated by solid/dashed line.
  return gender === 'Män' ? '#2563eb' : gender === 'Kvinnor' ? '#db2777' : role === 'A' ? '#0f766e' : '#b45309';
}
function comparisonTimeChart(model) {
  const stops = model.checkpoints;
  if (model.crossEdition || stops.length < 2) return '<p class="muted">En sammanhängande tvålinjegraf kräver minst två jämförbara, officiella mellantider i samma upplaga.</p>';
  const series = [
    { name: model.a.name, key: 'a', color: comparisonColor(model.a, 'A'), dash: '' },
    { name: model.b.name, key: 'b', color: comparisonColor(model.b, 'B'), dash: '7 5' }
  ];
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
      '" r="5" fill="' + (seriesInfo.dash ? '#ffffff' : seriesInfo.color) +
      '" stroke="' + seriesInfo.color + '" stroke-width="2"><title>' + esc(seriesInfo.name) + ' · ' + esc(stop.name) +
      ': ' + time(stop[seriesInfo.key]) + '</title></circle>').join('');
    return '<polyline fill="none" stroke="' + seriesInfo.color + '" stroke-width="3" ' +
      (seriesInfo.dash ? 'stroke-dasharray="' + seriesInfo.dash + '" ' : '') +
      'points="' + coords + '"/>' + dots;
  }).join('');
  return '<figure class="compare-figure"><figcaption>Ackumulerad officiell tid vid gemensamma kontroller</figcaption>' +
    '<div class="comparison-legend"><span class="role-a" style="color:' + comparisonColor(model.a, 'A') + '">A · heldragen – ' +
    esc(runnerChip(model.a)) + '</span><span class="role-b" style="color:' + comparisonColor(model.b, 'B') +
    '">B · streckad – ' + esc(runnerChip(model.b)) + '</span></div>' +
    '<svg viewBox="0 0 900 260" role="group" aria-label="Två officiella tidsserier. A heldragen och B streckad, könsfärg bara när källan anger kön">' +
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
    return '<div class="compare-person ' + role + '" style="--comparison-color:' +
      comparisonColor(runner, letter) + '"><h3>' + letter + ' · ' + esc(runnerChip(runner)) + '</h3><p>' +
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
  labelMobileTable($('#comparison .segment-table'), ['Kontrollpunkt', 'Löpare A', 'Löpare B', 'Tidslucka']);
  enhanceChartViewports();
}

function renderMapDuel() {
  const selected = state.duel.map((id) => state.data.results.find((result) => result.result_id === id)).filter(Boolean);
  if (selected.length < 2) { $('#map-duel-panel').className = 'runner empty'; $('#map-duel-panel').textContent = `${selected.length}/2–5 resultat valda. Välj minst två.`; return; }
  $('#map-duel-panel').className = 'runner';
  $('#map-duel-panel').innerHTML = `<h3>Förberedda kartduellresultat (${selected.length}/5)</h3><ol>${selected.map((result) => `<li>${esc(result.name)} · ${esc(result.status)} · ${time(result.finish_seconds)}</li>`).join('')}</ol><p>Kartduell/replay är fortfarande gated: lokala kandidatspår finns, men autentisk årsanknytning, publiceringsrätt, checkpoint-geometri och verifierad tidskoppling saknas.</p>`;
}

function finishChartRows() {
  const list = editionResults(state.year).filter((r) => r.status === 'FINISHED' &&
    Number.isFinite(r.finish_seconds) && r.finish_seconds > 0);
  if (state.finishGroup === 'all') return list;
  const gender = state.finishGroup === 'female' ? 'Kvinnor' : 'Män';
  return list.filter((r) => GaxField.groupGender(r.gender) === gender);
}
function finishGroupLabel() {
  return state.finishGroup === 'all' ? 'Hela fältet' : state.finishGroup === 'female' ? 'Kvinnor' : 'Män';
}
function renderFinishGroupSelector() {
  const source = GaxField.analyze(editionResults(state.year)).genders;
  const available = {all:true, female:!!source.Kvinnor, male:!!source.Män};
  if (!available[state.finishGroup]) state.finishGroup = 'all';
  $('#finish-group-selector').innerHTML = [
    ['all', 'Alla', source.total],
    ['female', 'Kvinnor', source.Kvinnor ? source.Kvinnor.n : null],
    ['male', 'Män', source.Män ? source.Män.n : null]
  ].map(([id,label,n]) => '<button type="button" class="finish-group-button ' +
    (id===state.finishGroup?' selected':'') + '" data-finish-group="' + id +
    '" aria-pressed="' + (id===state.finishGroup) + '"' +
    (n == null ? ' disabled title="Minst fem verifierade sluttider med rapporterat kön krävs"' : '') +
    '>' + label + (n == null ? ' (saknar underlag)' : ' (n=' + n + ')') + '</button>').join('');
  $('#finish-group-selector').querySelectorAll('[data-finish-group]').forEach((button) => {
    button.onclick = () => {
      if (button.disabled) return;
      state.finishGroup = button.dataset.finishGroup;
      renderFinishGroupSelector();
      chart();
      renderPercentiles();
    };
  });
}
function chart() {
  const finished = finishChartRows();
  const histogram = $('#histogram'), scatter = $('#scatter');
  if (!finished.length) {
    histogram.textContent = 'Ingen verifierad sluttidsdata.';
    scatter.textContent = 'Ingen verifierad placeringsdata.';
    $('#stats-note').textContent = 'Inga källverifierade sluttider finns för valt urval.';
    return;
  }
  const values = finished.map((r) => r.finish_seconds);
  const minimum = Math.min(...values), maximum = Math.max(...values);
  const span = Math.max(1, maximum - minimum);
  const bins = Math.max(8, Math.min(35, Math.ceil(span/900)));
  const counts = Array(bins).fill(0);
  const binWidth = span / bins;
  for (const runner of finished) counts[Math.min(bins - 1, Math.floor((runner.finish_seconds - minimum) / binWidth))] += 1;
  const barMax = Math.max(1, ...counts);
  const x = (fraction) => 46 + fraction * 348, y = (fraction) => 142 - fraction * 114;
  const yTicks = [0,.25,.5,.75,1].map((v) =>
    '<line class="gridline" x1="46" x2="394" y1="' + y(v) + '" y2="' + y(v) +
    '"/><text x="2" y="' + (y(v)+4) + '">' + Math.round(barMax*v) + '</text>').join('');
  const xTicks = [0,.25,.5,.75,1].map((v) =>
    '<text text-anchor="middle" x="' + x(v) + '" y="163">' +
    time(minimum + span*v).slice(0,6) + '</text>').join('');
  const markers = [[.1,'P10'],[.5,'P50'],[.9,'P90']].map(([p,label]) => {
    const fraction = (percentile(values,p) - minimum)/span;
    return '<line class="percentile-marker" x1="' + x(fraction) + '" x2="' + x(fraction) +
      '" y1="27" y2="142"/><title>' + label + ': ' + time(percentile(values,p)) + '</title>';
  }).join('');
  const bars = counts.map((count,index) => {
    const center = x(index/bins);
    const height = count/barMax * 114;
    const first = time(minimum + index*binWidth), last = time(minimum + (index+1)*binWidth);
    return '<rect class="bar gender-' + state.finishGroup + '" data-hist-bin="' + index +
      '" tabindex="0" role="button" aria-label="' + first + ' till ' + last +
      ': ' + count + ' fullföljare" x="' + center + '" y="' + (142-height) +
      '" width="' + Math.max(2,348/bins-2) + '" height="' + height +
      '"><title>' + first + '–' + last + ': ' + count + ' målgångar (' +
      (100*count/finished.length).toLocaleString('sv-SE',{maximumFractionDigits:1}) +
      ' %)</title></rect>';
  }).join('');
  histogram.innerHTML = '<svg viewBox="0 0 430 182" role="group" aria-label="Histogram över verkliga officiella sluttider för ' +
    finishGroupLabel() + '"><line class="axis" x1="46" y1="142" x2="394" y2="142"/>' +
    yTicks + xTicks + markers + bars +
    '<text x="2" y="17">antal</text><text x="160" y="180">sluttid (H:MM)</text></svg>' +
    '<p id="histogram-selection" class="chart-inspect muted" role="status">Tryck på en stapel för att läsa av intervall och antal.</p>';
  histogram.querySelectorAll('[data-hist-bin]').forEach((bar) => {
    const describe = () => {
      const index = Number(bar.dataset.histBin);
      const count = counts[index];
      $('#histogram-selection').textContent = time(minimum+index*binWidth) + '–' +
        time(minimum+(index+1)*binWidth) + ': ' + count + ' fullföljare, ' +
        (100*count/finished.length).toLocaleString('sv-SE',{maximumFractionDigits:1}) + ' % av ' +
        finishGroupLabel().toLocaleLowerCase('sv-SE') + '.';
    };
    bar.onclick = describe;
    bar.onkeydown = (event) => { if (event.key==='Enter'||event.key===' ') {event.preventDefault();describe();} };
  });
  // Public rank is only used where *officially published*. Never infer rank from elapsed finish time.
  const points = finished.filter((r) => /^\d+$/.test(String(r.rank || '')));
  if (!points.length) {
    scatter.textContent = 'Ingen publicerad numerisk placering finns i denna upplaga och grupp. Inga placeringar har räknats fram.';
    enhanceChartViewports();
    $('#stats-note').textContent = finished.length + ' FINISHED-resultat med giltig sluttid i ' + finishGroupLabel() +
      '; placeringsgrafen kräver publicerade placeringar.';
    return;
  }
  const ranks = points.map((r) => Number(r.rank));
  const maxRank = Math.max(1,...ranks);
  const plotTop = 28, plotBottom = 142;
  const px = (seconds) => x((seconds-minimum)/span);
  const py = (rank) => plotTop + (rank-1)/Math.max(1,maxRank-1)*(plotBottom-plotTop);
  const rankGrid = [0,.25,.5,.75,1].map((v) => {
    const rank = 1+(maxRank-1)*v, yPos=py(rank);
    return '<line class="gridline" x1="46" x2="394" y1="' + yPos +
      '" y2="' + yPos + '"/><text x="3" y="' + (yPos+4) + '">' + Math.round(rank) + '</text>';
  }).join('');
  const timeTicks = [0,.25,.5,.75,1].map((v) =>
    '<text text-anchor="middle" x="' + x(v) + '" y="162">' +
    time(minimum + span*v).slice(0,6) + '</text>').join('');
  scatter.innerHTML = '<svg viewBox="0 0 430 182" role="group" aria-label="Sluttid på X-axeln och källa publicerad placering på Y-axeln, plats 1 överst">' +
    rankGrid + timeTicks + '<line class="axis" x1="46" y1="142" x2="394" y2="142"/>' +
    points.map((runner) => '<circle class="dot dot-' +
      (GaxField.groupGender(runner.gender)==='Kvinnor' ? 'female' :
        GaxField.groupGender(runner.gender)==='Män' ? 'male' : 'unknown') +
      '" data-chart-runner="' + esc(runner.result_id) +
    '" role="button" tabindex="0" aria-label="Öppna individuell analys för ' + esc(runner.name) +
    '" cx="' + px(runner.finish_seconds) + '" cy="' + py(Number(runner.rank)) +
    '" r="3"><title>' + esc(runner.name) + ': ' + time(runner.finish_seconds) +
    ' · publicerad placering ' + esc(runner.rank) + '</title></circle>').join('') +
    '<text x="145" y="180">Sluttid (H:MM)</text><text x="3" y="17">plac.</text></svg>';
  scatter.insertAdjacentHTML('beforeend',
    '<div class="scatter-selector"><label>Öppna löpare i grafen ' +
    '<select id="scatter-runner-select" aria-label="Välj löpare i placeringsdiagrammet"><option value="">Välj löpare och officiell placering</option>' +
    points.map((r) => '<option value="' + esc(r.result_id) + '">' +
    esc(r.name) + ' · placering ' + esc(r.rank) + ' · ' + time(r.finish_seconds) +
    '</option>').join('') + '</select></label></div>');
  const openResult = (id) => {
    const r = state.data.results.find((row) => row.result_id === id);
    if (!r) return;
    state.selected = r; state.segmentIndex = null; state.planTarget = null;
    renderRunner(); renderPlan(); syncUrl(true);
    $('#runner').focus({preventScroll:true});
    $('#runner-analysis').scrollIntoView({block:'start'});
  };
  $('#scatter-runner-select').onchange = (event) => openResult(event.target.value);
  scatter.querySelectorAll('[data-chart-runner]').forEach((dot) => {
    dot.onclick = () => openResult(dot.dataset.chartRunner);
    dot.onkeydown = (event) => { if (event.key==='Enter'||event.key===' ') {event.preventDefault();openResult(dot.dataset.chartRunner);} };
  });
  enhanceChartViewports();
  $('#stats-note').textContent = finished.length + ' verifierade FINISHED-resultat i ' +
    finishGroupLabel() + '. Placeringar visas enbart om källan publicerat ett numeriskt värde.';
}
function renderPercentiles() {
  const values = finishChartRows().map((r) => r.finish_seconds);
  if (!values.length) { $('#percentiles').textContent='Ingen verifierad sluttidsdata.'; return; }
  $('#percentiles').className = 'runner';
  const probs = [[.10,'P10'],[.25,'P25'],[.50,'P50 median'],[.75,'P75'],[.90,'P90']];
  $('#percentiles').innerHTML = '<p class="muted">Urval: ' + finishGroupLabel() + ', n=' +
    values.length + ' verifierade FINISHED-tider. Linjär interpolation, h=(n−1)×p.</p>' +
    '<div class="percentile-values">' + probs.map(([probability,label]) =>
    '<div class="percentile-item"><strong>' + label + '</strong><span>' +
    time(percentile(values,probability)) + '</span><button type="button" data-use-percentile="' +
    probability + '">Pröva som måltid</button></div>').join('') + '</div>';
  $('#percentiles').querySelectorAll('[data-use-percentile]').forEach((button) => {
    button.onclick = () => {
      const value = Math.round(percentile(values, Number(button.dataset.usePercentile)));
      state.targetSeconds = value;
      renderTargetPlacement();
      $('#target-tool').scrollIntoView({block:'start'});
      $('#target-time-input')?.focus({preventScroll:true});
    };
  });
}

function renderHistory() {
  const editions = state.data.editions.slice().sort((a, b) => b.year - a.year || b.edition_id.localeCompare(a.edition_id));
  $('#history').innerHTML = editions.map((item) => {
    const results = editionResults(item.edition_id); const finished = results.filter((result) => result.status === 'FINISHED'); const times = finished.map((result) => result.finish_seconds); const observations = results.reduce((sum, result) => sum + (result.observations || []).length, 0); const fastest = times.filter(Number.isFinite).sort((a, b) => a - b)[0];
    return `<tr><td data-label="Upplaga">${esc(item.edition_label)}</td><td data-label="Fullföljde">${finished.length}</td><td data-label="DNF">${results.filter((result) => result.status === 'DNF').length}</td><td data-label="Median">${time(median(times))}</td><td data-label="Snabbaste">${time(fastest)}</td><td data-label="Mellantider">${observations}</td></tr>`;
  }).join('');
  $('#history').querySelectorAll('td[data-label]').forEach((cell) => cell.setAttribute('aria-label', cell.dataset.label + ': ' + cell.textContent.trim()));
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


function renderTargetPlacement() {
  const finishers = editionResults(state.year).filter((r) => r.status === 'FINISHED' &&
    Number.isFinite(r.finish_seconds) && r.finish_seconds > 0);
  if (finishers.length < 5) {
    $('#target-placement').innerHTML = '<p class="muted">Underlaget räcker inte för en retrospektiv måltidsjämförelse.</p>';
    return;
  }
  const medianTime = GaxField.targetPosition(editionResults(state.year), Math.round(GaxStatistics.median(finishers.map((r) => r.finish_seconds))));
  const target = Number.isSafeInteger(state.targetSeconds) && state.targetSeconds > 0 ?
    state.targetSeconds : Math.round(medianTime.medianSeconds);
  const position = GaxField.targetPosition(editionResults(state.year), target);
  const portion = (100 * position.fraction).toLocaleString('sv-SE', {maximumFractionDigits:1});
  $('#target-placement').innerHTML =
    '<div class="target-controls"><label for="target-time-input">Simulerad måltid (H:MM:SS)<input id="target-time-input" type="text" inputmode="numeric" value="' +
    time(target) + '"></label><button id="target-run" type="button">Beräkna</button>' +
    '<button id="target-reset" type="button">Återställ median</button><span id="target-error" role="status" class="muted"></span></div>' +
    '<div class="target-summary"><div><small>Ungefärlig placering</small><strong>cirka ' +
    position.approximatePlace + ' av ' + position.n + '</strong></div><div><small>Så stor andel hade denna sluttid eller snabbare</small><strong>' +
    portion + ' %</strong></div><div><small>Upplagans median</small><strong>' +
    time(medianTime.medianSeconds) + '</strong></div></div>' +
    '<p class="muted">Retrospektiv jämförelse mot registrerade fullföljare i ' +
    esc(edition()?.edition_label || 'vald upplaga') +
    '. Detta är ingen officiell placering eller förutsägelse.</p>';
  $('#target-run').onclick = () => {
    const value = $('#target-time-input').value.trim();
    const match = value.match(/^(\d+):([0-5]\d):([0-5]\d)$/);
    if (!match) {
      $('#target-error').textContent = 'Ange en tid som H:MM:SS.';
      return;
    }
    const seconds = Number(match[1])*3600 + Number(match[2])*60 + Number(match[3]);
    if (!Number.isSafeInteger(seconds) || seconds <= 0) {
      $('#target-error').textContent = 'Tiden måste vara positiv och rimlig.';
      return;
    }
    state.targetSeconds = seconds;
    renderTargetPlacement();
  };
  $('#target-time-input').onkeydown = (event) => { if (event.key === 'Enter') $('#target-run').click(); };
  $('#target-reset').onclick = () => { state.targetSeconds = null; renderTargetPlacement(); };
}

function renderSegmentLab() {
  const target = $('#segment-lab-content');
  const results = editionResults(state.year);
  const complete = GaxField.cohort(results);
  if (!complete) {
    target.innerHTML = '<p class="muted">Inga fem kompletta, kronologiska och banjämförbara kontrollserier finns för denna upplaga. Delsträckelabbet är därför avstängt – inga mellantider har beräknats eller fyllts i.</p>';
    return;
  }
  const anchors = [{name:'Start',id:'START'},...complete.segments.map((segment) =>
    ({name:segment.to,id:segment.checkpointId}))];
  const last = anchors.length-1;
  if (!Number.isInteger(state.labFrom) || state.labFrom < 0 || state.labFrom >= last) state.labFrom=0;
  if (!Number.isInteger(state.labTo) || state.labTo<=state.labFrom || state.labTo>last) state.labTo=last;
  const nByGender = {all:complete.n,
    female:complete.runners.filter(({runner}) => GaxField.groupGender(runner.gender)==='Kvinnor').length,
    male:complete.runners.filter(({runner}) => GaxField.groupGender(runner.gender)==='Män').length};
  if (!['all','female','male'].includes(state.labGroup) || nByGender[state.labGroup]<5) state.labGroup='all';
  const model = GaxField.segmentLab(results,state.labFrom,state.labTo,state.labGroup);
  if (!model) {
    target.textContent='För denna avgränsning saknas minst fem komplett observerade tider. Prova Alla eller andra kontroller.';
    return;
  }
  const options = (selected, lower, upper) => anchors.map((anchor,index) =>
    index>=lower && index<=upper ? '<option value="'+index+'"'+(index===selected?' selected':'')+'>'+
    esc(anchor.name)+'</option>':'').join('');
  const groupOptions = [['all','Hela fältet'],['female','Kvinnor'],['male','Män']]
    .map(([id,label])=>'<option value="'+id+'"'+(id===state.labGroup?' selected':'')+
      (nByGender[id]<5?' disabled':'')+'>'+label+' (n='+nByGender[id]+
      (nByGender[id]<5?' – otillräckligt':'')+')</option>').join('');
  const timeAmount = (seconds) => time(Math.round(seconds));
  const distanceLabel = Number.isFinite(model.distanceKm) ?
    model.distanceKm.toLocaleString('sv-SE',{maximumFractionDigits:2})+' km (verifierat)' :
    'Distans saknas eller är inte jämförbar';
  const bands = model.q25Seconds!=null ?
    '<div><small>Q25–Q75 · mittre 50 %</small><strong>'+timeAmount(model.q25Seconds)+
    ' – '+timeAmount(model.q75Seconds)+'</strong></div>' :
    '<div><small>Q25–Q75</small><strong>n &lt; 10 – visas inte</strong></div>';
  const percentileBand = model.p10Seconds!=null ?
    '<div><small>P10–P90 · 80 %-spann</small><strong>'+timeAmount(model.p10Seconds)+
    ' – '+timeAmount(model.p90Seconds)+'</strong></div>' :
    '<div><small>P10–P90</small><strong>n &lt; 20 – visas inte</strong></div>';
  target.innerHTML='<p class="muted">Välj två verkligt observerade kontroller från samma upplaga. Samma fullständiga referenskohort används för varje kontroll.</p>'+
    '<div class="lab-controls"><label for="lab-from">Från <select id="lab-from">'+
    options(state.labFrom,0,last-1)+'</select></label>'+
    '<label for="lab-to">Till <select id="lab-to">'+options(state.labTo,state.labFrom+1,last)+'</select></label>'+
    '<label for="lab-group">Referens <select id="lab-group">'+groupOptions+'</select></label>'+
    '<button id="lab-reset" type="button">Start → Mål</button>'+
    '<button id="lab-last" type="button">Sista delsträckan</button></div>'+
    '<div class="lab-values"><div><small>Vald delsträcka</small><strong>'+esc(model.from)+' → '+esc(model.to)+'</strong></div>'+
    '<div><small>Distans</small><strong>'+esc(distanceLabel)+'</strong></div>'+
    '<div><small>Median · n='+model.n+'</small><strong>'+timeAmount(model.medianSeconds)+'</strong></div>'+
    bands+percentileBand+'</div>'+
    '<p class="muted">Ingen individuell eller officiell delsträckeplacering publiceras av detta statistikblock. Varje tidsvärde bygger på registrerad start, verkliga kontrollpassager och/eller officiell sluttid. Ingen GPS-position har rekonstruerats.</p>';
  $('#lab-from').onchange = (event) => {
    state.labFrom=Number(event.target.value);
    if(state.labTo<=state.labFrom) state.labTo=state.labFrom+1;
    renderSegmentLab();
  };
  $('#lab-to').onchange = (event) => {state.labTo=Number(event.target.value);renderSegmentLab();};
  $('#lab-group').onchange = (event) => {state.labGroup=event.target.value;renderSegmentLab();};
  $('#lab-reset').onclick = () => {state.labFrom=0;state.labTo=last;renderSegmentLab();};
  $('#lab-last').onclick = () => {state.labFrom=last-1;state.labTo=last;renderSegmentLab();};
}

function renderFieldInsights() {
  const data = GaxField.analyze(editionResults(state.year));
  const result = $('#field-insights');
  const info = (title, explanation) => '<details class="help inline-help"><summary aria-label="Om ' +
    esc(title) + '">ⓘ</summary><p>' + esc(explanation) + '</p></details>';
  let contents = '<div class="field-summary-row">' +
    '<div><strong>' + data.dnf.total + '</strong><small>Officiella DNF</small></div>' +
    '<div><strong>' + (data.complete ? data.complete.n : '–') +
    '</strong><small>Kompletta verifierade målgångsprofiler</small></div>' +
    '<div><strong>' + data.genders.reported + ' / ' + data.genders.total +
    '</strong><small>Fullföljare med angivet kön</small></div></div>';
  contents += '<article class="field-module"><div class="module-heading"><h3>Delsträckornas karaktär</h3>' +
    info('delsträckornas karaktär', 'En fast grupp fullföljare med samma observerade kontrollserie och bana används genom hela diagrammet. Median kräver minst fem fullständiga resultat, Q25–Q75 minst tio och P10–P90 minst tjugo. Mål ingår via officiell sluttid. Tiderna är inte GPS-mätningar.') +
    '</div>';
  if (!data.complete) {
    contents += '<p class="muted">Det finns inte fem fullständiga, jämförbara kontrollserier för denna upplaga. Inga mellantider har fyllts i.</p>';
  } else {
    const segments = data.complete.segments;
    const index = Number.isInteger(state.fieldSegmentIndex) && state.fieldSegmentIndex >= 0 &&
      state.fieldSegmentIndex < segments.length ? state.fieldSegmentIndex : 0;
    const selected = segments[index];
    const maxMedian = Math.max(...segments.map((segment) => segment.medianSeconds), 1);
    contents += '<p class="muted">Verifierad referenskohort: ' + data.complete.n +
      ' kompletta fullföljare, från Start till Mål. Kvartilband visas endast när underlaget medger det.</p>' +
      '<div class="field-segment-bars" role="group" aria-label="Välj delsträcka i analysen">' +
      segments.map((segment, i) => {
        const width = Math.max(2, Math.round(100 * segment.medianSeconds / maxMedian));
        return '<button type="button" class="field-segment-button' + (index === i ? ' selected' : '') +
          '" data-field-segment="' + i + '" aria-pressed="' + (index === i) + '"><span>' +
          esc(segment.from + ' → ' + segment.to) +
          '</span><span class="field-segment-bar"><span style="width:' + width + '%"></span></span>' +
          '<strong>' + time(segment.medianSeconds) + '</strong></button>';
      }).join('') + '</div>' +
      '<div id="field-segment-detail" class="field-segment-detail" aria-live="polite"><h4>' +
      esc(selected.from + ' → ' + selected.to) + '</h4><p><strong>Median:</strong> ' +
      time(selected.medianSeconds) + ' · <strong>Medianandel av egen sluttid:</strong> ' +
      selected.medianPercent.toLocaleString('sv-SE',{maximumFractionDigits:1}) +
      ' % · n=' + selected.n + '</p>' +
      (selected.p25Seconds != null ? '<p>Q25–Q75: ' +
        time(selected.p25Seconds) + ' – ' + time(selected.p75Seconds) + '</p>' :
        '<p>Q25–Q75 visas först vid minst tio fullständiga resultat.</p>') +
      (selected.p10Seconds != null ? '<p>P10–P90: ' +
        time(selected.p10Seconds) + ' – ' + time(selected.p90Seconds) + '</p>' :
        '<p>P10–P90 visas först vid minst tjugo fullständiga resultat.</p>') +
      (Number.isFinite(selected.distanceKm) ? '<p>Verifierat delsträckeavstånd: ' +
        selected.distanceKm.toLocaleString('sv-SE',{maximumFractionDigits:1}) + ' km</p>' :
        '<p>Fysisk delsträckedistans saknas; km-tempo visas inte.</p>') + '</div>';
  }
  contents += '</article>';
  contents += '<article class="field-module"><div class="module-heading"><h3>Snabbaste avslutningen – spurten mot mål</h3>' +
    info('snabbaste avslutningen', 'Officiell sluttid minus sista faktiska, gemensamma analytiska passagen ger sista delsträckans tid. Ingen avhoppspunkt eller hypotetisk passagetid beräknas. Könsgrupper redovisas bara vid minst fem källverifierade fullföljare i gruppen.') +
    '</div>';
  if (!data.sprint) {
    contents += '<p class="muted">Saknar fem resultat med samma verifierade sista kontroll före mål. Ingen topplista skapas.</p>';
  } else {
    const rows = (entries) => entries.filter((r) => !/anonym|valt att vara anonym/i.test(r.name)).slice(0,3)
      .map((r,i) => '<li><span>' + (i+1) + '. ' + esc(r.name) + '</span><strong>' +
        time(r.seconds) + '</strong></li>').join('');
    const section = (label, group, className) =>
      '<div class="sprint-group ' + className + '"><h4>' + esc(label) + '</h4>' +
      (group ? '<p>n=' + group.n + ' verifierade slutsegment</p><ol>' +
        (rows(group.top) || '<li>Inga namn som kan redovisas.</li>') + '</ol>' :
        '<p>Otillräckligt könsindelat underlag.</p>') + '</div>';
    contents += '<p class="muted">Verkligt sista segment: ' +
      esc(data.sprint.checkpoint) + ' → Mål. Underlag: ' + data.sprint.n + ' fullföljare.</p>' +
      '<div class="sprint-groups">' +
      section('Kvinnor', data.sprint.genders.Kvinnor, 'female') +
      section('Män', data.sprint.genders.Män, 'male') +
      '</div><details class="sprint-all"><summary>Snabbaste slutsegment – alla verifierade resultat</summary><ol>' +
      (rows(data.sprint.top) || '<li>Inga publicerbara namn i toppen.</li>') + '</ol></details>';
  }
  contents += '</article>';
  contents += '<article class="field-module"><div class="module-heading"><h3>DNF och senast observerade passager</h3>' +
    info('DNF-passager', 'En sista registrerad kontroll för en DNF betyder endast att den senaste importerade passagen finns där, inte att personen bröt vid kontrollen. Saknade passager kan bero på källluckor. Status DNF kommer från källan och rekonstrueras aldrig.') +
    '</div><p>Officiellt DNF: <strong>' + data.dnf.total + '</strong>. Senaste passage saknas för ' +
    data.dnf.withoutPassage + ' DNF-resultat.</p>';
  const observedCount = data.dnf.observed.reduce((sum, item) => sum + item.count, 0);
  if (observedCount) {
    contents += '<p class="muted">' + observedCount + ' DNF-resultat har minst en verkligt registrerad kontrollpassage. Fördelningen beskriver enbart senaste registrerade observation.</p>' +
      '<ul class="dnf-observations">' + data.dnf.observed.map((item) => '<li>' +
      esc(item.name) + ': ' + (item.count>=5 ? item.count + ' senaste registrerade' : 'färre än 5 senaste registrerade') +
      '</li>').join('') + '</ul>';
  } else {
    contents += '<p class="muted">Ingen verifierad observerad DNF-passage finns för denna upplaga.</p>';
  }
  contents += '</article>';
  contents += '<article class="field-module"><div class="module-heading"><h3>Kön och klubbar</h3>' +
    info('kön och klubbar', 'Kvinnor och män bygger bara på uttryckligt rapporterad könsuppgift. Kön härleds inte från namn. Klubbnamn används exakt som publicerat utan gissade alias. Gruppmedian visas först vid minst fem officiella måltider.') + '</div>' +
    '<div class="gender-median-summary">';
  for (const label of ['Kvinnor','Män']) {
    const group = data.genders[label];
    contents += '<div class="' + (label==='Kvinnor'?'female':'male') + '"><strong>' +
      label + '</strong><span>' + (group ? 'Median ' + time(group.medianSeconds) + ' · n=' + group.n :
      'Otillräckligt verifierat underlag') + '</span></div>';
  }
  contents += '</div>';
  contents += data.clubs.length ?
    '<div class="club-summary"><h4>Klubbar med minst fem målgångar</h4><div class="table-wrap"><table class="segment-table"><thead><tr><th>Klubb</th><th>Fullföljare</th><th>Mediantid</th></tr></thead><tbody>' +
    data.clubs.map((club) => '<tr><td>' + esc(club.name) + '</td><td>' +
      club.n + '</td><td>' + time(club.medianSeconds) + '</td></tr>').join('') +
    '</tbody></table></div></div>' : '<p class="muted">Ingen klubb har minst fem officiella sluttider med exakt samma klubbnamn.</p>';
  contents += '</article>';
  result.innerHTML = contents;
  result.querySelectorAll('[data-field-segment]').forEach((button) => {
    button.onclick = () => { state.fieldSegmentIndex = Number(button.dataset.fieldSegment); renderFieldInsights(); };
  });
}

// The SVG viewBox remains a stable data coordinate system. On narrow screens
// its text would shrink to illegible 4–7 px without a contained viewport.
// Preserve full fidelity with a horizontally scrollable canvas and a zoom modal.
let chartZoomOpener = null;
function enhanceChartViewports() {
  const dialog = $('#chart-zoom-dialog');
  if (!dialog) return;
  document.querySelectorAll('#runner svg, #comparison svg, #histogram svg, #scatter svg').forEach((svg) => {
    if (svg.closest('.chart-viewport')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'chart-viewport';
    wrapper.tabIndex = 0;
    wrapper.setAttribute('role', 'region');
    wrapper.setAttribute('aria-label', (svg.getAttribute('aria-label') || 'Diagram') + '. Sidledes rullning på små skärmar.');
    const parent = svg.parentNode;
    parent.insertBefore(wrapper, svg);
    wrapper.appendChild(svg);
    // Scrolling is retained on the original diagram, zoom has its own dialog.
    const actions = document.createElement('div');
    actions.className = 'chart-viewport-actions';
    const zoom = document.createElement('button');
    zoom.type = 'button';
    zoom.className = 'chart-enlarge';
    zoom.textContent = 'Förstora diagram';
    zoom.setAttribute('aria-label', 'Förstora ' + (svg.getAttribute('aria-label') || 'diagram'));
    zoom.onclick = () => {
      chartZoomOpener = zoom;
      $('#chart-zoom-title').textContent = svg.getAttribute('aria-label') || 'Förstorat diagram';
      const content = $('#chart-zoom-content');
      content.replaceChildren(svg.cloneNode(true));
      // Explicitly disable controls in the copied image. The original chart
      // remains operable and retains its data-action handlers.
      content.querySelectorAll('[role="button"]').forEach((element) => {
        element.removeAttribute('role');
        element.removeAttribute('tabindex');
      });
      dialog.showModal();
      $('#chart-zoom-close').focus();
    };
    actions.appendChild(zoom);
    wrapper.insertAdjacentElement('beforebegin',actions);
  });
}

function setupHelpDialog() {
  const dialog = $('#help-dialog'); const title = $('#help-dialog-title'); const body = $('#help-dialog-body');
  if (!dialog) return;
  document.querySelectorAll('.help summary').forEach((summary) => summary.addEventListener('click', (event) => { event.preventDefault(); title.textContent = summary.getAttribute('aria-label') || 'Metodförklaring'; body.textContent = summary.parentElement.querySelector('p')?.textContent || 'Metodförklaring saknas.'; dialog.showModal(); }));
  $('#help-dialog-close').onclick = () => dialog.close();
}

function render() { renderFacts(); renderFilters(); renderRows(); renderRunner(); renderPlan(); renderComparison(); renderMapDuel(); renderFinishGroupSelector(); chart(); renderPercentiles(); renderTargetPlacement(); renderHistory(); renderQuality(); renderExtended(); renderFieldInsights(); renderSegmentLab(); enhanceChartViewports(); }

$('#chart-zoom-dialog').addEventListener('close', () => {
  $('#chart-zoom-content').replaceChildren();
  if (chartZoomOpener?.isConnected) chartZoomOpener.focus({preventScroll:true});
  chartZoomOpener = null;
});
setupHelpDialog();
try { state.favorites = new Set(JSON.parse(localStorage.getItem('gax100-favorites') || '[]')); } catch (error) { state.favorites = new Set(); }
fetch('data.json').then((response) => response.json()).then((data) => { state.data = data; const params = new URLSearchParams(window.location.search); state.searchScope = params.get('scope') === 'all' ? 'all' : 'year'; state.year = data.editions.some((item) => item.edition_id === params.get('edition')) ? params.get('edition') : data.editions.slice().sort((a, b) => b.year - a.year || b.edition_id.localeCompare(a.edition_id))[0].edition_id; $('#year').innerHTML = data.editions.map((item) => `<option value="${esc(item.edition_id)}">${esc(item.edition_label)}</option>`).join(''); $('#year').value = state.year; const requested = data.results.find((result) => result.result_id === params.get('result')); if (requested) { state.selected = requested; state.year = requested.edition_id; $('#year').value = state.year; }
  const validIds = new Set(data.results.map((result) => result.result_id));
  state.compare = (params.get('compare') || '').split(',').filter((id) => validIds.has(id)).slice(0, 2);
  state.duel = (params.get('duel') || '').split(',').filter((id) => validIds.has(id)).slice(0, 5);
  render(); });
$('#year').onchange = (event) => { state.year = event.target.value; state.page = 1; state.selected = null; if (state.searchScope === 'year') { state.query = ''; $('#search').value = ''; } state.club = ''; state.clubQuery = ''; $('#club-autocomplete').value = ''; state.gender = ''; /* Preserve comparison and duel choices across edition changes. */ state.planTarget = null; state.targetSeconds = null; state.fieldSegmentIndex = null; state.finishGroup = 'all'; state.labFrom = null; state.labTo = null; state.labGroup = 'all'; state.segmentIndex = null; render(); syncUrl(true); };
$('#search-scope').onchange = (event) => { state.searchScope = event.target.value; state.page = 1; state.club = ''; state.clubQuery = ''; $('#club-autocomplete').value = ''; state.gender = ''; renderFilters(); renderRows(); syncUrl(true); };
$('#status-filter').onchange = (event) => { state.status = event.target.value; state.page = 1; renderRows(); };
$('#search').oninput = (event) => { state.query = event.target.value; state.page = 1; renderRows(); };
$('#club').onchange = (event) => { state.club = event.target.value; state.clubQuery = ''; $('#club-autocomplete').value = ''; state.page = 1; renderRows(); };
$('#club-autocomplete').oninput = (event) => { state.clubQuery = event.target.value; state.club = ''; $('#club').value = ''; state.page = 1; renderRows(); };
$('#gender').onchange = (event) => { state.gender = event.target.value; state.page = 1; renderRows(); };
$('#sort').onchange = (event) => { state.sort = event.target.value; state.page = 1; renderRows(); };
$('#page-size').onchange = (event) => { const chosen = Number(event.target.value); if (![10,25,50].includes(chosen)) return; state.pageSize = chosen; state.page = 1; renderRows(); };
$('#reset-result-filters').onclick = () => {
  state.query = ''; state.club = ''; state.clubQuery = ''; state.gender = ''; state.status = ''; state.sort = 'time'; state.pageSize = 10; state.page = 1;
  $('#search').value = ''; $('#club-autocomplete').value = ''; state.clubQuery = ''; $('#sort').value = 'time'; $('#page-size').value = '10';
  renderFilters(); renderRows();
};
window.addEventListener('popstate', () => {
  if (!state.data) return;
  const params = new URLSearchParams(window.location.search);
  const editionParam = params.get('edition');
  const candidate = state.data.results.find((result) => result.result_id === params.get('result')) || null;
  state.searchScope = params.get('scope') === 'all' ? 'all' : 'year';
  state.year = candidate ? candidate.edition_id :
    state.data.editions.some((ed) => ed.edition_id === editionParam) ? editionParam : state.year;
  state.selected = candidate;
  const known = new Set(state.data.results.map((item) => item.result_id));
  const ids = (key, max) => [...new Set((params.get(key) || '').split(',').filter((id) => known.has(id)))].slice(0, max);
  state.compare = ids('compare', 2);
  state.duel = ids('duel', 5);
  state.page = 1; state.planTarget = null; state.targetSeconds = null; state.fieldSegmentIndex = null; state.finishGroup = 'all'; state.labFrom = null; state.labTo = null; state.labGroup = 'all'; state.segmentIndex = null;
  state.query = ''; state.club = ''; state.gender = ''; state.status = '';
  $('#search').value = '';
  $('#year').value = state.year;
  render();
});

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
