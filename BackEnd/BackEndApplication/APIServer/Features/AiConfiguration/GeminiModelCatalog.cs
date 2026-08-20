namespace APIServer.Features.AiConfiguration;

public sealed record GeminiModelOption(
    string ModelId,
    string Label,
    string DefaultReasoningLevel,
    IReadOnlyList<string> ReasoningLevels);

public static class GeminiModelCatalog
{
    public const string DefaultModelId = "gemini-3.5-flash-lite";
    public const string DefaultReasoningLevel = "minimal";

    private static readonly IReadOnlyDictionary<string, GeminiModelOption> Options =
        new Dictionary<string, GeminiModelOption>(StringComparer.Ordinal)
        {
            [DefaultModelId] = new(
                DefaultModelId,
                "Gemini 3.5 Flash-Lite — low-cost matching",
                DefaultReasoningLevel,
                ["minimal", "low", "medium", "high"]),
            ["gemini-3.6-flash"] = new(
                "gemini-3.6-flash",
                "Gemini 3.6 Flash — balanced",
                "medium",
                ["minimal", "low", "medium", "high"]),
            ["gemini-3.7-flash"] = new(
                "gemini-3.7-flash",
                "Gemini 3.7 Flash — stronger reasoning",
                "medium",
                ["low", "medium", "high"])
        };

    public static IReadOnlyList<GeminiModelOption> GetOptions() => Options.Values.ToList();

    public static bool TryResolve(
        string? modelId,
        string? reasoningLevel,
        out GeminiModelOption model,
        out string resolvedReasoningLevel)
    {
        if (string.IsNullOrWhiteSpace(modelId) || !Options.TryGetValue(modelId, out model!))
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
