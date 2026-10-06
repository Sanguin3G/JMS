using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Security.Claims;
using APIServer.Common;
using APIServer.DTO.EntityDTO;
using APIServer.DTO.ResponseBody;
using APIServer.Features.Jobs;
using APIServer.Models;
using APIServer.Models.Entity;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace APIServer.Controllers.RecuirterModule;

[ApiController]
[Authorize(Roles = GlobalStrings.ROLE_RECUIRTER)]
[Route("api/recruiter")]
public sealed class RecruiterWorkspaceController(JMSDBContext db, IMapper mapper) : ControllerBase
{
    [HttpGet("dashboard")]
    public async Task<ActionResult<BaseResponseBody<RecruiterDashboard>>> Dashboard(CancellationToken cancellationToken)
    {
        if (!TryGetRecruiterId(out var recruiterId)) return Unauthorized();
        var now = DateTime.Now;
        var jobs = OwnJobs(recruiterId);
        var applications = db.CVMatchings.AsNoTracking().Where(match => match.IsApplied
            && match.JobDescription != null && match.JobDescription.RecuirterId == recruiterId && !match.JobDescription.IsDelete);
        var recentApplications = await applications.OrderByDescending(match => match.ApplyDate).ThenByDescending(match => match.Id)
            .Take(6).Select(match => new RecruiterApplicationSummary(match.Id, match.JobDescriptionId!.Value,
                match.DisplayName ?? "Ứng viên", match.JobDescription!.Title, match.ApplyDate,
                match.IsReject == true ? "rejected" : match.IsSelected ? "selected" : "applied")).ToListAsync(cancellationToken);
        var recentJobs = await JobQueries.WithDetails(jobs.OrderByDescending(job => job.CreatedAt).ThenByDescending(job => job.JobId))
            .Take(5).ToListAsync(cancellationToken);
        var result = new RecruiterDashboard(await jobs.CountAsync(cancellationToken),
            await jobs.CountAsync(job => job.ExpiredDate > now, cancellationToken),
            await jobs.CountAsync(job => job.ExpiredDate <= now, cancellationToken),
            await applications.CountAsync(cancellationToken),
            await applications.CountAsync(match => match.IsSelected && match.IsReject != true, cancellationToken),
            await applications.CountAsync(match => match.IsReject == true, cancellationToken),
            recentApplications, await WithCounts(recentJobs, cancellationToken));
        return new BaseResponseBody<RecruiterDashboard> { data = result, statusCode = HttpStatusCode.OK, message = "Thành công" };
    }

    [HttpGet("jobs")]
    public async Task<ActionResult<PagingResponseBody<List<RecruiterJobItem>>>> Jobs([FromQuery] RecruiterJobRequest request, CancellationToken cancellationToken)
    {
        if (!TryGetRecruiterId(out var recruiterId)) return Unauthorized();
        var jobs = OwnJobs(recruiterId);
        var now = DateTime.Now;
        if (request.Status == "active") jobs = jobs.Where(job => job.ExpiredDate > now);
        if (request.Status == "expired") jobs = jobs.Where(job => job.ExpiredDate <= now);
        if (!string.IsNullOrWhiteSpace(request.Query))
        {
            var query = request.Query.Trim().ToLowerInvariant();
            jobs = jobs.Where(job => job.Title.ToLower().Contains(query)
                || (job.Company != null && job.Company.CompanyName.ToLower().Contains(query)));
        }
        var count = await jobs.CountAsync(cancellationToken);
        var pageSize = Math.Clamp(request.PageSize, 1, 50);
        var totalPages = (int)Math.Ceiling(count / (double)pageSize);
        var page = Math.Clamp(request.Page, 1, Math.Max(1, totalPages));
        var result = await JobQueries.WithDetails(jobs.OrderByDescending(job => job.CreatedAt).ThenByDescending(job => job.JobId))
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
        return new PagingResponseBody<List<RecruiterJobItem>> { data = await WithCounts(result, cancellationToken),
            ObjectLength = count, TotalPage = totalPages, currentPage = page, statusCode = HttpStatusCode.OK, message = "Thành công" };
    }

    private IQueryable<JobDescription> OwnJobs(int recruiterId) => db.JobDescriptions.AsNoTracking()
        .Where(job => job.RecuirterId == recruiterId && !job.IsDelete);

    private async Task<List<RecruiterJobItem>> WithCounts(List<JobDescription> jobs, CancellationToken cancellationToken)
    {
        var ids = jobs.Select(job => job.JobId).ToArray();
        var counts = await db.CVMatchings.AsNoTracking().Where(match => match.JobDescriptionId != null && ids.Contains(match.JobDescriptionId.Value))
            .GroupBy(match => match.JobDescriptionId!.Value).Select(group => new
            {
                JobId = group.Key, Applicants = group.Count(match => match.IsApplied),
                Matches = group.Count(match => match.IsMatched && match.IsReject != true)
            }).ToDictionaryAsync(count => count.JobId, cancellationToken);
        return jobs.Select(job => new RecruiterJobItem(mapper.Map<JobDTO>(job),
            counts.TryGetValue(job.JobId, out var count) ? count.Applicants : 0,
            count?.Matches ?? 0)).ToList();
    }

    private bool TryGetRecruiterId(out int recruiterId) => int.TryParse(User.FindFirstValue("UserId"), out recruiterId) && recruiterId > 0;
}

public sealed class RecruiterJobRequest
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 9;
    [StringLength(120)] public string? Query { get; init; }
    [RegularExpression("^(all|active|expired)$")] public string Status { get; init; } = "all";
}

public sealed record RecruiterJobItem(JobDTO Job, int ApplicantCount, int MatchCount);
public sealed record RecruiterApplicationSummary(int ApplicationId, int JobId, string CandidateName, string JobTitle, DateTime AppliedAt, string Status);
public sealed record RecruiterDashboard(int TotalJobs, int ActiveJobs, int ExpiredJobs, int Applications,
    int SelectedApplications, int RejectedApplications, IReadOnlyList<RecruiterApplicationSummary> RecentApplications,
    IReadOnlyList<RecruiterJobItem> RecentJobs);
