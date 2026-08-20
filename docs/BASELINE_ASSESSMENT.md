# JMS Fork Baseline Assessment

Assessment date: 2026-08-20. This document records the repository as found. It is not a modernization plan.

## Executive summary

**Observed.** JMS is a late-2023 graduation job-management/recruitment application: an Angular 16.2 single-page app talks directly to a .NET 6 Web API, which uses EF Core 6 and SQL Server. It has distinct candidate, recruiter, and administrator areas, CV authoring, job/company management, application/matching records, image handling, password-reset email, and an integrated GPT-based CV-to-job scoring experiment.

The backend compiles (`0` errors, `373` warnings) after restore on this machine. The frontend cannot currently be clean-installed with its committed npm lock graph: `npm ci` stops on an Angular 16 patch-version peer conflict. The API was not started because the installed SDK can compile `net6.0`, but the required `Microsoft.AspNetCore.App 6.0` shared runtime is absent. No database migration or replacement infrastructure was attempted.

The most urgent future decision is whether this fork will preserve this product as a portfolio artifact, deliberately modernize it, or focus on a narrower capability. The codebase offers useful workflows and migrations, but it also contains committed credentials, legacy unsupported frameworks, fragile auth/authorization conventions, and minimal meaningful automated testing.

## What JMS currently is

**Observed.** The only solution is `BackEnd/BackEndApplication/BackEndApplication.sln`, containing `APIServer`. The API project targets `net6.0` and references EF Core SQL Server, JWT Bearer, AutoMapper, MailKit/MimeKit, Swagger, X.PagedList, and `OpenAI` 1.7.2 (`BackEnd/BackEndApplication/APIServer/APIServer.csproj:3-48`). The frontend is an NgModule-based Angular application whose root router lazy-loads `/admin`, `/candidate`, and `/recruiter` (`FrontEnd/src/app/app-routing.module.ts:9-36`).

**Inferred.** The project is a role-separated recruitment platform rather than merely a CV template editor: application/matching records connect a candidate CV to a recruiter’s job description, and recruiter selection/rejection actions operate on those records.

## Product/domain capabilities

| Role | Workflow | Frontend area | API/data evidence |
| --- | --- | --- | --- |
| Candidate | Register, sign in, reset/change password and manage profile | `modules/candidate` | `Controllers/UserModule/RegistersController.cs`, `TokenController.cs`, `CandidateController.cs` |
| Candidate | Create/update/delete/view CVs; set a CV as job-seeking | `candidate-routing.module.ts:20-34` | `Controllers/CandidateModule/CVsController.cs:31-176`; `CurriculumVitae` |
| Candidate | Browse jobs/companies, apply a CV, view application history | `list-jobs`, `jd-detail`, `my-apply-job` | `CandidateController.cs:49-132`; `CVMatching` |
| Recruiter | Register/sign in; create company and manage employees | `modules/recruiter` | `CompanysController.cs:104-245`; `Company`, `EmployeeInCompany` |
| Recruiter | Create/manage jobs and view expired jobs | `create-jd`, `list-jds` | `JobDescController.cs:42-171`; `JobDescription` |
| Recruiter | Run matching; inspect, select, or reject candidates | `jd-detail`, `list-candidate` | `RecuirterController.cs:68-208`; `CVMatching` |
| Admin | Sign in, browse platform entities, toggle account status, see headline statistics | `modules/admin` | `AdminController.cs:28-447` |

**Observed partial/demo features.** Slider CRUD is implemented by `ImagesController.cs:140-186`, but the candidate slider calls the company listing rather than the slider endpoint (`FrontEnd/src/app/modules/candidate/components/sliders/sliders.component.ts:31-41`). The admin charts and activity widgets are hard-coded ecommerce samples rather than JMS data (`FrontEnd/src/app/modules/admin/components/sales-by-month/sales-by-month.component.ts:10-67`, `last-few-transaction.component.ts:9-40`). WeatherForecast files are template residue. Some admin shell/sign-up/settings components are minimal or empty.

## Repository map

```text
FrontEnd (Angular 16.2)
  └─ component-local fetch helpers and localStorage
       └─ APIServer controllers
            └─ services (with several direct-context/file/GPT calls)
                 └─ repositories / EF Core JMSDBContext
                      └─ SQL Server
```

`Program.cs:22-150` configures CORS, controller JSON reference-loop handling, JWT bearer authentication, Swagger, AutoMapper, the SQL Server context, transient application services/repositories, and static files. Nominal dependency direction is controller → service → repository → `JMSDBContext`, but it is not consistently enforced: `RecuirterService`, `AdminService`, and `CurriculumVitaeService` instantiate a context directly; `RecuirterController` also takes the context directly.

## Backend architecture

**Observed.** Controllers are grouped into `AdminModule`, `CandidateModule`, `RecuirterModule`, and `UserModule`. Separate service and repository interfaces/implementations cover administrators, candidates, recruiters, companies, jobs, CVs/CV matching, images, email, registration, lookups, and sliders. DTOs and `MappingObj/MapObject.cs` sit between many endpoints and entities. Responses use `BaseResponseBody<T>` and a paging variant (`BackEnd/BackEndApplication/APIServer/DTO/ResponseBody/`).

Representative evidence:

- Candidate application validates IDs, loads a CV/job, snapshots CV material into `CVMatching`, invokes GPT scoring, and persists the result (`Controllers/CandidateModule/CandidateController.cs:49-87`; `Services/CandidateService.cs:87-191`).
- Recruiter matching verifies job ownership, filters CVs by category, evaluates each, persists results, and returns them in score order (`Controllers/RecuirterModule/RecuirterController.cs:105-129`; `Services/RecuirterService.cs:210-353`).
- Separate login endpoints issue role-claim JWTs for candidates, recruiters, and admins (`Controllers/UserModule/TokenController.cs:34-108`; `Program.cs:42-63`).

**Observed weaknesses.** Generic service interfaces contain `NotImplementedException` methods (`Services/CandidateService.cs:37-70`; `RecuirterService.cs:42-45`). Error handling is per-controller catch-and-envelope logic; no global exception/ProblemDetails pipeline was found. Paging is duplicated between services and `Common/Paging.cs`. `MapObject` uses launch-profile host information to build URLs (`MappingObj/MapObject.cs:12-16`).

## Frontend architecture

**Observed.** `AppModule` bootstraps the three lazy role modules. Feature components own API calls, local state, validation, loading/error reactions, and frequently DOM manipulation; there are no domain-oriented Angular `HttpClient` services. Requests are free functions around browser `fetch` (`FrontEnd/src/app/service/api-requests.ts:1-83`) and endpoint strings live in `service/constant.ts:15-110`.

Authentication has duplicated generic and role-specific localStorage keys (`service/localstorage.ts:1-78`). Guards only test role-key presence (`modules/*/auth.guard.ts`), whereas request helpers read only generic `localStorage["token"]` (`api-requests.ts:18-32`). File posts take an authorization mode but do not set an authorization header (`api-requests.ts:75-83`).

**Observed coupling.** The recruiter candidate-list component imports the candidate feature’s `ViewCvComponent` (`modules/recruiter/components/list-candidate/list-candidate.component.ts:5-6`), crossing lazy-module ownership. CV forms use global jQuery selectors and clone/remove DOM sections (`candidate/components/create-cv/create-cv.component.ts:95-150`; `update-cv.component.ts:453-521`).

The app bundles Bootstrap 5 and jQuery but also loads Bootstrap 4, an older jQuery, and related scripts from CDNs (`FrontEnd/angular.json:30-40`; `FrontEnd/src/index.html:10-25`). Used packages include Material, Bootstrap, ngx-toastr, ngx-pagination, angular-highcharts, CKEditor, and ngx-autosize. `quill`, `angular-font-awesome`, many standalone CKEditor packages, and the nested custom CKEditor build have no clear application use.

## Database/domain model

**Observed.** `JMSDBContext` has 20 DbSets and a parameterless configuration path that rereads `appsettings.json` (`Models/JMSDBContext.cs:9-72`). There are 24 EF migrations from `20231020150544_init_db` through `20231201170934_add empType to CVMatching` (`Migrations/`). The expected database is SQL Server; current configuration targets a non-local SQL Server and no local SQL Server/LocalDB service was detected on this machine.

Core relationships from `Migrations/JMSDBContextModelSnapshot.cs:1002-1225`:

- Candidate → CVs and `CVMatching` records.
- CV → education, work experience, skills, projects, certificates, and awards; it also references category, level, gender, and employment type.
- Recruiter → one company and employee/company relationships; Company → jobs.
- Job → recruiter/company/category/level/gender/employment type.
- `CVMatching` → candidate, CV, job, level, gender, employment type and stored CV snapshots.

**Risk classification.**

- **HIGH:** `CVMatching` stores serialized snapshots plus independent `IsMatched`, `IsApplied`, `IsSelected`, and nullable `IsReject` flags (`Models/Entity/CVMatching.cs:14-50`), so state transitions and consistency are implicit.
- **MEDIUM:** account types are separate tables; several ownership foreign keys are nullable; soft-delete filtering differs between repositories; usernames/emails have no visible database uniqueness constraints.
- **MEDIUM:** multiple date-like values are strings (`Models/Entity/JobExperience.cs:13-22`, `Education.cs:13-22`, `Project.cs:13-19`, `Certificate.cs:13-20`); application code uses local `DateTime.Now` without an observed UTC policy.

## Authentication and security

**Observed.** Passwords are hashed with BCrypt; JWT bearer validation is registered, and tokens carry an ID, display/user information, email, and role claim (`TokenController.cs:34-108`, `Program.cs:42-63`). MailKit sends password-reset email using `EmailHelper`.

### Findings

- **CRITICAL — committed secrets:** `appsettings.json` currently contains database authentication material, a JWT signing key, and SMTP credentials; `Common/gptkey.txt` is a tracked OpenAI-key file and is copied to output (`APIServer.csproj:30-33`). Values are deliberately omitted here. Git history shows these configuration/key paths were committed during the 2023 development period, so later history remediation may merit a deliberate decision. `.gitignore` now lists the GPT-key path but cannot untrack historical/currently tracked content (`.gitignore:364`).
- **HIGH — authorization confidence:** several endpoints accept caller-supplied IDs without an evident comparison to JWT claims. `AdminController` has no controller-level authorization and its change-password action is explicitly anonymous (`Controllers/AdminModule/AdminController.cs:446-448`). Token-info actions manually parse action-parameter tokens (`TokenController.cs:127-186`).
- **HIGH — transport/configuration posture:** JWT registration sets `RequireHttpsMetadata = false` (`Program.cs:49-52`); CORS allows any method/header for the configured frontend origin; config contains a remote database expectation.
- **MEDIUM — upload boundary:** image service allows only jpg/jpeg/png and nominal size limits, but writes web-root files (`Services/ImageService.cs:195-238`). Frontend upload requests omit bearer credentials as noted above.
- **MEDIUM — observability/error boundary:** broad exception handling and manually shaped response envelopes conceal a consistent error policy; sensitive-logging safeguards were not observed.

## AI / CV matching feature

**Observed.** The core active matching paths call `GPT_PROMPT.PromptForRecruiter` from candidate application and recruiter matching (`Services/CandidateService.cs:161`; `RecuirterService.cs:320`). Prompt construction combines job education, experience, and skill requirements with CV information (`Common/GPT_PROMPT.cs:56-216`). `GetResult` reads the first line of `Common/gptkey.txt`, invokes the community `OpenAI` package’s chat-completions path using the generic GPT-4 alias, and sets `MaxTokens = 150`; temperature is commented out (`GPT_PROMPT.cs:218-253`). The output parser looks for education, experience, and skill fields and computes a 25/40/35 weighted percentage (`Common/Validation.cs:86-127`). `PromptForCandidate` exists but is not referenced by active flows.

**Inferred.** This is a graduation-era AI experiment integrated into a central workflow rather than an isolated prototype: its result is persisted as JSON/percentage in `CVMatching`, yet it has no pinned model snapshot, deterministic temperature, schema enforcement, retries, or evaluation evidence. A recruiter batch path waits 12 seconds per candidate (`Services/RecuirterService.cs:254-353`). Its live functionality is **UNKNOWN** without credentials and a live model check.

## External integrations

- SQL Server through EF Core configuration and migrations.
- JWT bearer authentication and BCrypt password hashing.
- SMTP over MailKit STARTTLS (`Helpers/EmailHelper.cs`).
- Web-root image storage, including a `wwwroot/images_clone` matching snapshot path.
- OpenAI chat completion through the legacy community wrapper.
- Swagger, available only in development configuration (`Program.cs:70-77`).

## Build and runtime status

| Area | Command / probe | Result |
| --- | --- | --- |
| Backend toolchain | `dotnet --info` | SDK 10.0.301; .NET runtime 6.0.36 exists, but ASP.NET Core shared runtime 6 is not installed. |
| Backend restore | `dotnet restore BackEnd/BackEndApplication/BackEndApplication.sln` | Completed sequentially with EOL, vulnerability, and legacy-package compatibility warnings. An earlier parallel attempt ended in a transient file-exists error. |
| Backend build | `dotnet build ... --no-restore` | **Passed:** 0 errors, 373 warnings. Warnings include nullable analysis, duplicate using directives, and CA2200 rethrows. Restore also reports vulnerable MailKit/MimeKit versions and a .NET Framework-targeted BCrypt package. |
| API runtime | `dotnet run --no-build --launch-profile APIServer` | **Blocked:** runtime error requires `Microsoft.AspNetCore.App` 6.0; no Swagger/API probe occurred. |
| Database runtime | No migration/startup transaction attempted | **Unknown:** configuration expects SQL Server; no local service was found and no substitute was introduced. |
| Frontend toolchain | `node --version`, `npm --version`, `yarn --version` | Node 24.13.0, npm 11.6.2; Yarn unavailable. |
| Frontend install/build | `npm ci`, then `npm run build` in `FrontEnd` | **Blocked:** clean install fails `ERESOLVE` because the committed resolved Angular patch versions disagree; `ng` is consequently absent. No force/legacy-peer-deps override was used. |

## Test and quality status

**Observed.** There is no backend test project, CI workflow, coverage threshold, lint configuration, Docker/deployment setup, or end-to-end test setup. Angular has nine `*.spec.ts` files, all admin dashboard components and all generated “should create” shape tests. Karma/Jasmine configuration and `npm test` exist (`FrontEnd/angular.json:96-113`; `FrontEnd/package.json:5-10`), but tests could not be installed/executed because the clean install fails.

## Dependency and currentness status

| Item | Status | Evidence |
| --- | --- | --- |
| .NET 6 / ASP.NET Core 6 / EF Core 6 | **OUT OF SUPPORT** | Microsoft says .NET 6 ended support 2024-11-12: [support policy](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core). |
| Angular 16.2 | **OUT OF SUPPORT** | Angular lists v2–v19 as unsupported; historical 16.1/16.2 Node range is `^16.14.0 || ^18.10.0`: [releases](https://angular.dev/reference/releases), [compatibility](https://angular.dev/reference/versions). The current Node 24 machine is outside that recorded range. |
| `OpenAI` 1.7.2 | **LEGACY / UNOFFICIAL** | The package identifies itself as an unofficial 2023 community wrapper: [NuGet](https://www.nuget.org/packages/OpenAI/1.7.2). Its `OpenAIAPI` surface predates the official SDK: [Microsoft announcement](https://devblogs.microsoft.com/dotnet/openai-dotnet-library/). |
| Generic GPT-4 alias used for matching | **UNKNOWN** at runtime | Chat Completions remains documented, but the generic alias is not a pinned account-verified model identifier: [model/API reference](https://developers.openai.com/api/reference/overview). |
| MailKit 4.2.0 / MimeKit 4.2.0 | **VULNERABLE (restore evidence)** | NuGet restore reported two moderate MailKit/MimeKit advisories and one high MimeKit advisory. |
| BCrypt.Net 0.1.0 | **LEGACY/COMPATIBILITY RISK** | Restore selected .NET Framework assets for a `net6.0` project (NU1701). |

Frontend dependency evidence is internally inconsistent: `FrontEnd/package-lock.json` and `FrontEnd/yarn.lock` both exist, while `FrontEnd/.gitignore` and root `.gitignore` treat Yarn state inconsistently. npm is better supported by README/VS Code task evidence, yet the actual lock graph is not currently reproducible. The root `package.json` is a separate one-dependency artifact with Angular 17 resolutions and does not represent the app. The nested `ckeditor5-custom-build` is a third Node project with its own lockfile.

## Documentation status

**Observed.** Before this assessment, no project-specific `AGENTS.md` or `docs/` directory existed. The root `README.md:2-49` is Git-command/contributor scratchpad material; `FrontEnd/README.md:1-25` is Angular CLI boilerplate; `CLI-Anglar.txt:1-30` contains personal/group commands and extensions; `Nuget-Packges.txt:1-9` lists packages plus a generic NorthWind example. These are stale, duplicative or scratchpad-level, and do not explain JMS configuration, database prerequisites, architecture, or verified setup.

The README was intentionally left unchanged because how this fork should present itself remains undecided.

## Strengths worth preserving

- **Good foundation:** distinct candidate/recruiter/admin product areas, broad recruitment workflows, domain migrations, DTO mapping, JWT/BCrypt foundations, email/image support, Swagger registration, and substantial CV lifecycle coverage.
- **Workable but dated:** explicit service/repository layers, local-storage role separation, soft deletion, and a usable CV-to-job matching concept.
- **Fragile:** CV matching state/snapshots, direct context construction, component-local fetch/DOM logic, duplicated token conventions, permissive configuration, and application-path external AI calls.
- **Dead/unused or demo:** WeatherForecast residue, likely unused slider API/UI linkage, ecommerce admin charts/activity data, unused/overlapping frontend dependencies, and custom CKEditor build artifacts not imported by the application.

## Risks and technical debt

| Severity | Finding | Why it matters |
| --- | --- | --- |
| CRITICAL | Secrets committed in app configuration and tracked GPT key file | Credentials and signing material must be treated as exposed; any remediation needs deliberate external coordination/history scope. |
| HIGH | Auth/authorization checks are inconsistent and caller IDs are trusted in several flows | Cross-account access or unauthorized administration needs targeted verification before production-facing use. |
| HIGH | Frontend cannot clean-install; .NET/Angular platforms are unsupported | Repeatable development and security support are currently compromised. |
| HIGH | AI matching is synchronous, unpinned, loosely parsed external-model work on key request paths | Scores can be slow/non-repeatable and live availability is unverified. |
| MEDIUM | 373 compile warnings, nullable mismatches, direct context/file/static calls, implicit error policy | Future behavior is difficult to reason about and test safely. |
| MEDIUM | Denormalized `CVMatching` state, string dates, inconsistent soft delete/time policy | Historical accuracy and workflow integrity are hard to enforce. |
| MEDIUM | jQuery/Bootstrap duplication, cross-feature imports, untyped fetch/local state | Frontend ownership boundaries and UI behavior are fragile. |
| MEDIUM | No meaningful test suite, CI, coverage, linting, or observability baseline | Changes have weak regression protection. |
| LOW | Demo dashboard data, template residue, stale docs, encoding corruption and naming errors | Misleads maintainers and adds noise, but is not an immediate runtime blocker. |

## Opportunity map

| Dimension | Current state | Why it matters | Size/risk | Dependencies |
| --- | --- | --- | --- | --- |
| Modernization | Unsupported .NET 6/Angular 16, old Node expectation, legacy package graph | Security support and local reproducibility | Broad / high | Desired compatibility and deployment target |
| Reliability/testing | No meaningful automated tests; compile warnings and install failure | Confidence in changes and demonstrations | Medium–broad / medium | Stable build/install baseline |
| Security | Committed secrets and inconsistent authorization posture | Credential exposure and access control | Focused–broad / high | Secret ownership/rotation authority and desired auth scope |
| Architecture | Nominal layers exist but are bypassed; frontend components own transport/DOM state | Maintainability and feature velocity | Broad / medium | Decision whether to preserve existing contracts |
| Product completion | Candidate/recruiter flows are real; admin/slider/demo areas are uneven | Determines what belongs in a polished fork | Variable / medium | Product identity and backward-compatibility decision |
| UX | Role modules are established, but UI stacks and dashboard content conflict | Portfolio/professional usability | Medium–broad / medium | Desired visual/product direction |
| AI/CV matching | Integrated GPT experiment with fragile scoring behavior | Could be a differentiator or a liability | Medium–broad / high | Whether AI is core, data/privacy constraints, live API ownership |
| Deployment/observability | No CI, deployment descriptor, health or monitoring setup | Repeatable delivery and diagnosis | Medium / medium | Target hosting and database approach |

## Unknowns and blockers

- A valid, authorized SQL Server database and whether its migrations reflect production data were not verified.
- API runtime requires installation of ASP.NET Core 6 shared runtime on this machine; no runtime/toolchain change was made.
- The frontend’s intended authoritative package manager/lockfile is undocumented, and its npm clean-install baseline currently fails.
- The GPT key’s validity, model access, usage limits, and matching behavior against real data are unknown and were not tested.
- Authorization behavior needs endpoint-level tests before any claim of safe role isolation.
- It is unknown whether graduate-project compatibility, original data, and API routes must be preserved.

## Questions for the owner

1. Is the fork’s primary outcome modernization, a portfolio-quality demonstration, production-style recruitment capability, or a focused technical exercise?
2. Must existing Angular/.NET API contracts, the SQL Server schema, and graduation-era data remain compatible?
3. Is AI CV matching a feature to preserve, evaluate, replace later, or retire from the product story?
4. Is the project intended to handle real candidate/recruiter data, and who can authorize credential rotation and database/API access?
5. Should the existing UI/role workflows be retained as the product baseline, or is the desired scope intentionally narrower?
6. Is a deployable environment part of the desired end state, and if so, what hosting/database constraints apply?
7. What level of role authorization and auditability is required for the intended audience?
8. Is preserving the original project’s history/attribution important when addressing committed-secret exposure?
9. Which user journeys are the most valuable evidence of success: candidate CV/application, recruiter job/matching, administrator operations, or something else?

## Verified commands and environment

```text
git status --short
git branch --show-current
git branch -a
git remote -v
git log --oneline --decorate -20
git log --graph --oneline --decorate --all -30
dotnet --info
dotnet restore BackEnd/BackEndApplication/BackEndApplication.sln --verbosity minimal
dotnet build BackEnd/BackEndApplication/BackEndApplication.sln --no-restore --verbosity minimal
dotnet run --no-build --launch-profile APIServer
node --version
npm --version
yarn --version
npm ci
npm run build
```

The last two commands ran from `FrontEnd`; no package-resolution overrides, upgrades, database migrations, or source/configuration fixes were applied.
