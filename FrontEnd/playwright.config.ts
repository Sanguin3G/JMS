import { defineConfig, devices } from '@playwright/test';
import { mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
const data = resolve('.test-data');
// The config is also evaluated in each worker; reset once before servers start.
if (!process.env['JMS_REUSE_SERVERS'] && !process.env['JMS_DATA_INITIALIZED']) {
  rmSync(data, { recursive: true, force: true });
  mkdirSync(data, { recursive: true });
  process.env['JMS_DATA_INITIALIZED'] = 'true';
}
export default defineConfig({
  testDir: './e2e', fullyParallel: false, workers: 1,
  timeout: 60000, expect: { timeout: 10000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://localhost:4200', screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  projects: [{ name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } }],
  webServer: [
    {
      command: 'dotnet run --project ../BackEnd/BackEndApplication/APIServer/APIServer.csproj --no-launch-profile --urls http://localhost:8080',
      url: 'http://localhost:8080/health/ready', timeout: 120000,
      reuseExistingServer: !!process.env['JMS_REUSE_SERVERS'],
      env: {
        ASPNETCORE_ENVIRONMENT: 'Development', JMS_PUBLIC_URL: 'http://localhost:8080',
        ConnectionStrings__JobConstr: `Data Source=${resolve(data, 'jms.db')}`,
        DataProtection__KeyPath: resolve(data, 'keys'), Storage__UploadRoot: resolve(data, 'uploads'),
        Cors__AllowedOrigins__0: 'http://localhost:4200', Database__SeedDemo: 'true',
      },
    },
    { command: 'node scripts/serve-preview.mjs', url: 'http://localhost:4200', timeout: 30000, reuseExistingServer: !!process.env['JMS_REUSE_SERVERS'] },
  ],
});
