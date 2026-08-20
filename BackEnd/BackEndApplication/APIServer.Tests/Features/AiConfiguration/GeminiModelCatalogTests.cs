using APIServer.Features.AiConfiguration;
using Xunit;

namespace APIServer.Tests.Features.AiConfiguration;

public sealed class GeminiModelCatalogTests
{
    [Fact]
    public void GetOptions_IncludesCostConsciousDefault()
    {
        var capability = GeminiModelCatalog.GetOptions()
            .Single(option => option.ModelId == GeminiModelCatalog.DefaultModelId);

        Assert.Equal(GeminiModelCatalog.ProviderId, capability.Provider);
        Assert.Equal(GeminiModelCatalog.DefaultReasoningLevel, capability.DefaultReasoningLevel);
        Assert.True(capability.SupportsMatching);
    }

    [Fact]
    public void TryResolve_RejectsUnknownProviderOrModel()
    {
        var resolved = GeminiModelCatalog.TryResolve(
            "openai",
            "unknown-model",
            "minimal",
            out _,
            out _);

        Assert.False(resolved);
    }

    [Fact]
    public void TryResolve_RejectsUnsupportedReasoningLevel()
    {
        var resolved = GeminiModelCatalog.TryResolve(
            GeminiModelCatalog.ProviderId,
            "gemini-3.1-pro-preview",
            "minimal",
            out _,
            out _);

        Assert.False(resolved);
    }

    [Fact]
    public void TryResolve_UsesModelDefaultWhenReasoningIsOmitted()
    {
        var resolved = GeminiModelCatalog.TryResolve(
            GeminiModelCatalog.ProviderId,
            GeminiModelCatalog.DefaultModelId,
            null,
            out var capability,
            out var reasoningLevel);

        Assert.True(resolved);
        Assert.Equal(capability.DefaultReasoningLevel, reasoningLevel);
    }
}
