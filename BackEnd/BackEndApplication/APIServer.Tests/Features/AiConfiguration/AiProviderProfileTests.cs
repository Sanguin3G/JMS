using System.Security.Cryptography;
using System.Text.Json;
using APIServer.Features.AiConfiguration;
using APIServer.Features.AiConfiguration.Contracts;
using APIServer.Features.Matching;
using APIServer.Models;
using APIServer.Models.Entity;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace APIServer.Tests.Features.AiConfiguration;

public sealed class AiProviderProfileTests : IDisposable
{
    private readonly SqliteConnection connection = new("Data Source=:memory:");
    private readonly JMSDBContext db;
    private readonly AiProviderProfileService profiles;
    private readonly IAiProviderAdapter[] adapters = [new FailingAdapter()];

    public AiProviderProfileTests()
    {
        connection.Open();
        db = new JMSDBContext(new DbContextOptionsBuilder<JMSDBContext>().UseSqlite(connection).Options);
        db.Database.EnsureCreated();
        profiles = new(db, new EphemeralDataProtectionProvider(), adapters);
    }

    [Theory]
    [InlineData("gemini", "gemini-3.1-pro-preview", "minimal")]
    [InlineData("anthropic", "claude-haiku-4-5-20251001", "high")]
    [InlineData("openai", "gpt-5-mini", "budget-1024")]
    [InlineData("anthropic", "gpt-5-mini", "minimal")]
    public async Task InvalidProviderModelReasoningCombinationsAreRejected(string provider, string model, string reasoning)
    {
        await Assert.ThrowsAsync<ArgumentException>(() => profiles.CreateAsync(new()
        {
            Provider = provider, ModelId = model, ReasoningLevel = reasoning, DisplayName = "Test", ApiKey = "test-key"
        }));
        Assert.Empty(db.AiProviderProfiles);
    }

    [Fact]
    public async Task KeysAreProtectedAndNeverIncludedInSummariesAndCanBeRemoved()
    {
        var created = await CreateOpenAi();
        Assert.True(created.HasApiKey);
        Assert.DoesNotContain("test-key", db.AiProviderProfiles.Single().EncryptedApiKey);
        Assert.DoesNotContain("test-key", JsonSerializer.Serialize(await profiles.GetAllAsync()));
        var resolved = await profiles.GetActiveMatchingProfileAsync();
        Assert.Equal("openai", resolved!.Provider);
        Assert.Equal("test-key", resolved.ApiKey);

        var removed = await profiles.UpdateAsync(created.Id, new()
        {
            Provider = "openai", ModelId = "gpt-5-mini", DisplayName = "Test", RemoveApiKey = true
        });
        Assert.False(removed.HasApiKey);
        Assert.False(removed.IsDefaultForMatching);
        Assert.Null(await profiles.GetActiveMatchingProfileAsync());
        await Assert.ThrowsAsync<InvalidOperationException>(() => profiles.ActivateForMatchingAsync(created.Id));
    }

    [Fact]
    public async Task ChangingProviderRequiresItsOwnKey()
    {
        var created = await CreateOpenAi();
        await Assert.ThrowsAsync<ArgumentException>(() => profiles.UpdateAsync(created.Id, new()
        {
            Provider = "anthropic", ModelId = "claude-haiku-4-5-20251001", DisplayName = "Changed"
        }));
        Assert.Equal("openai", db.AiProviderProfiles.Single().Provider);
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task ProviderFailureAndUnreadableKeysPreserveAuthoritativeDeterministicScore(bool unreadableKey)
    {
        await CreateOpenAi();
        if (unreadableKey)
        {
            db.AiProviderProfiles.Single().EncryptedApiKey = "unreadable-key-ring-data";
            await db.SaveChangesAsync();
        }
        var provider = new AiMatchEvaluationProvider(new ConfigurationBuilder().Build(), profiles,
            NullLogger<AiMatchEvaluationProvider>.Instance, adapters);
        var matching = new MatchEvaluationService(provider);
        var result = await matching.EvaluateAsync(new JobDescription { CategoryId = 1, SkillRequirement = "Angular" },
            new CurriculumVitae { CategoryId = 1, Skills = [new Skill { Title = "Angular" }] });
        Assert.Equal("failed", result.Status);
        Assert.Equal("eligible", result.EligibilityStatus);
        Assert.True(result.DeterministicScore > 0);
        Assert.Null(result.Score);
        Assert.DoesNotContain("test-key", JsonSerializer.Serialize(result));
        var persisted = new CVMatching();
        MatchEvaluationPersistence.Apply(persisted, result);
        Assert.Equal(result.DeterministicScore / 100f, persisted.PercentMatching);
        if (!unreadableKey) Assert.Equal("minimal", result.ReasoningLevel);
    }

    private Task<AiProviderProfileSummary> CreateOpenAi() => profiles.CreateAsync(new()
    {
        Provider = "openai", ModelId = "gpt-5-mini", DisplayName = "Test", ApiKey = "test-key", IsDefaultForMatching = true
    });

    [Fact]
    public async Task SuccessfulEvaluationPreservesProviderReasoningAndBoundsUntrustedOutput()
    {
        await CreateOpenAi();
        var adapter = new SuccessfulAdapter();
        var provider = new AiMatchEvaluationProvider(new ConfigurationBuilder().Build(), profiles,
            NullLogger<AiMatchEvaluationProvider>.Instance, [adapter]);
        var result = await new MatchEvaluationService(provider).EvaluateAsync(
            new JobDescription { CategoryId = 1, SkillRequirement = "Angular", JobDetail = new string('x', 30_000) },
            new CurriculumVitae { CategoryId = 1, DisplayEmail = "private@example.test", Skills = [new Skill { Title = "Angular" }] });
        Assert.Equal("openai", result.Provider);
        Assert.Equal("gpt-5-mini", result.Model);
        Assert.Equal("minimal", result.ReasoningLevel);
        Assert.Equal("complete", result.Status);
        Assert.Equal(100, result.Score);
        Assert.Equal(1_000, result.Summary.Length);
        Assert.Equal(6, result.Strengths.Count);
        Assert.All(result.Strengths, strength => Assert.True(strength.Length <= 240));
        Assert.True(adapter.Prompt!.Length <= 18_000);
        Assert.DoesNotContain("private@example.test", adapter.Prompt);
        var persisted = new CVMatching();
        MatchEvaluationPersistence.Apply(persisted, result);
        Assert.Equal(result.DeterministicScore / 100f, persisted.PercentMatching);
        Assert.Contains("minimal", persisted.JSONMatching);
    }

    public void Dispose() { db.Dispose(); connection.Dispose(); }

    private sealed class FailingAdapter : IAiProviderAdapter
    {
        public string Provider => "openai";
        public Task TestAsync(ResolvedAiProfile profile, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task<string> GenerateAsync(ResolvedAiProfile profile, string prompt, CancellationToken cancellationToken) =>
            throw new HttpRequestException("Provider unavailable: test-key");
    }

    private sealed class SuccessfulAdapter : IAiProviderAdapter
    {
        public string Provider => "openai";
        public string? Prompt { get; private set; }
        public Task TestAsync(ResolvedAiProfile profile, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task<string> GenerateAsync(ResolvedAiProfile profile, string prompt, CancellationToken cancellationToken)
        {
            Prompt = prompt;
            return Task.FromResult(JsonSerializer.Serialize(new
            {
                score = 900, summary = new string('s', 2_000),
                strengths = Enumerable.Repeat(new string('a', 500), 10), gaps = Array.Empty<string>()
            }));
        }
    }
}
