namespace APIServer.Features.AiConfiguration;

public sealed record AiModelCapability(
 string Provider, string ModelId, string Label, string DefaultReasoningLevel, IReadOnlyList<string> ReasoningLevels,
 bool SupportsMatching, bool SupportsAssistant, string ReasoningControl = "thinking-level", string Tier = "legacy");

/// <summary>Curated choices verified against official model docs on 2026-10-06.
/// Legacy choices remain resolvable for existing profiles and historical evaluations.</summary>
public static class AiModelCatalog
{
    public const string ProviderId = "gemini";
    public const string DefaultModelId = "gemini-3.5-flash-lite";
    public const string DefaultReasoningLevel = "minimal";
    private static readonly IReadOnlyDictionary<string, AiModelCapability> Options =
    new Dictionary<string, AiModelCapability>(StringComparer.Ordinal)
    {
        [DefaultModelId] = new("gemini", DefaultModelId, "Gemini 3.5 Flash-Lite", "minimal", ["minimal", "low", "medium", "high"], true, false, "thinking-level", "economic"),
        ["gemini-3.1-flash-lite"] = new("gemini", "gemini-3.1-flash-lite", "Gemini 3.1 Flash-Lite (legacy)", "minimal", ["minimal", "low", "medium", "high"], true, false),
        ["gemini-3.8-flash"] = new("gemini", "gemini-3.8-flash", "Gemini 3.8 Flash", "low", ["low", "medium", "high"], true, false, "thinking-level", "quality"),
        ["gpt-6-luna"] = new("openai", "gpt-6-luna", "GPT-6 Luna", "none", ["none", "low", "medium", "high"], true, false, "reasoning-effort", "economic"),
        ["gpt-6.1-sol"] = new("openai", "gpt-6.1-sol", "GPT-6.1 Sol", "low", ["low", "medium", "high"], true, false, "reasoning-effort", "quality"),
        ["claude-haiku-4-5-20251001"] = new("anthropic", "claude-haiku-4-5-20251001", "Claude Haiku 4.5", "disabled", ["disabled", "budget-1024"], true, false, "thinking-budget", "economic"),
        ["claude-sonnet-5-5"] = new("anthropic", "claude-sonnet-5-5", "Claude Sonnet 5.5", "low", ["low", "medium", "high"], true, false, "effort", "quality"),
        ["gemini-3-flash-preview"] = new("gemini", "gemini-3-flash-preview", "Gemini 3 Flash (legacy preview)", "high", ["minimal", "low", "medium", "high"], true, false),
        ["gemini-3.1-pro-preview"] = new("gemini", "gemini-3.1-pro-preview", "Gemini 3.1 Pro (legacy preview)", "high", ["low", "medium", "high"], true, false),
        ["gpt-5-mini"] = new("openai", "gpt-5-mini", "GPT-5 mini (legacy)", "minimal", ["minimal", "low", "medium", "high"], true, false, "reasoning-effort")
    };
    public static IReadOnlyList<AiModelCapability> GetOptions() => Options.Values.ToList();
    public static bool TryResolve(string? provider, string? modelId, string? reasoningLevel, out AiModelCapability model, out string resolvedReasoningLevel)
    {
        if (string.IsNullOrWhiteSpace(modelId) || !Options.TryGetValue(modelId.Trim(), out model!) || !string.Equals(provider, model.Provider, StringComparison.OrdinalIgnoreCase))
        {
            model = Options[DefaultModelId]; resolvedReasoningLevel = string.Empty; return false;
        }
        resolvedReasoningLevel = string.IsNullOrWhiteSpace(reasoningLevel) ? model.DefaultReasoningLevel : reasoningLevel.Trim().ToLowerInvariant();
        return model.ReasoningLevels.Contains(resolvedReasoningLevel, StringComparer.Ordinal);
    }
}
