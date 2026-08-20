namespace APIServer.Features.AiConfiguration.Contracts;

public interface IAiProviderProfileService
{
    Task<IReadOnlyList<AiProviderProfileSummary>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<AiProviderProfileSummary> CreateAsync(UpsertAiProviderProfileRequest request, CancellationToken cancellationToken = default);
    Task<AiProviderProfileSummary> UpdateAsync(int id, UpsertAiProviderProfileRequest request, CancellationToken cancellationToken = default);
    Task ActivateForMatchingAsync(int id, CancellationToken cancellationToken = default);
    Task<ResolvedGeminiProfile?> GetActiveGeminiMatchingProfileAsync(CancellationToken cancellationToken = default);
}
