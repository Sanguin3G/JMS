# Deployment readiness

JMS is prepared for provider-neutral hosting; this repository does not provision
infrastructure or deploy to a provider. Run one API instance against a persistent
SQLite file. Back up the database, Data Protection keys, and images together.

## Configuration

.NET environment variables use `__` for nested settings.

| Setting | Purpose |
| --- | --- |
| `ASPNETCORE_ENVIRONMENT=Production` | Disables Swagger, demo seeding, and detailed unhandled errors |
| `ASPNETCORE_URLS=http://+:8080` | Internal listening address; host supplies the port |
| `Jwt__Key` | Required stable signing secret, at least 32 characters |
| `Jwt__Issuer`, `Jwt__Audience` | Token issuer/audience; keep consistent across restarts |
| `Cors__AllowedOrigins__0` (then `__1`, etc.) | Exact frontend HTTP(S) origins, no path or trailing slash |
| `ConnectionStrings__JobConstr=Data Source=/data/jms.db` | Persistent SQLite database |
| `DataProtection__KeyPath=/keys` | Persistent encryption key ring |
| `DataProtection__ApplicationName=JMS` | Stable discriminator for a **new** installation |
| `Storage__UploadRoot=/uploads` | Persistent public images, snapshots, and slider folders |
| `JMS_PUBLIC_URL=https://api.example.test` | Required public HTTP(S) backend origin used for image URLs; no path |
| `Database__ApplyMigrations=false` | Production default; explicitly enable for a controlled upgrade |
| `Database__SeedDemo` | Development-only; ignored in Production |

No configured production CORS origins means cross-origin browser requests are
denied. Same-origin proxying still works. AI keys are configured in Admin and
encrypted server-side. Password recovery is not exposed; the old replacement-password
email flow was removed.

Keep database/key/upload directories outside the disposable application layer and
writable by the runtime user. Mounted volumes in Compose provide these locations.
The API image runs as the .NET `app` user; host bind mounts need compatible ownership.

For existing installations preserve the **original key ring and application
discriminator** when moving hosts. Leaving `DataProtection:ApplicationName` unset
preserves existing local behavior. Introducing `JMS` on an old installation without
the matching discriminator makes stored AI keys unreadable; do not treat replacing
keys as an automatic migration. New Compose installations explicitly use `JMS`.

Copy existing `wwwroot/images`, `wwwroot/images_clone`, and `wwwroot/slider` folders
into the new upload root before switching it. Public URL paths remain compatible.
Snapshots use unique filenames so replacing one application avatar cannot overwrite
another application's historical image. Only these public image folders are served;
key/database directories must never be mounted under the public upload root.

## Database and startup

Development applies EF migrations and seeds fictional demo data. Production does
neither by default. For a new database or upgrade, back up first and run exactly one
API instance with `Database__ApplyMigrations=true`, wait for readiness, then restart
with it false. EF applies pending migrations without destructive recreation; a
migration failure aborts startup. For a manual EF CLI procedure with the .NET 10 EF
tool installed and the same production environment variables supplied:

```powershell
dotnet ef database update --project BackEnd/BackEndApplication/APIServer/APIServer.csproj
```

The bilingual-help migration adds nullable columns and preserves existing FAQ
content. It does not translate or reseed a populated database. Fill optional
English help fields through Admin after upgrade. Browser language preferences
and Calibration saves are local client state, not server persistence requirements.

Do not copy a running SQLite file without a consistent backup method. Stop writes
for a filesystem backup, or use SQLite's backup facility; preserve associated WAL
state as appropriate. Never remove volumes as a routine restart procedure.

## Docker and frontend

The multistage Dockerfile builds the production Angular app and .NET API. Compose
defaults to a **local demo** in Development. Supply your own stable local signing
key, then run `docker compose up --build`. For production-like validation:

```powershell
$env:JMS_JWT_KEY = '<your local smoke-test signing key of at least 32 characters>'
$env:JMS_ENVIRONMENT = 'Production'
$env:JMS_APPLY_MIGRATIONS = 'true'
$env:JMS_SEED_DEMO = 'false'
docker compose up --build -d
```

Set `JMS_FRONTEND_ORIGIN` and `JMS_PUBLIC_URL` for different host/port addresses.
Compose serves the frontend at port 4200 and proxies API, health, and image routes
to the API on 8080. API access can also use separate origins with the CORS allow-list.
The frontend loads `/config.js`, where an externally mounted file can set
`window.JMS_CONFIG = { apiUrl: 'https://api.example.test' };`. The default uses
same-origin API requests. Configuration is documented in [development](development.md).

An external frontend host must fall back to `index.html` for Angular routes.
`deploy/nginx.conf` demonstrates that behavior. Terminate public TLS at a normal
reverse proxy. JMS does not depend on client IP or forwarded scheme for authorization
or URL construction, so it does not trust arbitrary forwarded headers. Returned
image URLs use the explicit public origin. Configure trusted forwarded proxies if
future features genuinely require them; do not enable unrestricted header trust.

## Smoke checks

`/health/live` checks the process; `/health/ready` verifies SQLite connectivity.
With the frontend and API running, check both endpoints, refresh an Angular nested
route directly, sign in using an intentionally populated test database, and verify
separate-origin CORS with allowed and disallowed origins. Save an image and encrypted
AI profile, restart/recreate containers (`docker compose down` then `up -d`, **without
`-v`**), and verify database rows, image URLs, and AI connection testing still work.
Set migrations false after provisioning. A fresh Production database contains no
demo users. Keep logs on stdout and supply production secrets externally; do not
commit `.env`, key rings, database files, or uploads.
