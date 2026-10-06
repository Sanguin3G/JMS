import { test, expect, Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
async function login(page: Page, role: string, username: string) {
  await page.goto('/' + role + '/sign-in');
  await page.getByLabel('Tên đăng nhập', { exact: true }).fill(username);
  await page.getByLabel('Mật khẩu', { exact: true }).fill('JmsDemo!2026');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).not.toHaveURL(/sign-in/);
}
async function capture(page: Page, name: string) {
  if (!process.env['JMS_SCREENSHOTS']) return;
  const folder = resolve('../docs/screenshots'); mkdirSync(folder, { recursive: true });
  await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); });
  await page.screenshot({ path: resolve(folder, name + '.png'), fullPage: name !== 'recruiter-review' });
}
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
}
test('role navigation, account and theme menus work with keyboard and mobile layouts', async ({ browser }) => {
  test.setTimeout(180000);
  const failures: string[] = [];
  for (const [role, user] of [['candidate', 'an.le'], ['recruiter', 'minh.northstar'], ['admin', 'demo.admin']]) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: 'light' });
    const page = await context.newPage();
    page.on('pageerror', error => failures.push(error.message));
    await login(page, role, user);
    for (const width of [1280, 768, 390]) {
      await page.setViewportSize({ width, height: 900 });
      for (const [label, value] of [['Tối', 'dark'], ['Sáng', 'light'], ['Hệ thống', 'system']]) {
        const trigger = page.getByRole('button', { name: /^Giao diện JMS:/ });
        await trigger.click();
        const choice = page.getByRole('menuitemradio', { name: new RegExp('^' + label) });
        await expect(choice).toBeVisible();
        await choice.click();
        await page.keyboard.press('Escape');
        await expect(trigger).toBeFocused();
        await expect.poll(() => page.evaluate(() => localStorage.getItem('jms-theme-mode'))).toBe(value);
        await expect(page.locator('html')).toHaveAttribute('data-theme', value === 'system' ? 'light' : value);
        if (value === 'system') {
          await page.emulateMedia({ colorScheme: 'dark' });
          await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
          await page.emulateMedia({ colorScheme: 'light' });
          await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
        }
        await noOverflow(page);
      }
      const account = page.getByRole('button', { name: 'Menu tài khoản' });
      await account.click();
      await expect(page.getByRole('menuitem', { name: 'Thông tin cá nhân' })).toHaveAttribute('href', '/' + role + '/profile');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Escape');
      await expect(account).toBeFocused();
      if (role === 'admin') {
        if (width <= 800) await page.getByRole('button', { name: 'Không gian quản trị' }).click();
        const nav = page.getByRole('navigation', { name: 'Điều hướng quản trị' });
        await expect(nav.locator('[aria-current=page]')).toHaveCount(1);
        await noOverflow(page);
        if (width <= 800) await page.getByRole('button', { name: 'Không gian quản trị' }).click();
      }
      if (width < 1380 && role !== 'admin') {
        const toggle = page.getByRole('button', { name: 'Mở điều hướng' });
        await toggle.click(); await expect(toggle).toHaveAttribute('aria-expanded', 'true');
        const nav = page.getByRole('navigation', { name: role === 'candidate' ? 'Điều hướng ứng viên' : 'Điều hướng nhà tuyển dụng' });
        await expect(nav.locator('[aria-current=page]')).toHaveCount(1);
        await noOverflow(page);
        await nav.getByRole('link', { name: role === 'candidate' ? 'CV của bạn' : 'Tin tuyển dụng', exact: true }).click();
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await page.goBack();
      }
    }
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.getByRole('button', { name: /^Giao diện JMS:/ }).click();
    await page.getByRole('menuitemradio', { name: /^Sáng/ }).click();
    await page.keyboard.press('Escape');
    if (role === 'candidate') {
      await expect(page.getByRole('heading', { name: 'Việc làm đang tuyển' })).toBeVisible();
      await expect(page.getByRole('link', { name: /Backend Developer/ }).first()).toBeVisible();
      await capture(page, 'candidate-discovery');
      await page.goto('/candidate/jd-detail/2');
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Product Designer');
      await capture(page, 'job-details');
      await page.goto('/candidate/your-cvs');
      await expect(page.getByRole('heading', { name: 'Thư viện CV' })).toBeVisible();
      await page.getByRole('link', { name: 'Chỉnh sửa', exact: true }).first().click();
      await expect(page.locator('.modelBackground button[aria-pressed=true]')).toHaveCount(1);
      await noOverflow(page);
    } else if (role === 'recruiter') {
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await capture(page, 'recruiter-dashboard');
      await page.goto('/recruiter/view-jd-detail/1');
      await page.getByRole('button', { name: 'Danh sách ứng viên', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Danh Sách Ứng Viên Phù Hợp' })).toBeVisible();
      await capture(page, 'recruiter-review');
    } else {
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await capture(page, 'admin-dashboard');
      await page.goto('/admin/setting');
      await page.getByRole('button', { name: /^Danh mục tuyển dụng/ }).click();
      await expect(page.getByRole('heading', { name: 'Danh mục dùng cho CV và công việc' })).toBeVisible();
      await page.setViewportSize({ width: 390, height: 900 });
      await noOverflow(page);
    }
    await context.close();
  }
  const publicPage = await browser.newPage({ viewport: { width: 390, height: 900 } });
  for (const route of ['/candidate', '/recruiter']) {
    await publicPage.goto(route); await expect(publicPage.getByRole('heading', { level: 1 })).toBeVisible(); await noOverflow(publicPage);
  }
  await publicPage.close(); expect(failures).toEqual([]);
});
