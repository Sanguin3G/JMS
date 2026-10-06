using APIServer.Features.AiConfiguration;
using Xunit;

namespace APIServer.Tests.Features.AiConfiguration;

public sealed class AiModelCatalogTests
{
    [Fact]
    public void GetOptions_IncludesCostConsciousDefault()
    {
        var capability = AiModelCatalog.GetOptions()
            .Single(option => option.ModelId == AiModelCatalog.DefaultModelId);

        Assert.Equal(AiModelCatalog.ProviderId, capability.Provider);
        Assert.Equal(AiModelCatalog.DefaultReasoningLevel, capability.DefaultReasoningLevel);
        Assert.True(capability.SupportsMatching);
    }

    [Fact]
    public void TryResolve_RejectsUnknownProviderOrModel()
    {
        var resolved = AiModelCatalog.TryResolve(
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
        var resolved = AiModelCatalog.TryResolve(
            AiModelCatalog.ProviderId,
            "gemini-3.1-pro-preview",
            "minimal",
            out _,
            out _);

        Assert.False(resolved);
    }

    [Fact]
    public void TryResolve_UsesModelDefaultWhenReasoningIsOmitted()
    {
        var resolved = AiModelCatalog.TryResolve(
            AiModelCatalog.ProviderId,
            AiModelCatalog.DefaultModelId,
            null,
            out var capability,
            out var reasoningLevel);

        Assert.True(resolved);
        Assert.Equal(capability.DefaultReasoningLevel, reasoningLevel);
    }
}
