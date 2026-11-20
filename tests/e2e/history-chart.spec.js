const {test,expect}=require('@playwright/test');
for(const width of [360,390,1440]) {
 test('history participant volume chart selects verified edition '+width+'px',async({page})=>{
   await page.setViewportSize({width,height:850});
   await page.goto('/');
   await expect(page.locator('#history-vis .history-edition')).toHaveCount(14);
   await expect(page.locator('#history tr')).toHaveCount(14);
   await expect(page.locator('#history-vis .history-finished')).toHaveCount(14);
   await expect(page.locator('#history-vis .history-dnf')).toHaveCount(14);
   const target=page.locator('#history-vis .history-edition[data-history-edition="gax100-2023"]');
   await target.focus();
   await page.keyboard.press('Enter');
   await expect(page.locator('#year')).toHaveValue('gax100-2023');
   await expect(page.locator('#history-vis .history-edition.selected')).toHaveCount(1);
   await expect(page).toHaveURL(/edition=gax100-2023/);
   await expect(page.locator('#history-vis .chart-viewport')).toHaveCount(1);
   await page.locator('#history-vis .chart-enlarge').click();
   await expect(page.locator('#chart-zoom-content svg')).toHaveCount(1);
   await page.keyboard.press('Escape');
   await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
 });
}
