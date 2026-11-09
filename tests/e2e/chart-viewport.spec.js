const {test,expect}=require('@playwright/test');

for(const width of [390,768,1440]) {
  test('readable SVG axes, scroll viewport and full-size chart dialog '+width+'px',async({page},testInfo)=>{
    await page.setViewportSize({width,height:900});
    await page.goto('/');
    const data=await page.evaluate(()=>fetch('data.json').then(r=>r.json()));
    const runner=data.results.find(r=>r.edition_id==='gax100-2023'&&r.status==='FINISHED'&&r.observations?.length===3);
    await page.locator('#year').selectOption('gax100-2023');
    await page.locator('#search').fill(runner.name);
    await page.locator('#finder-preview [data-id="'+runner.result_id+'"]').first().click();
    await expect(page.locator('#runner .chart-viewport')).toHaveCount(3);
    const viewport=page.locator('#runner .chart-viewport').first();
    await expect(viewport).toHaveAttribute('tabindex','0');
    const dimensions=await viewport.evaluate(el=>({content:el.scrollWidth,visible:el.clientWidth,svgWidth:el.querySelector('svg').getBoundingClientRect().width}));
    if(width<601) {
      expect(dimensions.content).toBeGreaterThan(dimensions.visible);
      expect(dimensions.svgWidth).toBeGreaterThanOrEqual(680);
      await viewport.focus();
      await page.keyboard.press('ArrowRight');
      await expect.poll(()=>viewport.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
    }
    const zoom=page.locator('#runner .chart-enlarge').first();
    await expect(zoom).toBeVisible();
    await zoom.click();
    await expect(page.locator('#chart-zoom-dialog')).toBeVisible();
    await expect(page.locator('#chart-zoom-content svg')).toHaveCount(1);
    const big=await page.locator('#chart-zoom-content svg').evaluate(el=>el.getBoundingClientRect().width);
    expect(big).toBeGreaterThanOrEqual(780);
    await page.screenshot({path:testInfo.outputPath('chart-zoom-'+width+'.png')});
    await page.keyboard.press('Escape');
    await expect(page.locator('#chart-zoom-dialog')).toBeHidden();
    await expect(zoom).toBeFocused();
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
  });
}
test('two-athlete comparison zoom includes verified line colors and style',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  const data=await page.evaluate(()=>fetch('data.json').then(r=>r.json()));
  const male=data.results.filter(r=>r.edition_id==='gax100-2023'&&r.status==='FINISHED'&&r.gender==='Herrar'&&r.observations.length===3);
  expect(male.length).toBeGreaterThanOrEqual(2);
  await page.locator('#year').selectOption('gax100-2023');
  for(const r of male.slice(0,2)) {
    await page.locator('#search').fill(r.name);
    await page.locator('#finder-preview [data-compare="'+r.result_id+'"]').first().click();
  }
  const modalButton=page.locator('#comparison .chart-enlarge');
  await expect(modalButton).toBeVisible();
  await modalButton.click();
  await expect(page.locator('#chart-zoom-content polyline')).toHaveCount(2);
  const lines=await page.locator('#chart-zoom-content polyline').evaluateAll(all=>all.map(el=>({stroke:el.getAttribute('stroke'),dash:el.getAttribute('stroke-dasharray')})));
  expect(lines).toEqual([{stroke:'#2563eb',dash:null},{stroke:'#2563eb',dash:'7 5'}]);
  await page.locator('#chart-zoom-close').click();
  await expect(page.locator('#chart-zoom-dialog')).toBeHidden();
});
