# JMS

JMS is a development-only portfolio project for exploring the candidate → job → matching → recruiter review loop. It uses fictional seed data and deterministic matching as the source of truth. Gemini can add a bounded explanation, but it never makes a hiring decision.

## Stack

- ASP.NET Core / .NET 10 Web API
- SQLite with EF Core migrations and an idempotent Development seeder
- Angular 21 with npm, TypeScript, and the existing feature modules
- Node 24 LTS for the client toolchain
- Gemini AI Studio as the first provider adapter (optional)

## Run locally

Prerequisites: .NET SDK 10.0.301 (or a compatible 10.0 SDK), Node 24, and npm.

Start the API:

```powershell
cd BackEnd/BackEndApplication
dotnet restore
dotnet run --project APIServer/APIServer.csproj
```

Start the Angular client in a second terminal:

```powershell
cd FrontEnd
npm ci
npm start
```

The development client uses `http://localhost:8080` for the API and serves at `http://localhost:4200`. The API exposes Swagger at `http://localhost:8080/swagger` and readiness probes at `/health/live` and `/health/ready`.

The API creates and migrates its SQLite database only in Development. User uploads and Data Protection keys stay in local `App_Data` folders and are not repository data.

## Demo accounts

The Development-only seeder uses the same fictional password for these accounts: `JmsDemo!2026`.

| Role | Username |
| --- | --- |
| Admin | `demo.admin` |
| Recruiter | `minh.northstar` |
| Recruiter | `linh.paperkite` |
| Candidate | `an.le` |
| Candidate | `duc.pham` |

These credentials are for local walkthroughs only. Do not reuse them outside this development project.

## Docker demo

Docker Desktop must be running. From the repository root:

```powershell
docker compose up --build
```

Open `http://localhost:4200`. The frontend container serves the Angular build and proxies `/api/*` and `/health/*` to the API container. SQLite is stored in the named `jms-data` volume. The compose file contains only development defaults; provide `JMS_JWT_KEY` locally if you want to replace the placeholder development key.

## AI configuration

AI is optional. An admin can configure an encrypted Gemini provider profile from the admin settings screen. The backend validates the provider/model/reasoning combination against its current capability catalogue, never returns API keys to the browser, bounds requests, and exposes a safe connection test. Without a configured key, deterministic matching and the curated FAQ still work.

The default approved model is the economical `gemini-3.1-flash-lite` with minimal reasoning. Historical matching records retain their rules version, provider/model status, deterministic eligibility, explanation, and fallback state.

## Themes and calibration

The client has persisted `System`, `Light`, and `Dark` modes. System mode follows the operating-system preference and falls back safely when it changes.

The `/candidate/calibration` Career Calibration Terminal is a replayable parody questionnaire. Its collectible endings are entertainment only and never affect matching, ranking, recruiter visibility, or hiring recommendations.

## Verification

```powershell
cd BackEnd/BackEndApplication
dotnet build BackEndApplication.sln
dotnet test APIServer.Tests/APIServer.Tests.csproj

cd ../../FrontEnd
npm ci
npm run build -- --configuration prod
```

The frontend test target requires a locally installed Chrome/Chromium binary for `ChromeHeadless`.
