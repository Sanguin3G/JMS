# JMS working instructions

## Mission and scope

Remaster `Sanguin3G/JMS` into the polished, modest recruitment application the
original graduation team could plausibly have delivered with more time. Preserve
JMS's identity, Vietnamese-first interface, Candidate/Recruiter/Admin roles,
companies, jobs, CV creation and themes, applications, matching, and recruiter
review. Finish workflows, improve usability, and remove rushed/template content.

The JMS 2024 Remaster request explicitly authorizes UI refinement, workflow
completion, frontend convergence, dependency simplification, provider-neutral AI,
targeted tests, CI, documentation, and deployment preparation. Do not interpret a
rule against speculative modernization as prohibiting these requested changes.
Do not turn JMS into an enterprise ATS, HR platform, or unrelated rewrite.

Read this file first. Inspect repository evidence before editing; code and verified
behavior take precedence over assumptions and stale documentation. New explicit
user instructions take precedence over this file. State missing evidence honestly.

## Git and collaboration

- Protect unrelated user changes. Never reset, overwrite, or broadly stage them.
- Inspect branch, HEAD, working tree, remotes, and the intended base before work.
- For the remaster, use `rewrite/jms-2024-remaster`, based on `master`. Inspect an
  existing branch before using it; never reset it. Do not implement on `master`.
- Use coherent semantic local commits; record starting and ending commits.
- Do not push, merge, or deploy without a separate explicit user instruction.
- Continue authorized work without approval at every phase. Ask only for a real
  blocker or an irreversible/major product decision that cannot be inferred.
- Subagents are optional. Use bounded tasks only when useful; the main agent owns
  integration, architecture, testing, and commits. Do not force parallel work.

Communicate directly and concisely. Challenge unsupported assumptions with concrete
alternatives; avoid flattery, invented results, and giant audit documents.

## Technical boundaries

- Keep ASP.NET Core/.NET 10, EF Core, SQLite, JWT, Data Protection, and the existing
  controller/service/repository structure where it works.
- Keep Angular; do not upgrade merely because a newer version exists. Prefer
  HttpClient, services, typed reactive forms, signals, Router, and purposeful RxJS.
- Converge on one HTTP layer, one auth/session layer with role-aware guarding,
  one notification pattern, one confirmation pattern, and reusable pagination.
  Remove replaced implementations once all consumers migrate.
- Prefer Bootstrap layout/utilities, Bootstrap Icons, JMS-owned controls/design
  tokens, and selective CDK. Preserve the existing ThemeService and finish
  System/Light/Dark coverage. Avoid overlapping visual frameworks.
- Keep CKEditor for genuine rich text. Retain other dependencies only with a
  demonstrated purpose; migrate consumers before removing packages.
- Share CV presentation from a neutral shared/domain location. Avoid importing
  Candidate screens into Recruiter features.
- Preserve compatible historical `Recuirter` schema/API names. Use correct naming
  in new code where safe; do not perform a cosmetic schema-wide rename.
- Do not add NgRx, SSR, microservices, queues, Redis, Kubernetes, CQRS frameworks,
  billing, employer tenancy, scheduling suites, or autonomous hiring features.

## Product and safety

Use real JMS data for dashboards; delete ecommerce/Knight/template residue.
Make loading, empty, error, submitting, validation, confirmation, and responsive
states coherent. Use accessible labels, focus behavior, meaningful icon names,
Angular navigation, and stable/local demo assets. Prefer API search/pagination
for real datasets and URL state where navigation benefits.

Navigation must have clear groups, recognizable icons, active destinations and
distinct primary actions. Use accessible CDK menus for theme/account dropdowns;
retain System/Light/Dark through ThemeService. Preserve JMS blue/purple character,
visual depth and restrained feedback. Respect reduced-motion preferences. Credit
downloaded images and keep fictional demo content clearly identified.

Deterministic matching remains authoritative. AI gives bounded explanation and
evidence, never automatic hiring/rejection. Target Gemini, OpenAI, and Anthropic
through small provider adapters and backend capability metadata. Keep provider
model/reasoning controls accurate, requests bounded, inputs untrusted, and failure
fallback safe. Preserve historical evaluation metadata. Keep encrypted API keys
server-side; never return stored keys or log secrets/sensitive CV content.

Verify authorization and ownership in touched flows. Validate uploads for size,
type, filenames, and traversal. Never commit real credentials, key rings,
databases, uploads, or test artifacts. Demo accounts are local fictional data.

## Deployment preparation, not deployment

Make API origin, CORS allow-list, JWT settings, listening port, SQLite path,
Data Protection key directory, and upload root externally configurable. Support
separate frontend/backend origins and document SPA route fallback. Keep production
errors safe, development tooling appropriately gated, and logs usable via stdout.

SQLite, encrypted AI profile data, and uploads must survive container recreation
through persistent storage. Verify clean migration and existing-database upgrade;
never use destructive recreation for production startup. Development/demo seeding
must not run unexpectedly in Production. Keep simple liveness/readiness checks.

Use Docker/Compose for local and production-like validation. Do not provision
cloud resources, publish containers, configure external production secrets/DNS,
or add provider-specific CD. No hosting provider is required by the application.

## Verification and completion

Run supported baseline checks before major edits. Current entry points:

```powershell
dotnet build BackEnd/BackEndApplication/BackEndApplication.sln
dotnet test BackEnd/BackEndApplication/APIServer.Tests/APIServer.Tests.csproj
cd FrontEnd
npm ci
npm run build -- --configuration prod
npm test
npx playwright test
```

Update these commands when their implementation changes. The frontend uses the Angular Vitest runner. Do not retain a second unit-test
stack. Playwright requires the production frontend build and Microsoft Edge.
Prefer consequential behavior tests over trivial creation tests or arbitrary coverage goals.

Finish each coherent implementation batch before testing it. Reuse earlier passing
results; rerun checks only for changed behavior, failures or unresolved concerns.

Add a small Playwright suite for signature seeded journeys using Microsoft Edge
with `channel: 'msedge'`. Inspect representative desktop/mobile widths and light,
dark, and system modes. Capture failure artifacts; fix clear UI problems. Verify
a local production-like run, configuration, migrations, health, persistence, and
restart behavior. Report unavailable tooling or unverified behavior explicitly.

Keep CI lightweight: backend/frontend build and tests, reliable Edge journeys,
and Docker validation where practical. Never publish or deploy from this work.

Keep documentation concise: README, architecture, development, deployment, and AI
only if justified. README screenshots must show the real seeded application and
live under `docs/screenshots/`; do not use mockups.

Before completion, audit replaced utilities/dependencies, dead routes/components,
template content, external placeholders, direct fetch/localStorage usage,
window.confirm, internal raw hrefs, duplicate styles/icons, provider-specific
assumptions in generic code, hard-coded deployment values, warnings, and secrets.
Do not mechanically rewrite unrelated code to improve counts.

Final reporting must distinguish completed work from limitations, include branch,
starting/ending commits, concise commit log, git status, verification results,
product/architecture/dependency/storage changes, docs/screenshots, and anything
deliberately unchanged. Never claim checks passed unless they actually ran.
