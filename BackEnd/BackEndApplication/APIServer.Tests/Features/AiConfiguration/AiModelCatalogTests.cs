using APIServer.Features.AiConfiguration;
using Xunit;

namespace APIServer.Tests.Features.AiConfiguration;

public sealed class AiModelCatalogTests
{
    [Fact]
    public void EachProviderHasAnEconomicAndStrongerChoiceWithValidDefaults()
    {
        foreach (var provider in new[] { "openai", "anthropic", "gemini" })
        {
            var options = AiModelCatalog.GetOptions().Where(x => x.Provider == provider && x.Tier != "legacy").ToList();
            Assert.Single(options, x => x.Tier == "economic");
            Assert.Single(options, x => x.Tier == "quality");
            foreach (var option in options)
                Assert.True(AiModelCatalog.TryResolve(provider, option.ModelId, null, out _, out _));
        }
        Assert.False(AiModelCatalog.TryResolve("openai", "gpt-6.1-sol", "none", out _, out _));
        Assert.False(AiModelCatalog.TryResolve("gemini", "gemini-3.8-flash", "minimal", out _, out _));
        Assert.True(AiModelCatalog.TryResolve("gemini", "gemini-3.1-flash-lite", "minimal", out _, out _));
    }

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
