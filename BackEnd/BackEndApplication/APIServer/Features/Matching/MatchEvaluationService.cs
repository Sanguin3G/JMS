using APIServer.Features.Matching.Contracts;
using APIServer.Models.Entity;

namespace APIServer.Features.Matching;

public sealed class MatchEvaluationService(IMatchEvaluationProvider provider) : IMatchEvaluationService
{
    public Task<MatchEvaluation> EvaluateAsync(
        JobDescription job,
        CurriculumVitae curriculumVitae,
        CancellationToken cancellationToken = default) =>
        EvaluateWithDeterministicScoreAsync(job, curriculumVitae, cancellationToken);

    private async Task<MatchEvaluation> EvaluateWithDeterministicScoreAsync(
        JobDescription job,
        CurriculumVitae curriculumVitae,
        CancellationToken cancellationToken)
    {
        var deterministic = DeterministicMatchScorer.Evaluate(job, curriculumVitae);
        if (deterministic.EligibilityStatus == "ineligible")
        {
            return new MatchEvaluation(
                "deterministic",
                "rules",
                "ineligible",
                0,
                deterministic.SkillScore,
                deterministic.ExperienceScore,
                deterministic.EducationScore,
                "This CV is not eligible for the selected job.",
                [],
                [],
                deterministic.EligibilityReason,
                deterministic.Score,
                deterministic.SkillScore,
                deterministic.ExperienceScore,
                deterministic.EducationScore,
                deterministic.ProjectAndCertificateScore,
                deterministic.EligibilityStatus,
                deterministic.EligibilityReason);
        }

        var evaluation = await provider.EvaluateAsync(job, curriculumVitae, cancellationToken);
        return evaluation with
        {
            DeterministicScore = deterministic.Score,
            DeterministicSkillScore = deterministic.SkillScore,
            DeterministicExperienceScore = deterministic.ExperienceScore,
            DeterministicEducationScore = deterministic.EducationScore,
            DeterministicProjectAndCertificateScore = deterministic.ProjectAndCertificateScore,
            EligibilityStatus = deterministic.EligibilityStatus,
            EligibilityReason = deterministic.EligibilityReason,
            RulesVersion = DeterministicMatchScorer.RulesVersion
        };
    }
}
