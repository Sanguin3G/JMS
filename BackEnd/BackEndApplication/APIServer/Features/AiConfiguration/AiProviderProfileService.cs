using APIServer.Features.AiConfiguration.Contracts;
using APIServer.Models;
using APIServer.Models.Entity;
using Google.GenAI;
using Google.GenAI.Types;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;

namespace APIServer.Features.AiConfiguration;

public sealed class AiProviderProfileService(JMSDBContext dbContext, IDataProtectionProvider dataProtectionProvider)
    : IAiProviderProfileService
{
    private readonly IDataProtector _keyProtector = dataProtectionProvider.CreateProtector("JMS.AiProviderProfile.ApiKey.v1");

    public async Task<IReadOnlyList<AiProviderProfileSummary>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await dbContext.AiProviderProfiles
            .AsNoTracking()
            .OrderByDescending(profile => profile.IsDefaultForMatching)
            .ThenBy(profile => profile.DisplayName)
            .Select(profile => ToSummary(profile))
            .ToListAsync(cancellationToken);

    public async Task<AiProviderProfileSummary> CreateAsync(UpsertAiProviderProfileRequest request, CancellationToken cancellationToken = default)
    {
        var profile = new AiProviderProfile();
        Apply(profile, request, requireApiKey: true);

        if (profile.IsDefaultForMatching)
        {
            await ClearDefaultMatchingProfileAsync(cancellationToken);
        }

        dbContext.AiProviderProfiles.Add(profile);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ToSummary(profile);
    }

    public async Task<AiProviderProfileSummary> UpdateAsync(int id, UpsertAiProviderProfileRequest request, CancellationToken cancellationToken = default)
    {
        var profile = await dbContext.AiProviderProfiles.FindAsync([id], cancellationToken)
            ?? throw new KeyNotFoundException("AI provider profile was not found.");

        Apply(profile, request, requireApiKey: false);
        if (profile.IsDefaultForMatching)
        {
            await ClearDefaultMatchingProfileAsync(cancellationToken, profile.Id);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return ToSummary(profile);
    }

    public async Task ActivateForMatchingAsync(int id, CancellationToken cancellationToken = default)
    {
        var profile = await dbContext.AiProviderProfiles.FindAsync([id], cancellationToken)
            ?? throw new KeyNotFoundException("AI provider profile was not found.");

        if (!profile.IsEnabled)
        {
            throw new InvalidOperationException("An inactive AI provider profile cannot be activated.");
        }

        await ClearDefaultMatchingProfileAsync(cancellationToken, profile.Id);
        profile.IsDefaultForMatching = true;
        profile.UpdatedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<AiConnectionTestResult> TestConnectionAsync(int id, CancellationToken cancellationToken = default)
    {
        var profile = await dbContext.AiProviderProfiles
            .AsNoTracking()
            .SingleOrDefaultAsync(candidate => candidate.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException("AI provider profile was not found.");

        var testedAtUtc = DateTime.UtcNow;
        if (!profile.IsEnabled)
        {
            return new(false, "Profile is disabled.", profile.Provider, profile.ModelId, testedAtUtc);
        }

        if (string.IsNullOrWhiteSpace(profile.EncryptedApiKey))
        {
            return new(false, "No API key is stored for this profile.", profile.Provider, profile.ModelId, testedAtUtc);
        }

        if (!GeminiModelCatalog.TryResolve(profile.Provider, profile.ModelId, profile.ReasoningLevel, out var capability, out _))
        {
            return new(false, "The saved model configuration is no longer supported.", profile.Provider, profile.ModelId, testedAtUtc);
        }

        try
        {
            var apiKey = _keyProtector.Unprotect(profile.EncryptedApiKey);
            using var timeoutCancellation = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            timeoutCancellation.CancelAfter(TimeSpan.FromSeconds(10));
            using var client = new Client(apiKey: apiKey);
            var response = await client.Models.GenerateContentAsync(
                model: profile.ModelId,
                contents: "Reply with the single word OK.",
                config: new GenerateContentConfig
                {
                    MaxOutputTokens = 8,
                    ThinkingConfig = new ThinkingConfig { ThinkingLevel = ThinkingLevel.Minimal }
                },
                cancellationToken: timeoutCancellation.Token);

            var text = response.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;
            return string.IsNullOrWhiteSpace(text)
                ? new(false, "The provider returned no response.", capability.Provider, profile.ModelId, testedAtUtc)
                : new(true, "Connection succeeded.", capability.Provider, profile.ModelId, testedAtUtc);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (OperationCanceledException)
        {
            return new(false, "The connection test timed out after 10 seconds.", profile.Provider, profile.ModelId, testedAtUtc);
        }
        catch
        {
            return new(false, "The provider rejected the connection test or is unavailable.", profile.Provider, profile.ModelId, testedAtUtc);
        }
    }

    public async Task<ResolvedGeminiProfile?> GetActiveGeminiMatchingProfileAsync(CancellationToken cancellationToken = default)
    {
        var profile = await dbContext.AiProviderProfiles
            .AsNoTracking()
            .SingleOrDefaultAsync(candidate => candidate.Provider == "gemini" && candidate.IsEnabled && candidate.IsDefaultForMatching, cancellationToken);

        if (profile is null || string.IsNullOrWhiteSpace(profile.EncryptedApiKey)
            || !GeminiModelCatalog.TryResolve(profile.Provider, profile.ModelId, profile.ReasoningLevel, out _, out var reasoningLevel))
        {
            return null;
        }

        return new ResolvedGeminiProfile(
            _keyProtector.Unprotect(profile.EncryptedApiKey),
            profile.ModelId,
            reasoningLevel);
    }

    private void Apply(AiProviderProfile profile, UpsertAiProviderProfileRequest request, bool requireApiKey)
    {
        if (!GeminiModelCatalog.TryResolve(request.Provider, request.ModelId, request.ReasoningLevel, out var capability, out var reasoningLevel))
        {
            throw new ArgumentException("The selected provider, model, and reasoning level are not an approved combination.");
        }

        if (!capability.SupportsMatching && request.IsDefaultForMatching)
        {
            throw new ArgumentException("The selected model cannot be used for matching.");
        }

        if (!capability.SupportsAssistant && request.IsEnabledForAssistant)
        {
            throw new ArgumentException("The selected model cannot be used for the assistant.");
        }

        if (requireApiKey && string.IsNullOrWhiteSpace(request.ApiKey))
        {
            throw new ArgumentException("An API key is required when creating an AI provider profile.");
        }

        profile.Provider = GeminiModelCatalog.ProviderId;
        profile.DisplayName = request.DisplayName.Trim();
        profile.ModelId = request.ModelId;
        profile.ReasoningLevel = reasoningLevel;
        profile.IsEnabled = request.IsEnabled;
        profile.IsDefaultForMatching = request.IsDefaultForMatching && request.IsEnabled;
        profile.IsEnabledForAssistant = request.IsEnabledForAssistant && request.IsEnabled;
        profile.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(request.ApiKey))
        {
            profile.EncryptedApiKey = _keyProtector.Protect(request.ApiKey.Trim());
        }
    }

    private async Task ClearDefaultMatchingProfileAsync(CancellationToken cancellationToken, int? exceptId = null)
    {
        var profiles = await dbContext.AiProviderProfiles
            .Where(profile => profile.IsDefaultForMatching && (exceptId == null || profile.Id != exceptId))
            .ToListAsync(cancellationToken);

        foreach (var profile in profiles)
        {
            profile.IsDefaultForMatching = false;
            profile.UpdatedAt = DateTime.UtcNow;
        }
    }

    private static AiProviderProfileSummary ToSummary(AiProviderProfile profile) => new(
        profile.Id,
        profile.Provider,
        profile.DisplayName,
        profile.ModelId,
        profile.ReasoningLevel,
        profile.IsEnabled,
        profile.IsDefaultForMatching,
        profile.IsEnabledForAssistant,
        !string.IsNullOrWhiteSpace(profile.EncryptedApiKey),
        profile.UpdatedAt);
}
