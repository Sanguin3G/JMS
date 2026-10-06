import { test, expect, Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

async function login(page: Page, role: string, username: string) {
  await page.goto(`/${role}/sign-in`);
  await page.getByLabel('Tên đăng nhập', { exact: true }).fill(username);
  await page.getByLabel('Mật khẩu', { exact: true }).fill('JmsDemo!2026');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).not.toHaveURL(/sign-in/);
}
async function capture(page: Page, name: string) {
  if (!process.env['JMS_SCREENSHOTS']) return;
  const folder = resolve('../docs/screenshots');
  mkdirSync(folder, { recursive: true });
  await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); });
  await page.screenshot({ path: resolve(folder, `${name}.png`), fullPage: name !== 'recruiter-review' });
}

test('candidate searches, saves a job, applies with a CV and checks the application', async ({ page }) => {
  await login(page, 'candidate', 'an.le');
  await expect(page.getByRole('heading', { name: 'Việc làm đang tuyển' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Frontend Engineer/ }).first()).toBeVisible();
  await capture(page, 'candidate-discovery');
  await page.getByLabel('Từ khóa', { exact: true }).fill('Product Designer');
  await page.getByRole('button', { name: 'Tìm việc', exact: true }).click();
  await expect(page).toHaveURL(/query=Product/);
  await page.getByRole('link', { name: /Product Designer/ }).first().click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Product Designer');
  await page.getByRole('button', { name: 'Lưu việc làm', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Đã lưu việc làm', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await capture(page, 'job-details');
  await page.getByRole('button', { name: 'Ứng tuyển bằng CV' }).click();
  await page.getByRole('combobox', { name: 'CV ứng tuyển', exact: true }).selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Gửi ứng tuyển', exact: true }).click();
  await page.getByRole('link', { name: 'Xem ứng tuyển của bạn' }).click();
  await expect(page.getByRole('heading', { name: 'Ứng tuyển của bạn' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Product Designer/ })).toBeVisible();
  await page.goto('/candidate/saved-jobs');
  await expect(page.getByRole('link', { name: /Product Designer/ }).first()).toBeVisible();
});

test('candidate edits a CV and verifies the saved title after reload', async ({ page }) => {
  await login(page, 'candidate', 'an.le');
  await page.goto('/candidate/your-cvs');
  await expect(page.getByRole('heading', { name: 'Thư viện CV' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Chỉnh sửa', exact: true }).first()).toBeVisible();
  await capture(page, 'cv-library');
  await page.getByRole('link', { name: 'Chỉnh sửa', exact: true }).first().click();
  await page.getByLabel('Tên CV', { exact: true }).fill('Frontend portfolio — JMS');
  await page.getByRole('button', { name: 'Lưu CV', exact: true }).click();
  await expect(page.getByText('Đã lưu thay đổi.', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Tên CV', { exact: true })).toHaveValue('Frontend portfolio — JMS');
});

test('recruiter opens real job applicants and shortlists a candidate', async ({ page }) => {
  await login(page, 'recruiter', 'minh.northstar');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: /Frontend Engineer/ }).first()).toBeVisible();
  await capture(page, 'recruiter-dashboard');
  await page.goto('/recruiter/list-jds');
  await expect(page.getByRole('heading', { name: 'Tin tuyển dụng của bạn' })).toBeVisible();
  await page.getByRole('article').filter({ has: page.getByRole('heading', { name: 'Frontend Engineer — Angular', exact: true }) }).getByRole('link', { name: 'Xem hồ sơ', exact: false }).click();
  await page.getByRole('button', { name: 'Danh sách ứng viên', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Danh Sách Ứng Viên Phù Hợp' })).toBeVisible();
  await page.getByRole('button', { name: 'Yêu thích', exact: true }).first().click();
  await expect(page.getByRole('button', { name: 'Bỏ yêu thích', exact: true }).first()).toBeVisible();
  await capture(page, 'recruiter-review');
});

test('recruiter edits rich text and expiry, then verifies the saved job', async ({ page }) => {
  await login(page, 'recruiter', 'minh.northstar');
  await page.goto('/recruiter/jd-detail/1');
  await expect(page.getByLabel('Tiêu Đề Tuyển Dụng', { exact: true })).toHaveValue(/Frontend Engineer/);
  const editor = page.locator('#description .ck-editor__editable');
  await expect(editor).toBeVisible();
  await editor.fill('Frontend Engineer — Angular, TypeScript and accessible JMS interfaces.');
  await page.getByLabel('Ngày Hết Hạn', { exact: true }).fill('2027-01-31');
  await page.getByRole('button', { name: 'Chỉnh sửa', exact: true }).click();
  await expect(page).toHaveURL(/recruiter\/list-jds/);
  await page.goto('/recruiter/jd-detail/1');
  await expect(editor).toContainText('accessible JMS interfaces');
  await expect(page.getByLabel('Ngày Hết Hạn', { exact: true })).toHaveValue('2027-01-31');
});

test('admin sees real statistics, provider capabilities and confirms an account action', async ({ page }) => {
  await login(page, 'admin', 'demo.admin');
  await expect(page.getByRole('heading', { name: 'Tổng quan tuyển dụng' })).toBeVisible();
  await expect(page.getByText('Tài khoản hiện có').first()).toBeVisible();
  await capture(page, 'admin-dashboard');
  await page.goto('/admin/setting');
  await expect(page.getByRole('heading', { name: 'Cài đặt JMS' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Nhà cung cấp', exact: true }).selectOption('openai');
  await expect(page.getByRole('combobox', { name: 'Mô hình', exact: true })).toContainText('GPT');
  await page.getByRole('combobox', { name: 'Nhà cung cấp', exact: true }).selectOption('anthropic');
  await expect(page.getByRole('combobox', { name: 'Mô hình', exact: true })).toContainText('Haiku');
  await page.goto('/admin/candidate-page');
  await page.getByLabel('Tìm ứng viên', { exact: true }).fill('duc.pham');
  await page.getByRole('button', { name: 'Tìm kiếm', exact: true }).click();
  await expect(page.getByText('duc.pham', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Khóa', exact: true }).click();
  await page.getByRole('button', { name: 'Xác nhận', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Mở khóa', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Mở khóa', exact: true }).click();
  await page.getByRole('button', { name: 'Xác nhận', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Khóa', exact: true })).toBeVisible();
});
