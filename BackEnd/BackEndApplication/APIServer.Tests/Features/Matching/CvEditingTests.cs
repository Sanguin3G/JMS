using APIServer.DTO.EntityDTO;
using APIServer.MappingObj;
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

public sealed class CvEditingTests : IDisposable
{
    private readonly SqliteConnection connection = new("Data Source=:memory:");
    private readonly JMSDBContext db;
    private readonly CurriculumVitaeService service;
    private readonly Candidate owner;
    private readonly CurriculumVitae cv;
    public CvEditingTests()
    {
        connection.Open();
        db = new(new DbContextOptionsBuilder<JMSDBContext>().UseSqlite(connection).Options);
        db.Database.EnsureCreated();
        owner = new() { UserName = "owner", FullName = "CV owner", Password = "unused", Email = "owner@example.test", PhoneNumber = "0123456789" };
        cv = new() { Candidate = owner, CVTitle = "Before", CreatedDate = DateTime.Now.AddDays(-7), IsActive = true,
            Skills = [new() { Title = "Angular", SkillDescription = "Original" }] };
        db.Add(cv); db.SaveChanges();
        var mapper = new MapperConfiguration(config => config.AddProfile<MapObject>()).CreateMapper();
        service = new(new CurriculumVitaeRepository(db), new CVMatchingRepository(db), mapper, new ConfigurationBuilder().Build(), new CandidateRepository(db), db);
    }

    [Fact]
    public void UpdateUsesConfiguredDatabaseAndServerTimestampsWithoutClientDateMetadata()
    {
        var created = cv.CreatedDate;
        var oldSkillId = cv.Skills!.Single().Id;
        var request = new CurriculumVitaeDTO { CVTitle = "After", DOB = "1998-04-17", Phone = "0123456789",
            DisplayName = "CV owner", DisplayEmail = "owner@example.test", Skills = [new() { Title = "TypeScript", SkillDescription = "Updated" }],
            Educations = [], Projects = [], Certificates = [], Awards = [], JobExperiences = [] };
        Assert.True(service.UpdateCvByCandidateIdAndCvId(owner.Id, cv.Id, request) > 0);
        db.ChangeTracker.Clear();
        var saved = db.CurriculumVitaes.Include(item => item.Skills).Single();
        Assert.Equal("After", saved.CVTitle);
        Assert.Equal(created, saved.CreatedDate);
        Assert.True(saved.LastUpdateDate > created);
        Assert.Equal("TypeScript", saved.Skills!.Single().Title);
        Assert.NotEqual(oldSkillId, saved.Skills.Single().Id);
    }

    [Fact]
    public void OtherCandidatesCannotEditThisCv()
    {
        var other = new Candidate { UserName = "other", FullName = "Other", Password = "unused", Email = "other@example.test", PhoneNumber = "0123456789" };
        db.Add(other); db.SaveChanges();
        Assert.ThrowsAny<Exception>(() => service.UpdateCvByCandidateIdAndCvId(other.Id, cv.Id, new() { CVTitle = "Overwrite" }));
        Assert.Equal("Before", db.CurriculumVitaes.Single().CVTitle);
    }
    public void Dispose() { db.Dispose(); connection.Dispose(); }
}
