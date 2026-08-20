namespace APIServer.Features.AiConfiguration.Contracts;

public sealed record ResolvedGeminiProfile(string ApiKey, string ModelId, string ReasoningLevel);
