# Development

## Start and configuration

Use .NET SDK 10.0.301+ and Node.js 24. From the repository root:

```powershell
$env:ASPNETCORE_ENVIRONMENT = 'Development'
dotnet run --project BackEnd/BackEndApplication/APIServer --no-launch-profile --urls http://localhost:8080
```

In `FrontEnd`, run `npm ci` then `npm start`. The development frontend uses port 4200 and API origin `http://localhost:8080`. CORS defaults to that exact frontend origin in Development. A random development signing key invalidates sessions after an API restart unless `Jwt__Key` is supplied.

The frontend loads `/config.js` before Angular. A host may replace it with `window.JMS_CONFIG = { apiUrl: 'https://api.example.test' };`. Production defaults to same-origin requests. The local production preview (`node scripts/serve-preview.mjs`) sets a separate API origin from `JMS_API_URL`, defaulting to port 8080. API image URLs use `JMS_PUBLIC_URL`. No source editing is required.

## Data and demo

Development applies pending SQLite migrations and seeds fictional users/jobs/CVs only when the database has no users. Override `ConnectionStrings__JobConstr`, `DataProtection__KeyPath` and `Storage__UploadRoot` for isolation. Production never seeds demo users, even when `Database__SeedDemo=true`.

Demo credentials are in the README. Fresh demo jobs use relative dates; an existing demo ages normally. To reset an expendable local database, stop the API and remove only its explicitly identified local database before restarting. Never use that procedure for a database containing work you need.

The seed contains eight jobs (seven open, one expired), varied locations and salaries, two fictional companies and two CV/application snapshots. Existing databases are not overwritten when seed content changes; use a fresh isolated database to see the expanded demo.

Workplace photos are downloaded and served locally in frontend demo assets and backend public defaults. Sources: [teamwork photo by Annie Spratt](https://images.unsplash.com/photo-1522071820081-009f0129c71c) and [office photo](https://images.unsplash.com/photo-1497366754035-f200968a6e72), via [Unsplash](https://unsplash.com/license). Photos illustrate fictional workplaces and do not identify the seeded companies or people. SVG company marks and neutral avatars are application-owned demo assets.

For migrations, install the .NET 10 EF tool and run:

```powershell
dotnet ef database update --project BackEnd/BackEndApplication/APIServer
```

Use the same configured environment and database path as the API. Back up before an existing-database upgrade. Preserve Data Protection keys with the database so encrypted AI keys remain readable.

`20261006210000_AddBilingualHelp` adds nullable English FAQ fields without
replacing existing questions. A fresh demo includes bilingual workflow guides.
Existing installations retain their own help content: add English versions in
Admin → JMS settings → Help content, or accept the visibly marked Vietnamese
fallback. Changing language never translates CVs, jobs or managed catalog text.

The header language menu persists EN/VI; the adjacent help button works without
scrolling to the page footer. Calibration is public at `/candidate/calibration`.
Its six scenes and ending collection work without a login or provider key. Saves
are local to the browser/device, and clearing browser storage removes them.
Artwork sources and reuse licenses are in the asset directory's `CREDITS.md`.

## AI

Use Admin → Cài đặt JMS to add a profile, select backend-provided model/reasoning choices, supply a key, test access and activate it for matching. No key is required for development or tests. Server environment fallbacks support `Ai__Provider` and `Ai__Gemini|OpenAI|Anthropic__ApiKey`, `__Model`, `__ReasoningLevel`; use nested .NET setting names, for example `Ai__OpenAI__ApiKey`. Keys must never be committed or supplied to frontend config.

See [AI choices](ai.md) for the curated economical/stronger tiers and official
model references. Existing profiles are retained; changing the default model
does not alter historical matching metadata.

## Checks

```powershell
dotnet test BackEnd/BackEndApplication/APIServer.Tests/APIServer.Tests.csproj
cd FrontEnd
npm run build -- --configuration prod
npm test
npx playwright install msedge
npx playwright test
```

Vitest is the single unit-test runner. Playwright runs one Edge project and starts the API plus production-build preview with isolated `.test-data` storage. It resets that expendable test directory once per run, so do not place user work there. Screenshots/traces on failure live in ignored test artifacts. Set `$env:JMS_SCREENSHOTS='1'` before Playwright to capture README images; unset it afterward.

For Docker use `docker compose up --build` after supplying `JMS_JWT_KEY`. See [deployment](deployment.md) for persistent volumes and Production smoke testing. CI verifies builds/tests and Docker targets without deploying.

## Troubleshooting and known constraints

If a token expires or the development API restarts, sign in again. If an old AI key cannot be decrypted, restore its matching key ring and original Data Protection application discriminator. For SPA refresh failures, configure index.html fallback. A mismatched CORS origin or API config causes browser request failures.

CKEditor's retained rich-text dependency emits CommonJS optimization notices for `fuzzysort`/`extend`. Historical backend DTO nullable annotations still produce compiler warnings. AutoMapper 12 is retained for compatibility; recursive mappings have explicit depth limits as the advisory recommends, but the package advisory remains until a license-aware upgrade or mapper replacement is agreed. The native SQLite bundle is patched.

CKEditor uses the self-hosted `GPL` option for the local open-source demo. Before distribution/hosting, confirm GPL compliance or supply a commercial `ckeditorLicenseKey` in `window.JMS_CONFIG`. This does not assign a new license to JMS. See [CKEditor's licensing requirements](https://ckeditor.com/docs/ckeditor5/latest/getting-started/licensing/license-key-and-activation.html).
