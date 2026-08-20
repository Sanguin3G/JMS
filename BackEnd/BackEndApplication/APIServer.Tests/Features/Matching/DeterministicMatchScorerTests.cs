using APIServer.Features.Matching;
using APIServer.Models.Entity;
using Xunit;

namespace APIServer.Tests.Features.Matching;

public sealed class DeterministicMatchScorerTests
{
    [Fact]
    public void CategoryMismatchIsIneligible()
    {
        var result = DeterministicMatchScorer.Evaluate(
            new JobDescription { CategoryId = 2 },
            new CurriculumVitae { CategoryId = 1 });

        Assert.Equal("ineligible", result.EligibilityStatus);
        Assert.Equal(0, result.Score);
        Assert.Contains("category", result.EligibilityReason, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void MatchingRequirementsProduceDeterministicScore()
    {
        var result = DeterministicMatchScorer.Evaluate(
            new JobDescription
            {
                CategoryId = 1,
                SkillRequirement = "Angular TypeScript",
                ExperienceRequirement = "frontend developer",
                EducationRequirement = "software engineering",
                ProjectRequirement = "matching systems"
            },
            new CurriculumVitae
            {
                CategoryId = 1,
                Skills = [new Skill { Title = "Angular", SkillDescription = "TypeScript" }],
                JobExperiences = [new JobExperience { Position = "Frontend Developer", Description = "matching systems" }],
                Educations = [new Education { MajorName = "Software Engineering", Description = "matching systems" }],
                Projects = [new Project { ProjectName = "Matching Systems", Description = "Angular" }]
            });

        Assert.Equal("eligible", result.EligibilityStatus);
        Assert.Equal(100, result.Score);
        Assert.Equal(100, result.SkillScore);
        Assert.Equal(100, result.ExperienceScore);
    }

    [Fact]
    public void EmptyRequirementsRemainNeutral()
    {
        var result = DeterministicMatchScorer.Evaluate(new JobDescription(), new CurriculumVitae());

        Assert.Equal("eligible", result.EligibilityStatus);
        Assert.Equal(100, result.Score);
    }
}
