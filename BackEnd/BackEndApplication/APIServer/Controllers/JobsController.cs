using System.ComponentModel.DataAnnotations;
using System.Net;
using APIServer.DTO.EntityDTO;
using APIServer.DTO.ResponseBody;
using APIServer.Features.Jobs;
using APIServer.Models;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace APIServer.Controllers;

[ApiController]
[Route("api/jobs")]
public sealed class JobsController(JMSDBContext db, IMapper mapper) : ControllerBase
{
    [HttpGet("search")]
    public async Task<PagingResponseBody<List<JobDTO>>> Search([FromQuery] JobSearchRequest request, CancellationToken cancellationToken)
    {
        var now = DateTime.Now;
        var jobs = JobQueries.PubliclyVisible(db.JobDescriptions.AsNoTracking()).Where(job => job.ExpiredDate > now);
        if (!string.IsNullOrWhiteSpace(request.Query))
        {
            var query = request.Query.Trim().ToLowerInvariant();
            jobs = jobs.Where(job => job.Title.ToLower().Contains(query) || job.Company!.CompanyName.ToLower().Contains(query)
                || (job.SkillRequirement != null && job.SkillRequirement.ToLower().Contains(query)));
        }
        if (!string.IsNullOrWhiteSpace(request.Location))
        {
            var location = request.Location.Trim().ToLowerInvariant();
            jobs = jobs.Where(job => job.Address != null && job.Address.ToLower().Contains(location));
        }
        if (request.CategoryId is > 0) jobs = jobs.Where(job => job.CategoryId == request.CategoryId);
        if (request.EmploymentTypeId is > 0) jobs = jobs.Where(job => job.EmploymentTypeId == request.EmploymentTypeId);
        if (request.LevelId is > 0) jobs = jobs.Where(job => job.LevelId == request.LevelId);

        var count = await jobs.CountAsync(cancellationToken);
        var pageSize = Math.Clamp(request.PageSize, 1, 50);
        var totalPage = (int)Math.Ceiling(count / (double)pageSize);
        var page = Math.Clamp(request.Page, 1, Math.Max(1, totalPage));
        var ordered = request.Sort == "oldest" ? jobs.OrderBy(job => job.CreatedAt).ThenBy(job => job.JobId)
            : jobs.OrderByDescending(job => job.CreatedAt).ThenByDescending(job => job.JobId);
        var result = await JobQueries.WithDetails(ordered).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
        return new() { data = mapper.Map<List<JobDTO>>(result), ObjectLength = count, TotalPage = totalPage,
            currentPage = page, statusCode = HttpStatusCode.OK, message = "Thành công" };
    }
}

public sealed class JobSearchRequest
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 9;
    [StringLength(120)] public string? Query { get; init; }
    [StringLength(120)] public string? Location { get; init; }
    public int? CategoryId { get; init; }
    public int? EmploymentTypeId { get; init; }
    public int? LevelId { get; init; }
    [RegularExpression("^(newest|oldest)$")] public string Sort { get; init; } = "newest";
}
