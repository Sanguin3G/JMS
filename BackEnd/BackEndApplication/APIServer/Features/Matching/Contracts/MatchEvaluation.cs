namespace APIServer.Features.Matching.Contracts;

public sealed record MatchEvaluation(
    string Provider,
    string Model,
    string Status,
    int? Score,
    int? SkillScore,
    int? ExperienceScore,
    int? EducationScore,
    string Summary,
    IReadOnlyList<string> Strengths,
    IReadOnlyList<string> Gaps,
    string? FailureReason = null);
