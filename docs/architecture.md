# Architecture

Candidate → CV → Job → Application/matching snapshot → Recruiter review.

The Angular SPA owns navigation, session state and presentation. Lazy Candidate, Recruiter and Admin modules share neutral CV presentation, JMS pagination, CDK confirmations, notifications and theme controls. `ApiService` uses Angular HttpClient and a request-context bearer interceptor; feature services own discovery, saved jobs and recruiter workspaces. `AuthService` is the session owner, and one role guard validates JWT role/expiry. Existing screens use explicit Zone-based change detection; touched shared state uses signals.

The ASP.NET API retains controllers → services → repositories and one configured scoped EF context. SQLite migrations under `Migrations/Sqlite` are authoritative. Saved jobs use a candidate/job composite key. An application preserves the CV snapshot used at submission; shortlist/reject flags provide its lifecycle. Historical `Recuirter` naming remains compatible.

## Matching and AI

Rule scoring and category eligibility run first and remain authoritative. Optional AI explanations provide bounded strengths/gaps. `AiModelCatalog` supplies provider/model-specific capability metadata; Gemini, OpenAI and Anthropic adapters own REST payload construction. Input text is untrusted, source/output sizes and time are bounded, and provider failures preserve deterministic results. Provider, model, reasoning, rules version and failure state stay with the historical evaluation.

Admin profiles use Data Protection for keys. Reads return only key-presence flags. Connection tests check model access without generating a paid evaluation. Keys can be replaced or removed. No autonomous hiring/rejection or AI interview subsystem exists. Curated FAQ help is independent of external AI.

## Runtime boundaries

JWT and origins are configured externally. `LocalImageStorage` owns image roots, validated signatures/sizes, path containment and unique snapshot copies. SQLite, the key ring and uploads need persistent storage; none belongs in a disposable container layer. See [deployment](deployment.md).

Bootstrap utilities and JMS design tokens own the UI, Bootstrap Icons own icons, CDK owns dialogs/focus primitives, and CKEditor owns rich text. Material, legacy fetch/auth utilities, Highcharts and redundant filtering/pagination/toast packages were removed.
