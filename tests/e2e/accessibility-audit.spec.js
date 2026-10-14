const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
async function audit(page,phase) {
  const report=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
  const blockers=report.violations.map(v=>({
    id:v.id,impact:v.impact,
    nodes:v.nodes.slice(0,6).map(n=>({target:n.target,summary:n.failureSummary}))
  }));
  expect(blockers,phase+'\n'+JSON.stringify(blockers,null,2)).toEqual([]);
}
for(const width of [390,1440]) {
  test('WCAG accessibility screen: search/results, runner, dual runner, chart modal '+width+'px',async({page})=>{
    await page.setViewportSize({width,height:900});
    await page.goto('/');
    await audit(page,'initial');
    const data=await page.evaluate(()=>fetch('data.json').then(r=>r.json()));
    const rows=data.results.filter(r=>r.edition_id==='gax100-2023'&&r.status==='FINISHED'&&r.observations.length===3);
    await page.locator('#year').selectOption('gax100-2023');
    await page.locator('#search').fill(rows[0].name);
    await audit(page,'search results');
    await page.locator('#finder-preview [data-id="'+rows[0].result_id+'"]').first().click();
    await audit(page,'individual analysis');
    for(const runner of rows.slice(0,2)){
      await page.locator('#search').fill(runner.name);
      await page.locator('#finder-preview [data-compare="'+runner.result_id+'"]').first().click();
    }
    await audit(page,'comparison');
    await page.locator('#runner .chart-enlarge').first().click();
    await audit(page,'chart modal');
    await page.keyboard.press('Escape');
  });
}
