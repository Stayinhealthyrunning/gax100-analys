const { test, expect } = require('@playwright/test');

async function loadData(page) {
  return page.evaluate(() => fetch('data.json').then((response) => response.json()));
}

async function assertNoHorizontalOverflow(page) {
  const violations = await page.evaluate(() => {
    const candidates = [document.documentElement, document.body, ...document.querySelectorAll('main, main > *, section, .hero, .fact, .runner, .stats-grid, .chart, .filters, .pagination')];
    return [...new Set(candidates)].map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        selector: element.id || element.className || element.tagName,
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        left: Math.round(rect.left * 10) / 10,
        right: Math.round(rect.right * 10) / 10
      };
    }).filter((item) => item.scrollWidth > item.clientWidth + 1 || item.left < -1 || item.right > window.innerWidth + 1);
  });
  expect(violations, JSON.stringify(violations)).toEqual([]);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflowX)).not.toBe('hidden');
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
  if (await page.locator('#plan-target').count()) {
    await page.locator('#plan-target').fill('24:00:00');
    await page.locator('#apply-plan-target').click();
    await expect(page.locator('#plan')).toContainText('Simulerad delsträcka');
  }

  await page.locator('#search').fill('');
  await page.locator('#rows [data-compare]').nth(0).click();
  await page.locator('#rows [data-compare]').nth(1).click();
  await expect(page.locator('#comparison')).toContainText('vs');
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

for (const viewport of [{ width: 768, height: 1024 }, { width: 390, height: 844 }]) {
  test(`responsiv layout ${viewport.width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.locator('.facts .fact')).toHaveCount(5);
    await expect(page.locator('#histogram')).toBeVisible();
    await expect(page.locator('#history')).toBeVisible();
    if (viewport.width === 390) {
      await expect(page.locator('.result-table tbody tr')).toHaveCount(12);
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
