namespace APIServer.Features.AiConfiguration.Contracts;

public sealed record AiProviderProfileSummary(
    int Id,
    string Provider,
    string DisplayName,
    string ModelId,
    string ReasoningLevel,
    bool IsEnabled,
    bool IsDefaultForMatching,
    bool IsEnabledForAssistant,
    bool HasApiKey,
    DateTime UpdatedAt);
