using APIServer.Features.Faq.Contracts;
using APIServer.Models;
using APIServer.Models.Entity;
using Microsoft.EntityFrameworkCore;

namespace APIServer.Features.Faq;

public sealed class FaqService(JMSDBContext dbContext) : IFaqService
{
    public async Task<IReadOnlyList<FaqEntryResponse>> SearchAsync(
        string? query,
        bool includeUnpublished = false,
        CancellationToken cancellationToken = default)
    {
        var entries = await dbContext.FaqEntries
            .AsNoTracking()
            .Where(entry => includeUnpublished || entry.IsPublished)
            .OrderBy(entry => entry.SortOrder)
            .ThenBy(entry => entry.Id)
            .ToListAsync(cancellationToken);

        var tokens = Tokens(query);
        if (tokens.Count == 0)
        {
            return entries.Select(ToResponse).Take(20).ToList();
        }

        return entries
            .Select(entry => new { Entry = entry, Score = Score(entry, tokens) })
            .Where(item => item.Score > 0)
            .OrderByDescending(item => item.Score)
            .ThenBy(item => item.Entry.SortOrder)
            .Take(20)
            .Select(item => ToResponse(item.Entry))
            .ToList();
    }

    public async Task<FaqChatResponse> AnswerAsync(string message, CancellationToken cancellationToken = default)
    {
        var matches = await SearchAsync(message, cancellationToken: cancellationToken);
        var match = matches.FirstOrDefault();
        return match is null
            ? new FaqChatResponse(
                "Chưa tìm thấy câu trả lời trong trợ giúp JMS. Hãy thử hỏi về việc làm, CV, matching hoặc cài đặt AI.",
                "curated-faq-fallback",
                false,
                null)
            : new FaqChatResponse(match.Answer, "curated-faq", false, match.Id);
    }

    public async Task<FaqEntryResponse> CreateAsync(FaqEntryRequest request, CancellationToken cancellationToken = default)
    {
        var entry = new FaqEntry();
        Apply(entry, request);
        entry.CreatedAt = entry.UpdatedAt = DateTime.UtcNow;
        dbContext.FaqEntries.Add(entry);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ToResponse(entry);
    }

    public async Task<FaqEntryResponse> UpdateAsync(int id, FaqEntryRequest request, CancellationToken cancellationToken = default)
    {
        var entry = await dbContext.FaqEntries.FindAsync([id], cancellationToken)
            ?? throw new KeyNotFoundException("FAQ entry was not found.");
        Apply(entry, request);
        entry.UpdatedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return ToResponse(entry);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var entry = await dbContext.FaqEntries.FindAsync([id], cancellationToken)
            ?? throw new KeyNotFoundException("FAQ entry was not found.");
        dbContext.FaqEntries.Remove(entry);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static void Apply(FaqEntry entry, FaqEntryRequest request)
    {
        entry.Question = request.Question.Trim();
        entry.Answer = request.Answer.Trim();
        entry.Keywords = request.Keywords?.Trim();
        entry.Category = string.IsNullOrWhiteSpace(request.Category) ? "JMS basics" : request.Category.Trim();
        entry.IsPublished = request.IsPublished;
        entry.SortOrder = request.SortOrder;
    }

    private static int Score(FaqEntry entry, IReadOnlySet<string> tokens)
    {
        var question = Tokens(entry.Question);
        var answer = Tokens(entry.Answer);
        var keywords = Tokens(entry.Keywords);
        return tokens.Sum(token => question.Contains(token) ? 5 : keywords.Contains(token) ? 4 : answer.Contains(token) ? 1 : 0);
    }

    private static HashSet<string> Tokens(string? value) =>
        new((value ?? string.Empty)
            .ToLowerInvariant()
            .Split([' ', '\t', '\r', '\n', ',', '.', ';', ':', '/', '\\', '-', '_', '?', '!'], StringSplitOptions.RemoveEmptyEntries)
            .Where(token => token.Length > 2), StringComparer.Ordinal);

    private static FaqEntryResponse ToResponse(FaqEntry entry) => new(
        entry.Id,
        entry.Question,
        entry.Answer,
        entry.Keywords,
        entry.Category,
        entry.IsPublished,
        entry.SortOrder,
        entry.UpdatedAt);
}
