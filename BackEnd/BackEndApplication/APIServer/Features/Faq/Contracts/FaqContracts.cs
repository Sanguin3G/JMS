using System.ComponentModel.DataAnnotations;

namespace APIServer.Features.Faq.Contracts;

public sealed record FaqEntryResponse(
    int Id,
    string Question,
    string Answer,
    string? Keywords,
    string Category,
    bool IsPublished,
    int SortOrder,
    DateTime UpdatedAt,
    string? QuestionEn = null,
    string? AnswerEn = null);

public sealed class FaqEntryRequest
{
    [Required, StringLength(200)]
    public string Question { get; set; } = string.Empty;

    [Required, StringLength(4000)]
    public string Answer { get; set; } = string.Empty;

    [StringLength(200)]
    public string? QuestionEn { get; set; }

    [StringLength(4000)]
    public string? AnswerEn { get; set; }

    [StringLength(500)]
    public string? Keywords { get; set; }

    [StringLength(80)]
    public string Category { get; set; } = "JMS basics";

    public bool IsPublished { get; set; } = true;
    public int SortOrder { get; set; }
}

public sealed class FaqChatRequest
{
    [Required, StringLength(500, MinimumLength = 1)]
    public string Message { get; set; } = string.Empty;

    [RegularExpression("^(vi|en)$")]
    public string Language { get; set; } = "vi";
}

public sealed record FaqChatResponse(
    string Answer,
    string Source,
    bool AiAvailable,
    int? MatchedFaqId);
