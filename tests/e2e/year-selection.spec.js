const {test,expect}=require('@playwright/test');
test('selected runners persist when changing editions in default year mode',async({page})=>{
  await page.goto('/');
  const all=await page.evaluate(()=>fetch('data.json').then(r=>r.json()));
  const a=all.results.filter(x=>x.edition_id==='gax100-2023' && x.status==='FINISHED'&&x.observations.length===3);
  const b=all.results.find(x=>x.edition_id==='gax100-2024' && x.status==='FINISHED');
  expect(a.length).toBeGreaterThan(1);
  await page.locator('#year').selectOption('gax100-2023');
  for(const runner of a.slice(0,2)){
    await page.locator('#search').fill(runner.name);
    await page.locator('#finder-preview [data-compare="'+runner.result_id+'"]').first().click();
  }
  await expect(page.locator('#comparison .compare-person')).toHaveCount(2);
  await page.locator('#year').selectOption('gax100-2024');
  await expect(page.locator('#search')).toHaveValue('');
  await expect(page.locator('#comparison .compare-person')).toHaveCount(2);
  await expect(page.locator('#selection-bar')).toContainText('2023');
  await page.locator('#selection-bar [data-remove-compare]').last().click();
  await expect(page.locator('#comparison')).toContainText('1/2');
  await page.locator('#search').fill(b.name);
  await page.locator('#finder-preview [data-compare="'+b.result_id+'"]').first().click();
  await expect(page.locator('#comparison .compare-person')).toHaveCount(2);
  await expect(page.locator('#comparison')).toContainText('Olika års banor');
  await expect(page.locator('#comparison .compare-figure')).toHaveCount(0);
  await page.goBack();
  await expect(page.locator('#comparison')).toContainText('1/2');
});
