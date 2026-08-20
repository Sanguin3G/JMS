# Runtime configuration

JMS keeps credentials out of tracked configuration. The API reads nested settings from the normal .NET configuration providers, so environment variables use double underscores:

```text
Jwt__Key=<a stable production signing key>
EmailSettings__Username=<SMTP account>
EmailSettings__Password=<SMTP app password>
GEMINI_API_KEY=<optional local Gemini fallback key>
```

`Jwt__Key` is required outside Development. In Development, the API creates an ephemeral signing key when one is not supplied; local tokens therefore become invalid after a restart. SMTP credentials are only required when a forgot-password email is sent.

The values previously present in `appsettings.json` should be treated as exposed. Rotating them is an operational task outside this repository change.
