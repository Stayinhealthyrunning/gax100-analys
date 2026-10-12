const {test, expect}=require('@playwright/test');

/**
 * Component-by-component visual evidence of ACTIVE GAX states.
 * Unlike initial responsive screenshots, these frames exercise runner search,
 * selection, comparison, historical split analysis, chart filters and dropdowns.
 * Results must be visually reviewed against Loppanalys Standard 1.0 separately:
 * browser PASS proves interactions/overflow, not design parity.
 */
for (const width of [390,1440]) {
  test('visual-parity active views at '+width+'px', async ({page},testInfo) => {
    await page.setViewportSize({width,height:900});
    await page.goto('/');
    const data=await page.evaluate(()=>fetch('data.json').then(r=>r.json()));
    const edition='gax100-2023';
    const eligible=data.results.filter(r=>r.edition_id===edition&&r.status==='FINISHED'&&r.observations?.length===3);
    expect(eligible.length).toBeGreaterThanOrEqual(5);
    const [first,second]=eligible;
    await page.locator('#year').selectOption(edition);
    await expect(page.locator('#results-page-count')).toContainText('av 90 träffar');
    await page.locator('#search').fill(first.name);
    const find=page.locator('#finder-preview [data-id="'+first.result_id+'"]');
    await expect(find).toBeVisible();
    await page.locator('#runner-finder').screenshot({path:testInfo.outputPath('01-search-'+width+'.png')});
    await find.click();
    await expect(page.locator('#runner')).toContainText(first.name);
    await expect(page.locator('#runner .duration-chart')).toBeVisible();
    await expect(page.locator('#runner .gap-chart')).toBeVisible();
    await page.locator('#runner-analysis').screenshot({path:testInfo.outputPath('02-runner-'+width+'.png')});
    // Exactly two real observations in the same edition: no GPS or invented gaps.
    await page.locator('#search').fill(first.name);
    await page.locator('#finder-preview [data-compare="'+first.result_id+'"]').first().click();
    await page.locator('#search').fill(second.name);
    await page.locator('#finder-preview [data-compare="'+second.result_id+'"]').first().click();
    await expect(page.locator('#comparison .compare-person')).toHaveCount(2);
    await expect(page.locator('#comparison .compare-figure')).toHaveCount(1);
    await page.locator('#direct-comparison').screenshot({path:testInfo.outputPath('03-comparison-'+width+'.png')});
    await page.locator('#swap-comparison').click();
    await expect(page.locator('#comparison .compare-person').first()).toContainText(second.name);
    await page.locator('#direct-comparison').screenshot({path:testInfo.outputPath('04-swapped-'+width+'.png')});
    // Historical plan includes Start and finish; user can change target.
    await expect(page.locator('#plan .segment-table tbody tr')).toHaveCount(4);
    await page.locator('#plan-target').fill('24:00:00');
    await page.locator('#apply-plan-target').click();
    await expect(page.locator('#plan .segment-table tbody tr').last().locator('td').nth(5)).toHaveText('24:00:00');
    await page.locator('#personal-plan').screenshot({path:testInfo.outputPath('05-plan-'+width+'.png')});
    await page.locator('#finish-group-selector [data-finish-group="female"]').click();
    await expect(page.locator('#percentiles')).toContainText('Kvinnor, n=16');
    await page.locator('#field-overview').screenshot({path:testInfo.outputPath('06-field-'+width+'.png')});
    await page.locator('#lab-from').selectOption('1');
    await page.locator('#lab-to').selectOption('2');
    await page.locator('#lab-group').selectOption('male');
    await expect(page.locator('#segment-lab-content')).toContainText('36 km');
    await expect(page.locator('#segment-lab-content')).toContainText('n=54');
    await page.locator('#segment-lab').screenshot({path:testInfo.outputPath('07-segment-lab-'+width+'.png')});
    await page.locator('#year').selectOption('gax100-2025');
    await expect(page.locator('#segment-lab-content')).toContainText('Delsträckelabbet är därför avstängt');
    await page.locator('#segment-lab').screenshot({path:testInfo.outputPath('08-no-source-'+width+'.png')});
    await page.locator('#year').selectOption('gax100-2023');
    await page.locator('#search').fill('');
    await page.locator('#page-size').selectOption('50');
    await expect(page.locator('#rows tr')).toHaveCount(50);
    await page.locator('#results-database').screenshot({path:testInfo.outputPath('09-database-'+width+'.png')});
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
  });
}
