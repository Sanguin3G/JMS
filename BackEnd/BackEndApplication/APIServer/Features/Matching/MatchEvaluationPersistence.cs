using APIServer.Features.Matching.Contracts;
using APIServer.Models.Entity;
using Newtonsoft.Json;

namespace APIServer.Features.Matching;

public static class MatchEvaluationPersistence
{
    public static void Apply(CVMatching matching, MatchEvaluation evaluation)
    {
        matching.JSONMatching = JsonConvert.SerializeObject(evaluation);
        matching.PercentMatching = (evaluation.DeterministicScore ?? evaluation.Score) / 100f;
        matching.MatchingRulesVersion = evaluation.RulesVersion;
        matching.MatchingProvider = evaluation.Provider;
        matching.MatchingModel = evaluation.Model;
        matching.MatchingStatus = evaluation.Status;
        matching.MatchingEligibilityStatus = evaluation.EligibilityStatus;
        matching.MatchingEligibilityReason = evaluation.EligibilityReason;
        matching.MatchingExplanation = evaluation.Summary;
        matching.MatchingFailureReason = evaluation.FailureReason;
        matching.MatchingEvaluatedAtUtc = DateTime.UtcNow;
    }
}
