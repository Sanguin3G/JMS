namespace APIServer.Features.Faq.Contracts;

public interface IFaqService
{
    Task<IReadOnlyList<FaqEntryResponse>> SearchAsync(string? query, bool includeUnpublished = false, CancellationToken cancellationToken = default);
    Task<FaqChatResponse> AnswerAsync(string message, CancellationToken cancellationToken = default, string language = "vi");
    Task<FaqEntryResponse> CreateAsync(FaqEntryRequest request, CancellationToken cancellationToken = default);
    Task<FaqEntryResponse> UpdateAsync(int id, FaqEntryRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
