const { test, expect } = require('@playwright/test');

async function loadData(page) {
  return page.evaluate(() => fetch('data.json').then((response) => response.json()));
}

async function assertNoHorizontalOverflow(page) {
  const violations = await page.evaluate(() => {
    const candidates = [document.documentElement, document.body, ...document.querySelectorAll('main, main > *, section, .hero, .fact, .runner, .stats-grid, .chart, .filters, .pagination, .analysis-card, .result-table, .result-table tr, .result-table td')];
    return [...new Set(candidates)].map((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        selector: element.id || element.className || element.tagName,
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        overflowX: style.overflowX,
        left: Math.round(rect.left * 10) / 10,
        right: Math.round(rect.right * 10) / 10
      };
    }).filter((item) => item.scrollWidth > item.clientWidth + 1 || item.left < -1 || item.right > window.innerWidth + 1);
  });
  expect(violations, JSON.stringify(violations)).toEqual([]);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflowX)).not.toBe('hidden');
  expect(await page.evaluate(() => [...document.querySelectorAll('*')].filter((element) => getComputedStyle(element).overflowX === 'hidden' && element.scrollWidth > element.clientWidth + 1 && !element.closest('.chart')).length)).toBe(0);
  expect(await page.evaluate(() => [...document.querySelectorAll('.quality-table-wrap')].some((element) => { const rect = element.getBoundingClientRect(); return rect.left < -1 || rect.right > window.innerWidth + 1 || getComputedStyle(element).overflowX !== 'auto'; }))).toBe(false);
}

test('desktop: upplagor, sökning, filter, sortering, individuell analys och jämförelse', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('.facts .fact')).toHaveCount(5);
  await expect(page.locator('#year option[value="gax100-2021-a"]')).toHaveCount(1);
  await expect(page.locator('#year option[value="gax100-2021-b"]')).toHaveCount(1);

  const data = await loadData(page);
  const first = data.results.find((result) => result.edition_id === 'gax100-2021-a');
  await page.locator('#year').selectOption('gax100-2021-a');
  await expect(page.locator('#result-count')).toContainText('2021');
  await page.locator('#year').selectOption('gax100-2021-b');
  await expect(page.locator('#result-count')).toContainText('2021');
  await page.locator('#year').selectOption('gax100-2025');
  await expect(page.locator('#result-count')).toContainText('2025');
  await expect(page.locator('#facts')).toContainText('109');
  await expect(page.locator('#facts')).toContainText('40');
  await expect(page.locator('#quality-rows')).toContainText('2025');
  await page.locator('#year').selectOption(first.edition_id);

  await page.locator('#search').fill(first.name.slice(0, Math.max(3, first.name.length - 1)));
  await expect(page.locator('#rows tr')).toHaveCount(1);
  await page.locator('#sort').selectOption('name');
  const clubResult = data.results.find((result) => result.edition_id === first.edition_id && result.club);
  if (clubResult) {
    await page.locator('#search').fill('');
    await page.locator('#club').selectOption({ label: clubResult.club });
    await expect(page.locator('#rows tr').first()).toBeVisible();
    await page.locator('#club').selectOption('');
    await page.locator('#search').fill(first.name.slice(0, Math.max(3, first.name.length - 1)));
  }
  await page.locator('#rows [data-id]').click();
  await expect(page.locator('#runner')).not.toHaveClass(/empty/);
  await page.locator('.help summary').first().click();
  await expect(page.locator('#help-dialog')).toBeVisible();
  await page.locator('#help-dialog-close').click();
  if (await page.locator('#plan-target').count()) {
    await page.locator('#plan-target').fill('24:00:00');
    await page.locator('#apply-plan-target').click();
    await expect(page.locator('#plan')).toContainText('Beräknad segmenttid');
  }

  await page.locator('#search').fill('');
  await page.locator('#rows [data-compare]').nth(0).click();
  await page.locator('#rows [data-compare]').nth(1).click();
  await expect(page.locator('#comparison .compare-person')).toHaveCount(2);
  await expect(page.locator('#comparison .segment-table')).toHaveCount(1);
  await page.screenshot({ path: testInfo.outputPath('desktop-1440.png'), fullPage: true });
  await assertNoHorizontalOverflow(page);
});

test('kartduell: exakt 2–5 val och GPX-gating', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 900, height: 900 });
  await page.goto('/');
  const duelButtons = page.locator('#rows [data-duel]');
  for (let i = 0; i < 5; i += 1) await duelButtons.nth(i).click();
  await expect(page.locator('#map-duel-panel')).toContainText('5/5');
  await expect(page.locator('#map-duel-panel')).toContainText('gated');
  await duelButtons.nth(5).click();
  await expect(page.locator('#map-duel-panel')).toContainText('5/5');
  await page.screenshot({ path: testInfo.outputPath('desktop-900-map-duel.png'), fullPage: true });
  await assertNoHorizontalOverflow(page);
});

for (const viewport of [{ width: 1536, height: 900 }, { width: 1200, height: 900 }, { width: 1024, height: 900 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 360, height: 800 }]) {
  test(`responsiv layout ${viewport.width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.locator('.facts .fact')).toHaveCount(5);
    await expect(page.locator('#histogram')).toBeVisible();
    await expect(page.locator('#history')).toBeVisible();
    if (viewport.width <= 390) {
      await expect(page.locator('.result-table tbody tr')).toHaveCount(10);
      await expect(page.locator('#result-pagination')).toContainText('Sida');
      await expect(page.locator('.result-actions button').first()).toBeVisible();
      await page.locator('#result-pagination [data-page]').last().click();
      await expect(page.locator('#result-pagination')).toContainText('Sida 2');
    }
    await assertNoHorizontalOverflow(page);
    await page.screenshot({ path: testInfo.outputPath(`responsive-${viewport.width}.png`), fullPage: true });
  });
}


test('kartarkiv i webbläsare: publika källkartor och filväljare', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/karta.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1')).toContainText('Historiska banor');
  await expect(page.locator('#left-route option')).toHaveCount(6);
  await expect(page.locator('#right-route option')).toHaveCount(6);
  await expect(page.locator('#left-map')).toHaveAttribute('src', 'https://www.plotaroute.com/embedmap/2332034');
  await expect(page.locator('#right-map')).toHaveAttribute('src', 'https://www.plotaroute.com/embedmap/2659350');
  await page.locator('#left-route').selectOption('2310208');
  await expect(page.locator('#left-link')).toHaveAttribute('href', 'https://www.plotaroute.com/route/2310208');
  await expect(page.locator('#left-map')).toHaveAttribute('src', 'https://www.plotaroute.com/embedmap/2310208');
  await expect(page.locator('#gpx-upload')).toHaveAttribute('multiple', '');
  await expect(page.locator('#zoom-knab')).toBeVisible();
  await expect(page.locator('#overlay-empty')).toBeVisible();
  await expect(page.locator('#overlay-map')).toBeHidden();
  const sampleGpx = '<?xml version="1.0"?><gpx version="1.1" creator="QA"><trk><name>GAX100 QA</name><trkseg><trkpt lat="55.64000" lon="14.27400"><ele>15</ele></trkpt><trkpt lat="55.64020" lon="14.27420"><ele>18</ele></trkpt><trkpt lat="55.64040" lon="14.27440"><ele>21</ele></trkpt></trkseg></trk></gpx>';
  await page.locator('#gpx-upload').setInputFiles({name:'qa-track.gpx',mimeType:'application/gpx+xml',buffer:Buffer.from(sampleGpx)});
  await expect(page.locator('#local-status')).toContainText('1 spår visas');
  await expect(page.locator('#overlay-map')).toBeVisible();
  await expect(page.locator('#overlay-meta')).toContainText('qa-track.gpx');
  // Leaflet styles must actually be loaded: without them the tile panes float
  // outside the map and GPX paths cannot be seen even though parsing succeeds.
  expect(await page.locator('.leaflet-pane').first().evaluate(
    (element) => getComputedStyle(element).position
  )).toBe('absolute');
  await expect(page.locator('.leaflet-overlay-pane svg path')).not.toHaveCount(0);
  await expect(page.locator('#base-layer')).toHaveValue('none');
  await page.locator('#base-layer').selectOption('none');
  await expect(page.locator('#tile-status')).toContainText('utan extern bakgrund');
  await page.locator('#clear-tracks').click();
  await expect(page.locator('#overlay-empty')).toBeVisible();
  await assertNoHorizontalOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('kartarkiv-mobile.png'), fullPage: true });
});

test('historisk loppplan fördelar hela måltiden och markerar tillförlitlig täckning', async ({ page }) => {
  await page.goto('/');
  const data = await loadData(page);
  const selected = data.results.find((result) => result.edition_id === 'gax100-2023' &&
    result.status === 'FINISHED' && result.observations?.length === 3);
  expect(selected).toBeTruthy();
  await page.locator('#year').selectOption('gax100-2023');
  await page.locator('#search').fill(selected.name);
  await page.locator('#rows [data-id]').first().click();
  await expect(page.locator('#plan .segment-table tbody tr')).toHaveCount(4);
  await expect(page.locator('#plan')).toContainText('Start');
  await expect(page.locator('#plan')).toContainText('Mål');
  await page.locator('#plan-target').fill('24:00:00');
  await page.locator('#apply-plan-target').click();
  await expect(page.locator('#plan .segment-table tbody tr').last().locator('td').nth(5)).toHaveText('24:00:00');
  const spans = await page.locator('#plan .segment-table tbody tr td:nth-child(5)').allTextContents();
  const total = spans.reduce((sum, value) => {
    const parts = value.split(':').map(Number);
    return sum + parts[0] * 3600 + parts[1] * 60 + parts[2];
  }, 0);
  expect(total).toBe(86400);
  await page.locator('#reset-plan-target').click();
  await expect(page.locator('#plan-target')).not.toHaveValue('24:00:00');

  await page.locator('#year').selectOption('gax100-2025');
  await page.locator('#search').fill('');
  await page.locator('#rows [data-id]').first().click();
  await expect(page.locator('#plan')).toContainText('Ingen historiskt vägd loppplan');
});

test('alla år: sök direkt, behåll jämförelseval och återställ via Back', async ({ page }) => {
  await page.goto('/');
  const data = await loadData(page);
  const a = data.results.find((r) => r.edition_id === 'gax100-2023' && r.status === 'FINISHED' && r.observations.length >= 3);
  const b = data.results.find((r) => r.edition_id === 'gax100-2022' && r.status === 'FINISHED' && r.observations.length >= 3);
  expect(a && b).toBeTruthy();
  await page.locator('#year').selectOption('gax100-2023');
  await page.locator('#search-scope').selectOption('all');
  await page.locator('#search').fill(a.name);
  await expect(page.locator('#finder-preview [data-compare]').first()).toBeVisible();
  const aRow = page.locator('#finder-preview tr').filter({ hasText:'2023' }).first();
  await aRow.locator('[data-compare]').click();
  await expect(page.locator('#selection-bar')).toContainText('2023');
  await page.locator('#year').selectOption('gax100-2026');
  await expect(page.locator('#selection-bar')).toContainText('2023');
  await page.locator('#search').fill(b.name);
  const bRow = page.locator('#finder-preview tr').filter({ hasText:'2022' }).first();
  await bRow.locator('[data-compare]').click();
  await expect(page.locator('#comparison .compare-person')).toHaveCount(2);
  await expect(page.locator('#comparison')).toContainText('Olika års banor');
  await expect(page.locator('#comparison .compare-figure')).toHaveCount(0);
  await expect(page.locator('#selection-bar')).toContainText('2022');
  await page.goBack();
  await expect(page.locator('#selection-bar')).not.toContainText('2022');
  await expect(page.locator('#selection-bar')).toContainText('2023');
});
test('verifierad 2024-delsträcka: tid utan uppfunnet avstånd', async ({ page }) => {
  await page.goto('/');
  const data = await loadData(page);
  const result = data.results.find((r) => r.edition_id === 'gax100-2024' &&
    r.status === 'FINISHED' && r.observations?.length >= 3);
  expect(result).toBeTruthy();
  await page.locator('#year').selectOption('gax100-2024');
  await page.locator('#search').fill(result.name);
  await page.locator('#finder-preview [data-id]').first().click();
  await expect(page.locator('#runner .duration-chart')).toBeVisible();
  await expect(page.locator('#runner .segment-table').first()).toContainText('Start');
  await expect(page.locator('#runner .segment-table').first()).toContainText('Mål');
  await expect(page.locator('#runner')).toContainText('Fysisk fart kan inte beräknas');
  await page.locator('#runner .segment-select').first().click();
  await expect(page.locator('#runner .selected-segment')).toHaveCount(1);
});
test('tid mot placering öppnar vald individ med korrekt URL', async ({ page }) => {
  await page.goto('/');
  await page.locator('#year').selectOption('gax100-2024');
  await expect(page.locator('#scatter [data-chart-runner]').first()).toBeVisible();
  await page.locator('#scatter-runner-select').selectOption({ index: 1 });
  await expect(page.locator('#runner')).not.toHaveClass(/empty/);
  await expect(page).toHaveURL(/result=/);
});


test('fördjupad källstödd fältanalys 2023: kvartiler, kön och verklig spurt', async ({ page }) => {
  await page.setViewportSize({width: 1200, height:900});
  await page.goto('/');
  await page.locator('#year').selectOption('gax100-2023');
  await expect(page.locator('#field-insights')).toContainText('70 kompletta fullföljare');
  await expect(page.locator('#field-insights .field-segment-button')).toHaveCount(4);
  await expect(page.locator('#field-segment-detail')).toContainText('Q25–Q75');
  await expect(page.locator('#field-segment-detail')).toContainText('P10–P90');
  await page.locator('[data-field-segment="3"]').click();
  await expect(page.locator('#field-segment-detail')).toContainText('Mål');
  await expect(page.locator('#field-insights .sprint-groups')).toContainText('Kvinnor');
  await expect(page.locator('#field-insights .sprint-groups')).toContainText('Män');
  await expect(page.locator('#field-insights')).toContainText('19');
  await expect(page.locator('#field-insights')).toContainText('Senaste passage');
  await assertNoHorizontalOverflow(page);
});
test('källgating 2024/2025: tidsserie utan distans samt inga syntetiska passager', async ({ page }) => {
  await page.goto('/');
  await page.locator('#year').selectOption('gax100-2024');
  await expect(page.locator('#field-insights .field-segment-button')).toHaveCount(4);
  await expect(page.locator('#field-segment-detail')).toContainText('Fysisk delsträckedistans saknas');
  await expect(page.locator('#field-insights')).toContainText('Ingen verifierad observerad DNF-passage');
  await page.locator('#year').selectOption('gax100-2025');
  await expect(page.locator('#field-insights')).toContainText('Det finns inte fem fullständiga');
  await expect(page.locator('#field-insights .field-segment-button')).toHaveCount(0);
  await expect(page.locator('#field-insights')).toContainText('40');
});
test('måltid mot placering: medianstandard, scenariotid och verifierad gruppstorlek', async ({ page }) => {
  await page.goto('/');
  await page.locator('#year').selectOption('gax100-2025');
  await expect(page.locator('#target-placement')).toContainText('69');
  const initial = await page.locator('#target-time-input').inputValue();
  await page.locator('#target-time-input').fill('30:00:00');
  await page.locator('#target-run').click();
  await expect(page.locator('#target-time-input')).toHaveValue('30:00:00');
  await expect(page.locator('#target-placement')).toContainText('Retrospektiv jämförelse');
  await page.locator('#target-reset').click();
  await expect(page.locator('#target-time-input')).toHaveValue(initial);
  await page.locator('#target-time-input').fill('xx:00');
  await page.locator('#target-run').click();
  await expect(page.locator('#target-error')).toContainText('H:MM:SS');
});


test('sluttidsurval kvinnor och män är källaanknutna och kan användas som måltid', async ({ page }) => {
  await page.goto('/');
  await page.locator('#year').selectOption('gax100-2023');
  await expect(page.locator('#finish-group-selector [data-finish-group="female"]')).toBeEnabled();
  await expect(page.locator('#finish-group-selector [data-finish-group="male"]')).toBeEnabled();
  await expect(page.locator('#percentiles')).toContainText('Hela fältet, n=70');
  await page.locator('#finish-group-selector [data-finish-group="female"]').click();
  await expect(page.locator('#percentiles')).toContainText('Kvinnor, n=16');
  await expect(page.locator('#stats-note')).toContainText('16');
  await expect(page.locator('#histogram svg .bar.gender-female')).not.toHaveCount(0);
  await page.locator('#percentiles [data-use-percentile="0.5"]').click();
  await expect(page.locator('#target-time-input')).toBeVisible();
  const target = await page.locator('#target-time-input').inputValue();
  expect(target).toMatch(/^\d+:\d\d:\d\d$/);
  // A target-time estimate always describes the complete edition.
  await expect(page.locator('#target-placement')).toContainText('70');
  await page.locator('#finish-group-selector [data-finish-group="male"]').click();
  await expect(page.locator('#percentiles')).toContainText('Män, n=54');
  await expect(page.locator('#scatter')).toContainText('Ingen publicerad numerisk placering');
  await page.locator('#year').selectOption('gax100-2025');
  await expect(page.locator('#scatter svg')).toHaveAttribute('aria-label', /Sluttid på X-axeln/);
  await page.locator('#year').selectOption('gax100-2024');
  await expect(page.locator('#finish-group-selector [data-finish-group="female"]')).toBeDisabled();
  await expect(page.locator('#finish-group-selector [data-finish-group="all"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#percentiles')).toContainText('Hela fältet');
});


test('individuell tidslucka använder fast verifierad referenskohort och klickbar segmentmarkering', async ({ page }) => {
  await page.goto('/');
  const data = await loadData(page);
  const chosen = data.results.find((r)=>r.edition_id==='gax100-2023'&&r.status==='FINISHED'&&r.observations.length===3);
  expect(chosen).toBeTruthy();
  await page.locator('#year').selectOption('gax100-2023');
  await page.locator('#search').fill(chosen.name);
  await page.locator('#finder-preview [data-id]').first().click();
  await expect(page.locator('#runner .gap-chart')).toBeVisible();
  await expect(page.locator('#runner')).toContainText('Fast referensgrupp');
  await expect(page.locator('#runner .gap-dot')).toHaveCount(5);
  await page.locator('#runner .gap-dot[data-segment-index="2"]').click();
  await expect(page.locator('#runner .selected-segment')).toHaveCount(1);
  await page.locator('#year').selectOption('gax100-2025');
  await page.locator('#search').fill('');
  await page.locator('#rows [data-id]').first().click();
  await expect(page.locator('#runner')).toContainText('Tidslucka mot fältet visas inte');
  await expect(page.locator('#runner .gap-chart')).toHaveCount(0);
});
