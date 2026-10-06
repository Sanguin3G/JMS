import { test, expect, Page } from '@playwright/test';
import { resolve } from 'node:path';

async function login(page:Page,role:string,user:string){
 await page.goto(`/${role}/sign-in`);
 await page.getByLabel('Tên đăng nhập',{exact:true}).fill(user);
 await page.getByLabel('Mật khẩu',{exact:true}).fill('JmsDemo!2026');
 await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();
 await expect(page).not.toHaveURL(/sign-in/);
}
async function english(page:Page){
 await page.getByRole('button',{name:'Ngôn ngữ',exact:true}).click();
 await page.getByRole('menuitemradio',{name:/English/}).click();
 await expect(page.locator('html')).toHaveAttribute('lang','en');
}
async function noOverflow(page:Page){
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
}
async function capture(page:Page,name:string){
 if(process.env['JMS_SCREENSHOTS'])await page.screenshot({path:resolve('../docs/screenshots',name+'.png'),fullPage:true});
}

test('bilingual entertainment, local ending gallery and header help',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/candidate/calibration');await english(page);
 await expect(page.getByRole('heading',{name:'The Department of Tomorrow',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'JMS help',exact:true}).click();
 const help=page.getByRole('dialog');
 await help.getByLabel('Ask about JMS').fill('AI unavailable');
 await help.getByRole('button',{name:'Find an answer',exact:true}).click();
 await expect(help.getByText(/Deterministic scores and evaluation results still work/)).toBeVisible();
 await help.getByRole('button',{name:'Close help'}).click();
 await page.getByRole('button',{name:'Board the bus'}).click();
 for(let step=0;step<6;step++){
  await page.getByRole('button',{name:/^01 /}).click();
  await page.getByRole('button',{name:step===5?'Open the door':'Keep walking',exact:true}).click();
 }
 await expect(page.getByRole('heading',{name:'The Pencil Cartographer'})).toBeVisible();
 await page.getByRole('button',{name:'Save to the collection'}).click();
 await expect(page.getByRole('button',{name:'Saved on this device'})).toBeDisabled();
 await page.reload();await expect(page.getByText('The Pencil Cartographer',{exact:true})).toBeVisible();
 await capture(page,'calibration');
 await page.setViewportSize({width:390,height:844});await noOverflow(page);
 await page.getByRole('button',{name:'Language',exact:true}).click();
 await page.getByRole('menuitemradio',{name:/Tiếng Việt/}).click();
 await expect(page.getByRole('heading',{name:'Sở Ngày Mai',exact:true})).toBeVisible();
 expect(errors).toEqual([]);
});

test('candidate CV reader integrates navigation and preserves authored content in English',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await login(page,'candidate','an.le');await page.goto('/candidate/your-cvs');
 await page.getByRole('link',{name:'Xem',exact:true}).first().click();
 await expect(page.locator('jms-cv-document')).toBeVisible();
 await expect(page.locator('jms-cv-document')).toContainText('Angular');
 await english(page);
 await expect(page.getByRole('button',{name:'Print / save PDF'})).toBeVisible();
 await expect(page.locator('jms-cv-document')).toContainText('Angular');
 await capture(page,'cv-reader');
 await page.setViewportSize({width:390,height:844});await noOverflow(page);
 expect(errors).toEqual([]);
});

test('real Admin insights and shared Admin/recruiter document previews',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 expect((await page.request.get('http://localhost:8080/api/admin/insights')).status()).toBe(401);
 await login(page,'admin','demo.admin');
 await expect(page.getByRole('heading',{name:'Tổng quan tuyển dụng'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Nhịp tuyển dụng của JMS'})).toBeVisible();
 await expect(page.locator('.pulse-metrics')).toContainText('7');
 await capture(page,'admin-dashboard');
 await page.goto('/admin/statistics');await english(page);
 await expect(page.getByRole('heading',{name:'Recruitment activity'})).toBeVisible();
 await page.getByLabel('Date range').selectOption({label:'90 days'});await expect(page).toHaveURL(/days=90/);
 await expect(page.getByText('Northstar Labs',{exact:true})).toBeVisible();
 await capture(page,'admin-statistics');
 await page.getByRole('button',{name:/^JMS appearance:/}).click();
 await page.getByRole('menuitemradio',{name:/^Dark/}).click();
 await page.setViewportSize({width:390,height:844});await noOverflow(page);
 await page.getByRole('button',{name:'JMS help',exact:true}).click();
 await expect(page.getByRole('dialog').getByLabel('Ask about JMS')).toBeVisible();
 await noOverflow(page);await page.getByRole('button',{name:'Close help'}).click();
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('/admin/candidate-page');
 await page.getByRole('button',{name:'View CV',exact:true}).first().click();
 await expect(page.getByRole('dialog').locator('jms-cv-document')).toBeVisible();
 await page.getByRole('button',{name:'Close preview'}).click();
 await page.goto('/admin/view-jd/1');await expect(page.locator('jms-job-document')).toBeVisible();
 await page.setViewportSize({width:390,height:844});await noOverflow(page);
 await page.evaluate(()=>localStorage.clear());await page.setViewportSize({width:1440,height:1000});
 await login(page,'recruiter','minh.northstar');await page.goto('/recruiter/view-jd-detail/1');
 await expect(page.locator('jms-job-document')).toBeVisible();
 await page.getByRole('button',{name:'Danh sách ứng viên',exact:true}).click();
 await page.getByRole('button',{name:'Xem CV',exact:true}).first().click();
 await expect(page.getByRole('dialog').last().locator('jms-cv-document')).toContainText('Angular');
 await page.getByRole('button',{name:'Đóng bản xem trước'}).click();
 await page.getByRole('button',{name:'Đóng danh sách ứng viên'}).click();
 await page.goto('/recruiter/profile');
 await english(page);
 await expect(page.getByRole('heading',{name:'Your profile'})).toBeVisible();
 await expect(page.locator('a[href*="bootdey"]')).toHaveCount(0);
 await page.getByLabel('Show password',{exact:true}).first().click();
 await expect(page.locator('#old')).toHaveAttribute('type','text');
 await page.setViewportSize({width:390,height:844});await noOverflow(page);
 expect(errors).toEqual([]);
});
