const {test,expect}=require('@playwright/test');

// The original layout QA saved idle 2026 pages. These snapshots instead
// select a real 2023 finisher and activate the high-value comparisons.
for(const width of [360,768,900,1024,1200,1536]) {
  test('active-analysis responsive matrix '+width+'px',async({page},testInfo)=>{
    await page.setViewportSize({width,height:900});
    await page.goto('/');
    const d=await page.evaluate(()=>fetch('data.json').then(r=>r.json()));
    const athletes=d.results.filter(r=>r.edition_id==='gax100-2023'&&r.status==='FINISHED'&&r.observations.length===3);
    expect(athletes.length).toBeGreaterThan(2);
    const [first,second]=athletes;
    await page.locator('#year').selectOption('gax100-2023');
    await page.locator('#search').fill(first.name);
    await page.locator('#finder-preview [data-id="'+first.result_id+'"]').first().click();
    await expect(page.locator('#runner .duration-chart')).toBeVisible();
    await expect(page.locator('#runner .chart-viewport')).toHaveCount(3);
    await page.locator('#runner-analysis').screenshot({path:testInfo.outputPath('runner-'+width+'.png')});
    for(const row of [first,second]) {
      await page.locator('#search').fill(row.name);
      await page.locator('#finder-preview [data-compare="'+row.result_id+'"]').first().click();
    }
    await expect(page.locator('#comparison .compare-person')).toHaveCount(2);
    await page.locator('#direct-comparison').screenshot({path:testInfo.outputPath('comparison-'+width+'.png')});
    await page.locator('#plan-target').fill('26:00:00');
    await page.locator('#apply-plan-target').click();
    await expect(page.locator('#plan .mobile-card-table tbody tr').last().locator('td').nth(5)).toHaveText('26:00:00');
    await page.locator('#personal-plan').screenshot({path:testInfo.outputPath('plan-'+width+'.png')});
    const stats=page.locator('#finish-group-selector [data-finish-group="female"]');
    await stats.click();
    await expect(page.locator('#percentiles')).toContainText('Kvinnor, n=16');
    const s=await page.evaluate(()=>({viewport:window.innerWidth,body:document.documentElement.scrollWidth}));
    expect(s.body).toBeLessThanOrEqual(s.viewport+1);
    // Every enlarged chart must fit within a *contained* dialog, not spill
    // past the viewport or obscure the close control.
    await page.locator('#runner .chart-enlarge').first().click();
    await expect(page.locator('#chart-zoom-close')).toBeVisible();
    await page.locator('#chart-zoom-close').click();
    await expect(page.locator('#chart-zoom-dialog')).toBeHidden();
  });
}
