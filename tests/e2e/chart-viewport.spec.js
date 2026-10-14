const {test,expect}=require('@playwright/test');

for(const width of [360,390,768,1440]) {
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
    const chart=page.locator('#chart-zoom-content svg');
    const big=await chart.evaluate(el=>el.getBoundingClientRect().width);
    if(width<601) {
      await expect(chart).toHaveClass(/compact-speed-chart/);
      const audit=await page.locator('#chart-zoom-content').evaluate(el=>({
        scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,overflow:getComputedStyle(el).overflowX,
        axes:el.querySelectorAll('text.speed-label').length,
        reference:!!el.querySelector('.speed-reference'),
        barFill:getComputedStyle(el.querySelector('.speed-bar')).fill,
        legend:el.querySelectorAll('.compact-speed-legend li').length,
        bars:[...el.querySelectorAll('.speed-bar')].every(bar=>{
          const a=bar.getBoundingClientRect(),b=el.getBoundingClientRect();
          return a.left>=b.left-1&&a.right<=b.right+1;
        })
      }));
      expect(audit.scrollWidth).toBeLessThanOrEqual(audit.clientWidth+1);
      expect(audit.overflow).not.toBe('hidden');
      expect(audit.axes).toBeGreaterThanOrEqual(6);
      expect(audit.reference).toBe(true);
      expect(audit.barFill).not.toBe('rgb(0, 0, 0)');
      expect(audit.legend).toBeGreaterThanOrEqual(1);
      expect(audit.bars).toBe(true);
      expect(big).toBeLessThanOrEqual(audit.clientWidth);
    } else {
      expect(big).toBeGreaterThanOrEqual(780);
    }
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

test('fact cards never divide GDPR-filtered counts by source starters',async({page})=>{
  await page.goto('/');
  const data=await page.evaluate(()=>fetch('data.json').then(r=>r.json()));
  const edition=data.editions.find(e=>e.edition_id==='gax100-2023');
  const published=data.results.filter(r=>r.edition_id===edition.edition_id);
  const protectedFinished={...published.find(r=>r.status==='FINISHED'),result_id:'synthetic-protected-finished',name:'Protected, Finished'};
  const protectedDnf={...published.find(r=>r.status==='DNF'),result_id:'synthetic-protected-dnf',name:'Protected, Dnf'};
  expect(protectedFinished).toBeTruthy();
  expect(protectedDnf).toBeTruthy();
  const raw=[...published,protectedFinished,protectedDnf];
  const safe=raw.filter(r=>!r.result_id.startsWith('synthetic-protected-'));
  const fixture={...data,editions:[{...edition,starters:raw.length,starters_note:'Syntetisk källtotal'}],results:safe};
  await page.route('**/data.json',route=>route.fulfill({json:fixture}));
  await page.reload();
  const cards=page.locator('#facts .fact');
  await expect(cards.nth(0)).toContainText('STARTANDE · KÄLLTOTAL');
  await expect(cards.nth(0)).toContainText(String(raw.length));
  await expect(cards.nth(1)).toContainText('FULLFÖLJDE · PUBLICERAT URVAL');
  await expect(cards.nth(1).locator('strong')).toHaveText(String(safe.filter(r=>r.status==='FINISHED'&&r.finish_seconds>0).length));
  await expect(cards.nth(2)).toContainText('DNF · PUBLICERAT URVAL');
  await expect(cards.nth(2).locator('strong')).toHaveText(String(safe.filter(r=>r.status==='DNF').length));
  await expect(cards.nth(1)).not.toContainText(/% av/);
  await expect(cards.nth(2)).not.toContainText(/% av/);
  await expect(page.locator('body')).not.toContainText('Protected, Finished');
  await expect(page.locator('body')).not.toContainText('Protected, Dnf');
  await page.goto('/?edition=gax100-2023&result=synthetic-protected-finished');
  await expect(page.locator('body')).not.toContainText('Protected, Finished');
});
