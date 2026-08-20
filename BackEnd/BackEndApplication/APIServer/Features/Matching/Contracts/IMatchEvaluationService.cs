using APIServer.Models.Entity;

namespace APIServer.Features.Matching.Contracts;

public interface IMatchEvaluationService
{
    Task<MatchEvaluation> EvaluateAsync(
        JobDescription job,
        CurriculumVitae curriculumVitae,
        CancellationToken cancellationToken = default);
}
