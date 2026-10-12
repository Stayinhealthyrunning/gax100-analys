const {test,expect}=require('@playwright/test');

// Full edition×breakpoint coverage, not just the newest 2026 or well-populated 2023.
// Tests source-aware empties and real runner selection without synthesizing data.
for(const width of [360,768,1440]) {
  test('all 14 historical editions: selectors, profiles and source gating at '+width+'px',async({page})=>{
    await page.setViewportSize({width,height:900});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto('/');
    const data=await page.evaluate(()=>fetch('data.json').then(r=>r.json()));
    expect(data.editions).toHaveLength(14);
    for(const edition of data.editions) {
      await page.locator('#year').selectOption(edition.edition_id);
      await expect(page.locator('#facts .fact')).toHaveCount(5);
      await expect(page.locator('#history tr')).toHaveCount(14);
      await expect(page.locator('#field-insights .field-module')).toHaveCount(4);
      const stats=page.locator('#finish-group-selector');
      await expect(stats.locator('[data-finish-group="all"]')).toHaveAttribute('aria-pressed','true');
      const sourceRows=data.results.filter(r=>r.edition_id===edition.edition_id);
      expect(sourceRows.length).toBeGreaterThan(0);
      await expect(page.locator('#results-page-count')).toContainText('av '+sourceRows.length+' träffar');
      // Inspect an actual (source-backed) profile in every edition; 2025 and
      // 2026 are allowed to have no splits, unlike older full-series years.
      await page.locator('#rows [data-id]').first().click();
      await expect(page.locator('#runner')).not.toHaveClass(/empty/);
      await expect(page.locator('#runner')).toContainText('Publicerade passager');
      const first=sourceRows[0];
      if(first && !sourceRows.some(r=>r.observations?.length>0)) {
        await expect(page.locator('#runner .gap-chart')).toHaveCount(0);
        await expect(page.locator('#runner .duration-chart')).toHaveCount(0);
      }
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    }
    expect(errors).toEqual([]);
  });
}


test('latest edition advertises only source-supported analytics and safely guides to splits',async({page},testInfo)=>{
  for (const width of [360,390,768,1440]) {
    await page.setViewportSize({width,height:900});
    await page.goto('/');
    await expect(page.locator('#year')).toHaveValue('gax100-2026');
    await expect(page.locator('#edition-capability-content .capability-item')).toHaveCount(4);
    await expect(page.locator('#edition-capability-content')).toContainText('otillräckligt underlag');
    await expect(page.locator('#edition-capability-content .capability-item.unavailable')).toHaveCount(2);
    await expect(page.locator('#edition-capability-content .capability-item.unavailable a')).toHaveCount(0);
    await expect(page.locator('#edition-capability-content .capability-item.unavailable').first()).toHaveAttribute('aria-disabled','true');
    await page.locator('#edition-capabilities').screenshot({path:testInfo.outputPath('source-coverage-empty-'+width+'.png')});
    await page.locator('#find-split-year').click();
    await expect(page.locator('#year')).toHaveValue('gax100-2024');
    await expect(page.locator('#segment-lab .field-segment-button')).toHaveCount(0); // the lab uses option controls
    await expect(page.locator('#lab-from')).toBeVisible();
    await expect(page.locator('#edition-capability-content')).toContainText('53 kompletta profiler');
    await expect(page.locator('#edition-capability-content .capability-item.available')).toHaveCount(3);
    await page.locator('#edition-capabilities').screenshot({path:testInfo.outputPath('source-coverage-2024-'+width+'.png')});
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
  }
});
