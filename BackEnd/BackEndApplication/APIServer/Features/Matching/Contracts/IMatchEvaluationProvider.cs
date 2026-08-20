using APIServer.Models.Entity;

namespace APIServer.Features.Matching.Contracts;

public interface IMatchEvaluationProvider
{
    string ProviderName { get; }

    Task<MatchEvaluation> EvaluateAsync(
        JobDescription job,
        CurriculumVitae curriculumVitae,
        CancellationToken cancellationToken = default);
}
