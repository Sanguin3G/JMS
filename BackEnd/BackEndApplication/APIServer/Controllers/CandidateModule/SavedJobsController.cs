using System.Net;
using System.Security.Claims;
using APIServer.Common;
using APIServer.DTO.EntityDTO;
using APIServer.DTO.ResponseBody;
using APIServer.Features.Jobs;
using APIServer.Models;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace APIServer.Controllers.CandidateModule;

[ApiController]
[Authorize(Roles = GlobalStrings.ROLE_CANDIDATE)]
[Route("api/candidate/saved-jobs")]
public sealed class SavedJobsController(JMSDBContext db, IMapper mapper) : ControllerBase
{
    [HttpGet("ids")]
    public async Task<ActionResult<BaseResponseBody<int[]>>> GetIds(CancellationToken cancellationToken)
    {
        if (!TryGetCandidateId(out var candidateId)) return Unauthorized();
        var ids = await db.SavedJobs.AsNoTracking().Where(saved => saved.CandidateId == candidateId)
            .Select(saved => saved.JobId).ToArrayAsync(cancellationToken);
        return new BaseResponseBody<int[]> { data = ids, statusCode = HttpStatusCode.OK, message = "Thành công" };
    }

    [HttpGet]
    public async Task<ActionResult<PagingResponseBody<List<JobDTO>>>> Get(int page = 1, int pageSize = 9, CancellationToken cancellationToken = default)
    {
        if (!TryGetCandidateId(out var candidateId)) return Unauthorized();
        var saved = db.SavedJobs.AsNoTracking().Where(item => item.CandidateId == candidateId
            && !item.Job.IsDelete && item.Job.Company != null && !item.Job.Company.IsDelete);
        var count = await saved.CountAsync(cancellationToken);
        pageSize = Math.Clamp(pageSize, 1, 50);
        var totalPage = (int)Math.Ceiling(count / (double)pageSize);
        page = Math.Clamp(page, 1, Math.Max(1, totalPage));
        var results = await saved.OrderByDescending(item => item.SavedAtUtc).ThenByDescending(item => item.JobId)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Include(item => item.Job).ThenInclude(job => job.Company)
            .Include(item => item.Job).ThenInclude(job => job.Category)
            .Include(item => item.Job).ThenInclude(job => job.EmploymentType)
            .Include(item => item.Job).ThenInclude(job => job.Level)
            .Include(item => item.Job).ThenInclude(job => job.Gender).ToListAsync(cancellationToken);
        return new PagingResponseBody<List<JobDTO>> { data = mapper.Map<List<JobDTO>>(results.Select(item => item.Job)), ObjectLength = count,
            TotalPage = totalPage, currentPage = page, statusCode = HttpStatusCode.OK, message = "Thành công" };
    }

    [HttpPut("{jobId:int}")]
    public async Task<ActionResult<BaseResponseBody<bool>>> Save(int jobId, CancellationToken cancellationToken)
    {
        if (!TryGetCandidateId(out var candidateId)) return Unauthorized();
        if (!await db.Candidates.AnyAsync(candidate => candidate.Id == candidateId && candidate.IsActive && !candidate.IsDelete, cancellationToken))
            return Forbid();
        var now = DateTime.Now;
        if (!await JobQueries.PubliclyVisible(db.JobDescriptions).AnyAsync(job => job.JobId == jobId && job.ExpiredDate > now, cancellationToken))
            return NotFound(new BaseResponseBody<bool> { statusCode = HttpStatusCode.NotFound, message = "Tin tuyển dụng không còn khả dụng." });
        // The composite key and conflict clause also protect simultaneous save requests.
        var savedAt = DateTime.UtcNow;
        await db.Database.ExecuteSqlInterpolatedAsync($"INSERT INTO SavedJobs (CandidateId, JobId, SavedAtUtc) VALUES ({candidateId}, {jobId}, {savedAt}) ON CONFLICT(CandidateId, JobId) DO NOTHING", cancellationToken);
        return new BaseResponseBody<bool> { data = true, statusCode = HttpStatusCode.OK, message = "Đã lưu việc làm." };
    }

    [HttpDelete("{jobId:int}")]
    public async Task<ActionResult<BaseResponseBody<bool>>> Remove(int jobId, CancellationToken cancellationToken)
    {
        if (!TryGetCandidateId(out var candidateId)) return Unauthorized();
        await db.SavedJobs.Where(saved => saved.CandidateId == candidateId && saved.JobId == jobId).ExecuteDeleteAsync(cancellationToken);
        return new BaseResponseBody<bool> { data = false, statusCode = HttpStatusCode.OK, message = "Đã bỏ lưu việc làm." };
    }

    private bool TryGetCandidateId(out int candidateId) => int.TryParse(User.FindFirstValue("UserId"), out candidateId) && candidateId > 0;
}
