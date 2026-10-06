using System.Security.Claims;
using APIServer.Controllers;
using APIServer.Controllers.CandidateModule;
using APIServer.MappingObj;
using APIServer.Models;
using APIServer.Models.Entity;
using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Xunit;

namespace APIServer.Tests.Features.Matching;

public sealed class JobDiscoveryAndSavedJobsTests : IDisposable
{
    private readonly SqliteConnection connection = new("Data Source=:memory:");
    private readonly JMSDBContext db;
    private readonly IMapper mapper;
    private readonly Candidate owner;
    private readonly Candidate stranger;
    private readonly Company company;
    private readonly JobDescription job;

    public JobDiscoveryAndSavedJobsTests()
    {
        connection.Open();
        db = new JMSDBContext(new DbContextOptionsBuilder<JMSDBContext>().UseSqlite(connection).Options);
        db.Database.EnsureCreated();
        mapper = new MapperConfiguration(config => config.AddProfile<MapObject>()).CreateMapper();
        owner = NewCandidate("owner");
        stranger = NewCandidate("stranger");
        company = new Company { CompanyName = "JMS Studio", Address = "Da Nang", Description = "Test company", Email = "studio@example.test", Phone = "0123456789" };
        job = NewJob("Angular developer");
        db.AddRange(owner, stranger, company, job);
        db.SaveChanges();
    }

    [Fact]
    public async Task RepeatedSavesAndRemovalsAreIdempotentAndOtherCandidatesCannotSeeOrRemoveThem()
    {
        var mine = SavedController(owner.Id);
        Assert.True((await mine.Save(job.JobId, default)).Value!.data);
        Assert.True((await mine.Save(job.JobId, default)).Value!.data);
        Assert.Single(db.SavedJobs);
        var theirs = SavedController(stranger.Id);
        Assert.Empty((await theirs.GetIds(default)).Value!.data!);
        Assert.Empty((await theirs.Get()).Value!.data!);
        await theirs.Remove(job.JobId, default);
        Assert.Single(db.SavedJobs);
        Assert.Equal([job.JobId], (await mine.GetIds(default)).Value!.data!);
        Assert.Single((await mine.Get()).Value!.data!);
        await mine.Remove(job.JobId, default);
        await mine.Remove(job.JobId, default);
        Assert.Empty(db.SavedJobs);
    }

    [Fact]
    public async Task MissingClaimCannotReadOrMutateSavedJobs()
    {
        var controller = SavedController(null);
        Assert.IsType<UnauthorizedResult>((await controller.GetIds(default)).Result);
        Assert.IsType<UnauthorizedResult>((await controller.Save(job.JobId, default)).Result);
        Assert.IsType<UnauthorizedResult>((await controller.Remove(job.JobId, default)).Result);
        Assert.Empty(db.SavedJobs);
    }

    [Fact]
    public async Task ExpiredSavedJobRemainsVisibleButCannotBeNewlySaved()
    {
        var controller = SavedController(owner.Id);
        await controller.Save(job.JobId, default);
        job.ExpiredDate = DateTime.Now.AddDays(-1);
        await db.SaveChangesAsync();
        Assert.IsType<NotFoundObjectResult>((await SavedController(stranger.Id).Save(job.JobId, default)).Result);
        Assert.True((await controller.Get()).Value!.data!.Single().IsExpired);
        company.IsDelete = true;
        await db.SaveChangesAsync();
        Assert.Empty((await controller.Get()).Value!.data!);
    }

    [Fact]
    public async Task DiscoveryFiltersBeforePaginationAndExcludesUnavailableJobsAndCompanies()
    {
        var category = new Category { CategoryName = "Technology" };
        var type = new EmploymentType { Title = "Full time" };
        var level = new Level { Title = "Junior" };
        job.Category = category; job.EmploymentType = type; job.Level = level;
        var older = NewJob("Angular engineer"); older.CreatedAt = job.CreatedAt.AddDays(-1);
        older.Category = category; older.EmploymentType = type; older.Level = level;
        var otherLocation = NewJob("Angular remote"); otherLocation.Address = "Ha Noi";
        var expired = NewJob("Angular expired"); expired.ExpiredDate = DateTime.Now.AddDays(-1);
        var deleted = NewJob("Angular deleted"); deleted.IsDelete = true;
        var hiddenCompany = NewJob("Angular hidden company");
        hiddenCompany.Company = new Company { CompanyName = "Deleted", Address = "Da Nang", Description = "Deleted", Email = "deleted@example.test", Phone = "0123456789", IsDelete = true };
        db.AddRange(older, otherLocation, expired, deleted, hiddenCompany);
        await db.SaveChangesAsync();
        var controller = new JobsController(db, mapper);
        var first = await controller.Search(new() { Query = "ANGULAR", Location = "da nang", CategoryId = category.Id,
            EmploymentTypeId = type.Id, LevelId = level.Id, PageSize = 1 }, default);
        Assert.Equal(2, first.ObjectLength);
        Assert.Equal(2, first.TotalPage);
        Assert.Equal(job.JobId, first.data!.Single().JobId);
        var second = await controller.Search(new() { Query = "Angular", Location = "Da Nang", PageSize = 1, Page = 2 }, default);
        Assert.Equal(older.JobId, second.data!.Single().JobId);
        var all = await controller.Search(new() { PageSize = int.MaxValue, Page = int.MaxValue }, default);
        Assert.Equal(3, all.ObjectLength);
        Assert.Equal(1, all.currentPage);
        Assert.Equal(3, all.data!.Count);
    }

    [Fact]
    public async Task CleanMigrationAndExistingDatabaseUpgradePreserveDataAndCreateSavedJobConstraint()
    {
        using var migrationConnection = new SqliteConnection("Data Source=:memory:");
        migrationConnection.Open();
        await using var migrationDb = new JMSDBContext(new DbContextOptionsBuilder<JMSDBContext>().UseSqlite(migrationConnection).Options);
        var migrator = migrationDb.GetService<IMigrator>();
        await migrator.MigrateAsync("20260820125850_AddFaqEntries");
        migrationDb.Candidates.Add(NewCandidate("retained"));
        await migrationDb.SaveChangesAsync();
        await migrationDb.Database.MigrateAsync();
        Assert.Equal("retained", migrationDb.Candidates.Single().UserName);
        Assert.Empty(migrationDb.SavedJobs);
        Assert.Contains("20261006114549_AddSavedJobs", await migrationDb.Database.GetAppliedMigrationsAsync());
    }

    private SavedJobsController SavedController(int? candidateId)
    {
        var claims = candidateId.HasValue ? new[] { new Claim("UserId", candidateId.Value.ToString()) } : [];
        return new(db, mapper) { ControllerContext = new() { HttpContext = new DefaultHttpContext
            { User = new ClaimsPrincipal(new ClaimsIdentity(claims, "test")) } } };
    }
    private static Candidate NewCandidate(string username) => new() { UserName = username, FullName = username,
        Email = username + "@example.test", Password = "unused" };
    private JobDescription NewJob(string title) => new() { Title = title, Company = company,
        Address = "Da Nang", CreatedAt = DateTime.Now, ExpiredDate = DateTime.Now.AddDays(7) };
    public void Dispose() { db.Dispose(); connection.Dispose(); }
}
