using APIServer.Infrastructure;
using APIServer.DTO.EntityDTO;
using APIServer.Features.Matching.Contracts;
using APIServer.Models;
using APIServer.Models.Entity;
using APIServer.Repositories;
using APIServer.Services;
using AutoMapper;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace APIServer.Tests.Features.Matching;

public sealed class ApplicationWorkflowTests : IDisposable
{
    private readonly SqliteConnection connection = new("Data Source=:memory:");
    private readonly JMSDBContext db;
    private readonly CandidateService service;
    private readonly string imageRoot = Path.Combine(Path.GetTempPath(), "jms-test-" + Guid.NewGuid());
    private readonly CVMatchingRepository matches;
    private readonly Candidate candidate;
    private readonly CurriculumVitae firstCv;
    private readonly CurriculumVitae secondCv;
    private readonly JobDescription firstJob;
    private readonly JobDescription secondJob;
    private readonly Recuirter recruiter;

    public ApplicationWorkflowTests()
    {
        connection.Open();
        db = new JMSDBContext(new DbContextOptionsBuilder<JMSDBContext>().UseSqlite(connection).Options);
        db.Database.EnsureCreated();
        candidate = new Candidate { UserName = "candidate", FullName = "Candidate", Email = "candidate@example.test", Password = "unused" };
        recruiter = new Recuirter { UserName = "recruiter", FullName = "Recruiter", Email = "recruiter@example.test", Password = "unused", PhoneNumber = "0123456789" };
        firstCv = new CurriculumVitae { Candidate = candidate, CVTitle = "First CV", LastUpdateDate = DateTime.Now, IsActive = true };
        secondCv = new CurriculumVitae { Candidate = candidate, CVTitle = "Second CV", LastUpdateDate = firstCv.LastUpdateDate, IsActive = true };
        firstJob = new JobDescription { Title = "First job", Recuirter = recruiter, ExpiredDate = DateTime.Now.AddDays(7) };
        secondJob = new JobDescription { Title = "Second job", Recuirter = recruiter, ExpiredDate = DateTime.Now.AddDays(7) };
        db.AddRange(candidate, recruiter, firstCv, secondCv, firstJob, secondJob);
        db.SaveChanges();
        matches = new CVMatchingRepository(db);
        var mapper = new MapperConfiguration(config => config.CreateMap<CurriculumVitae, CurriculumVitaeDTO>()).CreateMapper();
        service = new CandidateService(new CurriculumVitaeRepository(db), matches, mapper,
            new ConfigurationBuilder().Build(), new CandidateRepository(db), new JobRepository(db), new UnexpectedEvaluation(), new LocalImageStorage(imageRoot));
    }

    [Fact]
    public async Task ApplyingReusesOnlyTheMatchingJobSnapshot()
    {
        var otherJobMatch = AddMatch(firstCv, firstJob);
        var requestedMatch = AddMatch(firstCv, secondJob);

        Assert.True(await service.ApplyJob(candidate.Id, firstCv.Id, secondJob.JobId) > 0);
        db.ChangeTracker.Clear();
        Assert.False(db.CVMatchings.Single(x => x.Id == otherJobMatch.Id).IsApplied);
        var persisted = db.CVMatchings.Single(x => x.Id == requestedMatch.Id);
        Assert.True(persisted.IsApplied);
        Assert.True(persisted.ApplyDate > DateTime.MinValue);
        Assert.Equal(2, db.CVMatchings.Count());
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task ApplyingAnotherCvCannotDuplicateAnApplicationOrBypassRejection(bool rejected)
    {
        var applied = AddMatch(firstCv, firstJob, applied: true);
        applied.IsReject = rejected;
        db.SaveChanges();
        var availableMatch = AddMatch(secondCv, firstJob);

        Assert.Equal(-1, await service.ApplyJob(candidate.Id, secondCv.Id, firstJob.JobId));
        Assert.False(availableMatch.IsApplied);
        Assert.Equal(2, db.CVMatchings.Count());
    }

    [Fact]
    public async Task ExpiredJobDoesNotAcceptAnExistingMatch()
    {
        firstJob.ExpiredDate = DateTime.Now.AddDays(-1);
        db.SaveChanges();
        var match = AddMatch(firstCv, firstJob);

        Assert.Equal(0, await service.ApplyJob(candidate.Id, firstCv.Id, firstJob.JobId));
        Assert.False(match.IsApplied);
    }

    [Fact]
    public async Task AnotherCandidateCannotApplyUsingTheOwnersCv()
    {
        var stranger = new Candidate { UserName = "stranger", FullName = "Stranger", Email = "stranger@example.test", Password = "unused" };
        db.Candidates.Add(stranger);
        db.SaveChanges();
        var match = AddMatch(firstCv, firstJob);

        Assert.Equal(0, await service.ApplyJob(stranger.Id, firstCv.Id, firstJob.JobId));
        Assert.False(match.IsApplied);
    }

    [Fact]
    public void OnlyTheOwningRecruiterCanRejectAndRejectionClearsSelection()
    {
        var match = AddMatch(firstCv, firstJob, applied: true);
        match.IsSelected = true;
        db.SaveChanges();

        Assert.Equal(0, matches.UpdateRejectedStatus(recruiter.Id + 1, firstJob.JobId, match.Id));
        Assert.True(match.IsSelected);
        Assert.True(matches.UpdateRejectedStatus(recruiter.Id, firstJob.JobId, match.Id) > 0);
        db.ChangeTracker.Clear();
        var persisted = db.CVMatchings.Single(x => x.Id == match.Id);
        Assert.True(persisted.IsReject);
        Assert.False(persisted.IsSelected);
        Assert.Equal(0, matches.UpdateSelectedStatus(recruiter.Id, firstJob.JobId, match.Id));
    }

    private CVMatching AddMatch(CurriculumVitae cv, JobDescription job, bool applied = false)
    {
        var match = new CVMatching
        {
            CandidateId = candidate.Id, CurriculumVitaeId = cv.Id, JobDescriptionId = job.JobId,
            LastUpdateDate = cv.LastUpdateDate, IsMatched = true, IsApplied = applied, IsReject = false
        };
        db.CVMatchings.Add(match);
        db.SaveChanges();
        return match;
    }

    public void Dispose()
    {
        db.Dispose();
        connection.Dispose();
        Directory.Delete(imageRoot, recursive: true);
    }

    private sealed class UnexpectedEvaluation : IMatchEvaluationService
    {
        public Task<MatchEvaluation> EvaluateAsync(JobDescription job, CurriculumVitae curriculumVitae, CancellationToken cancellationToken = default) =>
            throw new InvalidOperationException("These workflows must reuse an existing evaluation or stop before evaluation.");
    }
}
