namespace APIServer.Features.AiConfiguration;

public sealed record AiModelCapability(
    string Provider,
    string ModelId,
    string Label,
    string DefaultReasoningLevel,
    IReadOnlyList<string> ReasoningLevels,
    bool SupportsMatching,
    bool SupportsAssistant,
    string ReasoningControl = "thinking-level");

/// <summary>
/// The server-side provider capability catalogue. Model IDs are intentionally allow-listed;
/// the admin UI cannot save arbitrary or retired provider settings.
/// </summary>
public static class AiModelCatalog
{
    public const string ProviderId = "gemini";
    public const string DefaultModelId = "gemini-3.1-flash-lite";
    public const string DefaultReasoningLevel = "minimal";

    private static readonly IReadOnlyDictionary<string, AiModelCapability> Options =
        new Dictionary<string, AiModelCapability>(StringComparer.Ordinal)
        {
            [DefaultModelId] = new(
                ProviderId,
                DefaultModelId,
                "Gemini 3.1 Flash-Lite — cost-conscious matching",
                DefaultReasoningLevel,
                ["minimal", "low", "medium", "high"],
                SupportsMatching: true,
                SupportsAssistant: false),
            ["gemini-3-flash-preview"] = new(
                ProviderId,
                "gemini-3-flash-preview",
                "Gemini 3 Flash — preview quality",
                "high",
                ["minimal", "low", "medium", "high"],
                SupportsMatching: true,
                SupportsAssistant: false),
            ["gemini-3.1-pro-preview"] = new(
                ProviderId,
                "gemini-3.1-pro-preview",
                "Gemini 3.1 Pro — preview reasoning",
                "high",
                ["low", "medium", "high"],
                SupportsMatching: true,
                SupportsAssistant: false),
            ["gpt-5-mini"] = new("openai", "gpt-5-mini", "OpenAI GPT-5 mini", "minimal",
                ["minimal", "low", "medium", "high"], true, false, "reasoning-effort"),
            ["claude-haiku-4-5-20251001"] = new("anthropic", "claude-haiku-4-5-20251001", "Anthropic Claude Haiku 4.5", "disabled",
                ["disabled", "budget-1024"], true, false, "thinking-budget"),
        };

    public static IReadOnlyList<AiModelCapability> GetOptions() => Options.Values.ToList();

    public static bool TryResolve(
        string? provider,
        string? modelId,
        string? reasoningLevel,
        out AiModelCapability model,
        out string resolvedReasoningLevel)
    {
        if (string.IsNullOrWhiteSpace(modelId)
            || !Options.TryGetValue(modelId.Trim(), out model!)
            || !string.Equals(provider, model.Provider, StringComparison.OrdinalIgnoreCase))
        {
            model = Options[DefaultModelId];
            resolvedReasoningLevel = string.Empty;
            return false;
        }

        resolvedReasoningLevel = string.IsNullOrWhiteSpace(reasoningLevel)
            ? model.DefaultReasoningLevel
            : reasoningLevel.Trim().ToLowerInvariant();

        return model.ReasoningLevels.Contains(resolvedReasoningLevel, StringComparer.Ordinal);
    }
}
