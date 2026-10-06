# Project status

Updated: 2026-10-07. Implementation branch: `rewrite/jms-2024-remaster`.
Remaster base: `be107495534b374c8aa93ad9d924328748da7ae7`.

The first recruitment remaster is committed through `1916860`. Its backend and
frontend builds, focused unit coverage, and five Microsoft Edge signature
journeys passed. Local production persistence/configuration smoke checks passed.
Docker execution and live AI calls remained unverified because Docker and real
provider credentials were unavailable. No external deployment is part of this work.

## Completed refinement

- Shared CV readers handle current CVs and historical application snapshots,
  omit empty/corrupt sections and load local themes from the frontend origin.
  Candidate has inline print/edit navigation; Admin and Recruiter share the
  same accessible preview. Their job readers use one shared document layout.
- Help is available in the headers through a focus-managed drawer. Search and
  question/answer behavior remain curated and work without an AI key.
- EN/VI covers application-owned controls, navigation, route titles, validation,
  status messages, document headings, help and CKEditor controls. User-authored
  documents/catalogs retain their original language. Existing FAQs can receive
  English text in Admin; missing translations have a visible Vietnamese fallback.
- Admin overview groups operational activity, attention items, community and
  review outcomes. Statistics adds real UTC activity for 30/90/365 days, open-job
  categories, company supply and matching explanation states, without PII.
- Each AI provider has economical and stronger curated choices, provider/model
  reasoning metadata and bounded adapter payloads. Existing profiles/evaluations
  remain compatible. Official sources and review date are recorded in `ai.md`.
- Calibration is a complete six-scene story with four inner voices, six endings,
  original EN/VI transcreation, partial-session resume and a local ending gallery.
  No result leaves the browser or affects recruitment.
- Wider layouts use space for document facts, operational context, game voices
  and a journal. Theme/account/language menus remain keyboard accessible.
  Recruiter profile template billing links and unused placeholder components/
  filtering code were removed. No new runtime dependency was added in this batch.

Calibration uses original authored dialogue and online CC0 artwork by zonked
and acasas. [Artwork credits](../FrontEnd/src/assets/images/calibration/CREDITS.md)
record the original sources. No generated artwork is included.

## Verification

Checks were reused unless the changed behavior needed another check.

| Scope | Actual local result |
| --- | --- |
| Earlier remaster | Backend build, 54 backend tests, 9 frontend tests, five Edge recruitment journeys and navigation check passed |
| New backend behavior | 15 focused tests passed: insights/FAQ upgrade and bilingual search, model catalogue and provider request contracts |
| Production frontend | Build passed; initial bundle ~946 KB raw / 188 KB estimated transfer |
| New frontend behavior | Six tests passed: CV normalization, EN/VI preference, story integrity and all 4,096 complete game routes |
| New Edge journeys | Bilingual game/local collection/header help, Candidate CV reader, Admin insights and Admin/Recruiter previews passed |
| Changed editor | Rich-text draft survived VI → EN → VI, saved and remained correct after reload |
| Responsive/navigation | All-role keyboard menus, light/dark/system, desktop/tablet/mobile passed; new help/readers/statistics/profile checked at mobile width |
| Migration | Existing FAQ survived upgrade; clean seeded SQLite initialization passed |
| GitHub build/unit verification | 58 backend tests, 15 frontend tests, production frontend build and both Docker image build targets passed |
| Production preparation | Earlier local Production smoke verified health, CORS, no demo seeding and persistence/restart of SQLite, uploads and protected configuration |

Eight README screenshots show the real seeded application. The overview image
waits for operational data to load. Build/test artifacts and local storage are
ignored. GitHub Actions runs backend/frontend tests, the single Edge project and
Docker build targets. PR updates run once, and `master` pushes are verified;
consult repository Actions for the latest complete remote result.

## Deliberate boundaries and remaining limits

- Live provider calls require credentials and were not made. Mock request tests
  verify payload contracts, not external model quality/account availability.
- Docker is unavailable on this machine; local container recreation is unverified.
  Persistent volumes and provider-neutral configuration are supplied for it.
- Existing installations are not reseeded or automatically translated. Admin must
  supply English versions of its own help; CV/JD/catalog content stays original.
- Admin activity describes surviving records and UTC dates, not an immutable audit
  ledger. Native distributions and grouped bars serve the modest project scope.
- CKEditor remains because rich text warrants it; its CommonJS notices and hosting
  license requirements are documented. Historical nullable warnings and the
  mitigated AutoMapper 12 advisory remain documented in `development.md`.
- Angular/.NET/SQLite, nine original CV themes, historical `Recuirter` API/schema
  names and the existing theme/session/matching boundaries are retained.
- No password recovery, billing, messaging, scheduling, external deployment or
  autonomous hiring system was added.

The user explicitly authorized publishing and merging after final verification.
Git history and the final task report record the resulting commits and merge;
this document does not embed its own commit hash.

See [AI choices and sources](ai.md) for the model review and
[development](development.md) for local commands.
