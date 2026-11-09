const {test,expect}=require('@playwright/test');

for (const width of [360,390,768,1440]) {
  test('analysis navigation and live club typeahead '+width+'px',async({page})=>{
    await page.setViewportSize({width,height:850});
    await page.goto('/');
    const data=await page.evaluate(()=>fetch('data.json').then(x=>x.json()));
    const current=data.results.filter(r=>r.edition_id==='gax100-2023');
    const groups=new Map();
    for(const result of current) if(typeof result.club==='string' && result.club.trim())
      groups.set(result.club,(groups.get(result.club)||0)+1);
    const unique=current.find(r=>r.club && groups.get(r.club)===1 && r.club.length>4);
    expect(unique).toBeTruthy();
    await page.locator('#year').selectOption('gax100-2023');
    await expect(page.locator('.analysis-navigation a')).toHaveCount(8);
    const navLink=page.locator('.analysis-navigation a[href="#segment-lab"]');
    await navLink.click();
    await expect(page).toHaveURL(/#segment-lab$/);
    await page.locator('#club-autocomplete').fill(unique.club.slice(0,Math.min(6,unique.club.length)));
    await expect(page.locator('#finder-preview [data-id="'+unique.result_id+'"]')).toBeVisible();
    await expect(page.locator('#finder-preview [data-id]')).not.toHaveCount(0);
    expect(await page.locator('#finder-preview [data-id]').count()).toBeLessThanOrEqual(7);
    await expect(page.locator('#club-suggestions option').first()).toHaveAttribute('value',/\S/);
    await page.locator('#club').selectOption({label:unique.club});
    await expect(page.locator('#club-autocomplete')).toHaveValue('');
    await expect(page.locator('#result-count')).toContainText('1 träffar');
    await page.locator('#reset-result-filters').click();
    await expect(page.locator('#club')).toHaveValue('');
    await expect(page.locator('#club-autocomplete')).toHaveValue('');
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
  });
}
