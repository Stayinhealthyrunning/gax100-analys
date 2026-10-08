const { test, expect } = require('@playwright/test');

async function loadData(page) {
  return page.evaluate(() => fetch('data.json').then((response) => response.json()));
}

async function assertNoHorizontalOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBeTruthy();
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
    await assertNoHorizontalOverflow(page);
    await page.screenshot({ path: testInfo.outputPath(`responsive-${viewport.width}.png`), fullPage: true });
  });
}
