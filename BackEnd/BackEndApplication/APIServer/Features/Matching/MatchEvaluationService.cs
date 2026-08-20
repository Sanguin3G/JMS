using APIServer.Features.Matching.Contracts;
using APIServer.Models.Entity;

namespace APIServer.Features.Matching;

public sealed class MatchEvaluationService(IMatchEvaluationProvider provider) : IMatchEvaluationService
{
    public Task<MatchEvaluation> EvaluateAsync(
        JobDescription job,
        CurriculumVitae curriculumVitae,
        CancellationToken cancellationToken = default) =>
        provider.EvaluateAsync(job, curriculumVitae, cancellationToken);
}
