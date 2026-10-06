# AI choices in JMS

Deterministic matching decides eligibility and scores. A configured AI provider
adds bounded explanation; it never selects or rejects applicants. Calibration
is separate, authored interactive fiction and makes no AI requests.

## Curated models

Reviewed against official API documentation on **2026-10-06**. Each provider has
an economical option and a stronger option. Start with the economical model;
compare explanations on representative fictional CV/job pairs before spending
more. Model availability depends on the API account, region, and provider.

| Provider | Economical | Stronger | JMS reasoning controls |
| --- | --- | --- | --- |
| OpenAI | GPT-6 Luna (`gpt-6-luna`) | GPT-6.1 Sol (`gpt-6.1-sol`) | Luna: none/low/medium/high; Sol: low/medium/high |
| Anthropic | Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) | Claude Sonnet 5.5 (`claude-sonnet-5-5`) | Haiku: disabled or 1,024-token thinking budget; Sonnet: low/medium/high effort |
| Google | Gemini 3.5 Flash-Lite (`gemini-3.5-flash-lite`) | Gemini 3.8 Flash (`gemini-3.8-flash`) | Flash-Lite: minimal/low/medium/high; Flash: low/medium/high |

JMS exposes a bounded subset of supported reasoning options. Sol does not accept
`none`; Gemini 3.8 Flash does not accept `minimal`. Sonnet 5.5 uses provider effort
controls and `between_tools` thinking, rather than the old Haiku budget payload.
The backend capability catalogue supplies the frontend options. Historical
profiles retain their compatible model definitions and historical evaluations
keep their original provider/model metadata.

Prices change, so the application does not present a fixed cost quotation.
Google's current 3.8 Flash pricing explicitly changes on 2027-01-01. Consult the
provider pricing page before enabling a profile. Connection tests are bounded;
they do not establish explanation quality or guarantee later quota availability.

Official references:

- [GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna)
- [GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol)
- [Claude models](https://platform.claude.com/docs/en/models/overview)
- [Haiku 4.5](https://platform.claude.com/docs/en/models/haiku-4-5/overview)
- [Sonnet 5.5](https://platform.claude.com/docs/en/models/sonnet-5-5/overview)
- [Claude effort](https://platform.claude.com/docs/en/build-with-claude/effort)
- [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Gemini 3.5 Flash-Lite](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite)
- [Gemini 3.8 Flash](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash)
- [Gemini thinking controls](https://ai.google.dev/gemini-api/docs/thinking)
- [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing)

## Keys and failure behavior

Keys remain server-side, encrypted using ASP.NET Data Protection. Persist the key
ring alongside the SQLite database: losing it makes stored credentials unreadable.
The UI receives only key-presence metadata. Replacing a key requires entering a
new value; stored keys cannot be revealed. AI failure preserves deterministic
matching and records fallback status. Source size, output, and request time are
bounded. CV and job text are treated as untrusted content.

See [development](development.md) for setup and [deployment](deployment.md) for
key-ring persistence. Live calls need real provider credentials; mocked adapter
verification must not be described as a successful live-provider integration.
