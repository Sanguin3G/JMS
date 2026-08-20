using System.ComponentModel.DataAnnotations;

namespace APIServer.Features.AiConfiguration.Contracts;

public sealed class UpsertAiProviderProfileRequest
{
    [Required, StringLength(100)]
    public string DisplayName { get; init; } = string.Empty;

    [Required, StringLength(100)]
    public string ModelId { get; init; } = GeminiModelCatalog.DefaultModelId;

    [StringLength(20)]
    public string? ReasoningLevel { get; init; }

    [StringLength(500)]
    public string? ApiKey { get; init; }

    public bool IsEnabled { get; init; } = true;
    public bool IsDefaultForMatching { get; init; }
    public bool IsEnabledForAssistant { get; init; }
}
