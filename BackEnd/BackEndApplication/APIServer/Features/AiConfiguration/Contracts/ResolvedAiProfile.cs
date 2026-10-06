namespace APIServer.Features.AiConfiguration.Contracts;

public sealed record ResolvedAiProfile(string Provider, string ApiKey, string ModelId, string ReasoningLevel);
