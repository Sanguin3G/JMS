using System.Security.Claims;
using System.Text.Json;
using APIServer.Controllers.RecuirterModule;
using APIServer.MappingObj;
using APIServer.Models;
using APIServer.Models.Entity;
using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace APIServer.Tests.Features.Matching;

public sealed class RecruiterWorkspaceTests : IDisposable
{
    private readonly SqliteConnection connection = new("Data Source=:memory:");
    private readonly JMSDBContext db;
    private readonly IMapper mapper;
    private readonly Recuirter owner;
    private readonly Recuirter other;
    private readonly JobDescription active;
    private readonly JobDescription expired;

    public RecruiterWorkspaceTests()
    {
        connection.Open();
        db = new JMSDBContext(new DbContextOptionsBuilder<JMSDBContext>().UseSqlite(connection).Options);
        db.Database.EnsureCreated();
        mapper = new MapperConfiguration(config => config.AddProfile<MapObject>()).CreateMapper();
        owner = Recruiter("owner"); other = Recruiter("other");
        active = Job("Angular developer", owner); expired = Job("Designer", owner);
        expired.ExpiredDate = DateTime.Now.AddDays(-1); expired.CreatedAt = active.CreatedAt.AddDays(-1);
        var deleted = Job("Deleted job", owner); deleted.IsDelete = true;
        var foreignJob = Job("Other employer", other);
        db.AddRange(owner, other, active, expired, deleted, foreignJob);
        db.CVMatchings.AddRange(
            new CVMatching { JobDescription = active, DisplayName = "Own applicant", DisplayEmail = "private@example.test", Phone = "0123456789", IsApplied = true, IsMatched = true, IsSelected = true, ApplyDate = DateTime.Now },
            new CVMatching { JobDescription = expired, DisplayName = "Rejected applicant", IsApplied = true, IsMatched = true, IsReject = true, ApplyDate = DateTime.Now.AddDays(-1) },
            new CVMatching { JobDescription = active, DisplayName = "Matched only", IsMatched = true },
            new CVMatching { JobDescription = foreignJob, DisplayName = "Other recruiter applicant", IsApplied = true, IsMatched = true },
            new CVMatching { JobDescription = deleted, DisplayName = "Deleted job applicant", IsApplied = true, IsMatched = true });
        db.SaveChanges();
    }

    [Fact]
    public async Task DashboardCountsAndRecentActivityOnlyIncludeTheClaimedRecruitersJobs()
    {
        var result = (await Controller(owner.Id).Dashboard(default)).Value!.data!;
        Assert.Equal(2, result.TotalJobs);
        Assert.Equal(1, result.ActiveJobs);
        Assert.Equal(1, result.ExpiredJobs);
        Assert.Equal(2, result.Applications);
        Assert.Equal(1, result.SelectedApplications);
        Assert.Equal(1, result.RejectedApplications);
        Assert.Equal(["selected", "rejected"], result.RecentApplications.Select(application => application.Status).ToArray());
        Assert.DoesNotContain("Other recruiter", JsonSerializer.Serialize(result));
        Assert.DoesNotContain("Deleted job", JsonSerializer.Serialize(result));
        Assert.DoesNotContain("private@example.test", JsonSerializer.Serialize(result));
        Assert.DoesNotContain("0123456789", JsonSerializer.Serialize(result));
        var ownActive = result.RecentJobs.Single(item => item.Job.JobId == active.JobId);
        Assert.Equal(1, ownActive.ApplicantCount);
        Assert.Equal(2, ownActive.MatchCount);
        var otherDashboard = (await Controller(other.Id).Dashboard(default)).Value!.data!;
        Assert.Equal(1, otherDashboard.TotalJobs);
        Assert.Equal(1, otherDashboard.Applications);
        Assert.DoesNotContain("Own applicant", JsonSerializer.Serialize(otherDashboard));
    }

    [Fact]
    public async Task JobManagementFiltersOwnJobsBeforePaginationAndProvidesRealCounts()
    {
        var controller = Controller(owner.Id);
        var all = (await controller.Jobs(new() { PageSize = 1 }, default)).Value!;
        Assert.Equal(2, all.ObjectLength);
        Assert.Equal(2, all.TotalPage);
        Assert.Equal(active.JobId, all.data!.Single().Job.JobId);
        var filtered = (await controller.Jobs(new() { Status = "expired", Query = "DESIGN", PageSize = 1 }, default)).Value!;
        Assert.Equal(1, filtered.ObjectLength);
        var item = filtered.data!.Single();
        Assert.Equal(expired.JobId, item.Job.JobId);
        Assert.Equal(1, item.ApplicantCount);
        Assert.Equal(0, item.MatchCount);
        var activeOnly = (await controller.Jobs(new() { Status = "active", Page = int.MaxValue, PageSize = int.MaxValue }, default)).Value!;
        Assert.Equal(1, activeOnly.ObjectLength);
        Assert.Equal(1, activeOnly.currentPage);
        Assert.Equal(active.JobId, activeOnly.data!.Single().Job.JobId);
    }

    [Fact]
    public async Task MissingUserClaimCannotReadRecruiterWorkspace()
    {
        Assert.IsType<UnauthorizedResult>((await Controller(null).Dashboard(default)).Result);
        Assert.IsType<UnauthorizedResult>((await Controller(null).Jobs(new(), default)).Result);
    }

    private RecruiterWorkspaceController Controller(int? id)
    {
        var claims = id.HasValue ? new[] { new Claim("UserId", id.Value.ToString()) } : [];
        return new(db, mapper) { ControllerContext = new() { HttpContext = new DefaultHttpContext
            { User = new ClaimsPrincipal(new ClaimsIdentity(claims, "test")) } } };
    }
    private static Recuirter Recruiter(string username) => new() { FullName = username, UserName = username,
        Email = username + "@example.test", Password = "unused", PhoneNumber = "0123456789" };
    private static JobDescription Job(string title, Recuirter recruiter) => new() { Title = title, Recuirter = recruiter,
        ExpiredDate = DateTime.Now.AddDays(7), CreatedAt = DateTime.Now };
    public void Dispose() { db.Dispose(); connection.Dispose(); }
}
