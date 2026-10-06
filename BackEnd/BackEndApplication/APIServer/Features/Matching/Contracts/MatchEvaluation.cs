using APIServer.Features.Matching;

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
    string? FailureReason = null,
    int? DeterministicScore = null,
    int? DeterministicSkillScore = null,
    int? DeterministicExperienceScore = null,
    int? DeterministicEducationScore = null,
    int? DeterministicProjectAndCertificateScore = null,
    string EligibilityStatus = "unknown",
    string? EligibilityReason = null,
    string RulesVersion = DeterministicMatchScorer.RulesVersion,
    string? ReasoningLevel = null);
