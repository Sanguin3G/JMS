using APIServer.Models.Entity;

namespace APIServer.Features.Matching;

public static class DeterministicMatchScorer
{
    public const string RulesVersion = "deterministic-v1";

    public static DeterministicMatchResult Evaluate(JobDescription job, CurriculumVitae cv)
    {
        if (job.CategoryId.HasValue && cv.CategoryId.HasValue && job.CategoryId != cv.CategoryId)
        {
            return new DeterministicMatchResult(
                0,
                "ineligible",
                "The CV category does not match the job category.",
                0,
                0,
                0,
                0);
        }

        var candidateText = string.Join(" ",
            cv.CareerGoal,
            string.Join(" ", cv.Skills?.Select(skill => $"{skill.Title} {skill.SkillDescription}") ?? []),
            string.Join(" ", cv.JobExperiences?.Select(experience => $"{experience.Position} {experience.Description}") ?? []),
            string.Join(" ", cv.Educations?.Select(education => $"{education.MajorName} {education.Description}") ?? []),
            string.Join(" ", cv.Projects?.Select(project => $"{project.ProjectName} {project.Description}") ?? []),
            string.Join(" ", cv.Certificates?.Select(certificate => $"{certificate.CertificateName} {certificate.CertificateProvider}") ?? []));

        var skillScore = Score(job.SkillRequirement, candidateText);
        var experienceScore = Score(job.ExperienceRequirement, string.Join(" ", cv.JobExperiences?.Select(experience => $"{experience.Position} {experience.Description}") ?? []));
        var educationScore = Score(job.EducationRequirement, string.Join(" ", cv.Educations?.Select(education => $"{education.MajorName} {education.Description}") ?? []));
        var projectAndCertificateScore = Average(
            Score(job.ProjectRequirement, string.Join(" ", cv.Projects?.Select(project => $"{project.ProjectName} {project.Description}") ?? [])),
            Score(job.CertificateRequirement, string.Join(" ", cv.Certificates?.Select(certificate => $"{certificate.CertificateName} {certificate.CertificateProvider}") ?? [])));

        var score = (int)Math.Round(skillScore * 0.5 + experienceScore * 0.25 + educationScore * 0.15 + projectAndCertificateScore * 0.1);
        return new DeterministicMatchResult(
            Math.Clamp(score, 0, 100),
            "eligible",
            null,
            skillScore,
            experienceScore,
            educationScore,
            projectAndCertificateScore);
    }

    private static int Score(string? requirement, string candidateText)
    {
        var requiredTokens = Tokens(requirement);
        if (requiredTokens.Count == 0)
        {
            return 100;
        }

        var candidateTokens = Tokens(candidateText);
        var matchedTokens = requiredTokens.Count(token => candidateTokens.Contains(token));
        return (int)Math.Round(matchedTokens * 100d / requiredTokens.Count);
    }

    private static int Average(int left, int right) => (int)Math.Round((left + right) / 2d);

    private static HashSet<string> Tokens(string? value) =>
        new((value ?? string.Empty)
            .ToLowerInvariant()
            .Split([' ', '\t', '\r', '\n', ',', '.', ';', ':', '/', '\\', '-', '_', '(', ')', '[', ']', '|'], StringSplitOptions.RemoveEmptyEntries)
            .Where(token => token.Length > 2)
            .Where(token => token is not "the" and not "and" and not "with" and not "for" and not "from"), StringComparer.Ordinal);
}

public sealed record DeterministicMatchResult(
    int Score,
    string EligibilityStatus,
    string? EligibilityReason,
    int SkillScore,
    int ExperienceScore,
    int EducationScore,
    int ProjectAndCertificateScore);
