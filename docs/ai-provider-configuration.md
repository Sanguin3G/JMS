# AI provider configuration

JMS does not store provider keys in source control. The initial development provider is Gemini, selected through `IMatchEvaluationProvider` so other provider adapters can be added without changing application and recruiter matching flows.

Set `GEMINI_API_KEY` in the process environment before starting the API. The default model is `gemini-3.5-flash-lite`; override it with `Ai__Gemini__Model` when a different compatible Gemini model is intentionally selected.

If no key is present, applications and recruiter matching still complete. Their stored matching evaluation is marked `not-configured` rather than inventing a score. Provider failures are recorded as `failed` without persisting exception details or API keys.

The administrative provider-profile experience is a later feature. It must keep keys server-side, redact them in responses and logs, and add role-aware quotas before exposing any chat or provider-management surface.
