# AI provider configuration

JMS does not store provider keys in source control. The initial development provider is Gemini, selected through `IMatchEvaluationProvider` so other provider adapters can be added without changing application and recruiter matching flows.

Set `GEMINI_API_KEY` in the process environment before starting the API. The default model is `gemini-3.5-flash-lite`; override it with `Ai__Gemini__Model` when a different compatible Gemini model is intentionally selected.

An administrator can instead create a Gemini provider profile through the protected `/api/admin/ai-profiles` endpoints. Keys are protected before being saved to SQLite and are never returned in API responses. The local development data-protection key ring is stored under `App_Data/keys/` and intentionally ignored by Git; a real deployment must replace that development key storage with an appropriate managed key store.

The profile API accepts only the checked Gemini combinations below. It is not a free-text model setting:

| Model | Allowed reasoning levels | Default |
| --- | --- | --- |
| `gemini-3.5-flash-lite` | `minimal`, `low`, `medium`, `high` | `minimal` |
| `gemini-3.6-flash` | `minimal`, `low`, `medium`, `high` | `medium` |
| `gemini-3.7-flash` | `low`, `medium`, `high` | `medium` |

Changing the active profile applies to future matching evaluations only; historical `CVMatching` records are never silently recomputed. If no administrator profile is active, the API falls back to the local environment configuration. If no key is present at all, applications and recruiter matching still complete. Their stored matching evaluation is marked `not-configured` rather than inventing a score. Provider failures are recorded as `failed` without persisting exception details or API keys.

The administrative provider-profile experience is a later feature. It must keep keys server-side, redact them in responses and logs, and add role-aware quotas before exposing any chat or provider-management surface.
