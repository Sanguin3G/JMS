using System.ComponentModel.DataAnnotations;
using System.Net;
using APIServer.Common;
using APIServer.DTO.EntityDTO;
using APIServer.DTO.ResponseBody;
using APIServer.Models;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace APIServer.Controllers.AdminModule;

[ApiController]
[Authorize(Roles = GlobalStrings.ROLE_ADMIN)]
[Route("api/admin/entities")]
public sealed class AdminEntitiesController(JMSDBContext db, IMapper mapper) : ControllerBase
{
    [HttpGet("{entity}")]
    public async Task<IActionResult> Get(string entity, [FromQuery] AdminEntityQuery request, CancellationToken cancellationToken)
    {
        var query = request.Query?.Trim().ToLowerInvariant();
        switch (entity)
        {
            case "companies":
                var companies = db.Companies.AsNoTracking().AsQueryable();
                if (request.Status == "active") companies = companies.Where(company => !company.IsDelete);
                if (request.Status == "inactive") companies = companies.Where(company => company.IsDelete);
                if (!string.IsNullOrEmpty(query)) companies = companies.Where(company => company.CompanyName.ToLower().Contains(query)
                    || company.Email.ToLower().Contains(query));
                return Ok(await Page<APIServer.Models.Entity.Company, CompanyDTO>(companies.OrderByDescending(company => company.CompanyId)
                    .Include(company => company.Category).Include(company => company.Recuirter), request, cancellationToken));
            case "candidates":
                var candidates = db.Candidates.AsNoTracking().Where(candidate => !candidate.IsDelete);
                if (request.Status == "active") candidates = candidates.Where(candidate => candidate.IsActive);
                if (request.Status == "inactive") candidates = candidates.Where(candidate => !candidate.IsActive);
                if (!string.IsNullOrEmpty(query)) candidates = candidates.Where(candidate => candidate.FullName.ToLower().Contains(query)
                    || candidate.UserName.ToLower().Contains(query) || candidate.Email.ToLower().Contains(query));
                return Ok(await Page<APIServer.Models.Entity.Candidate, CandidateDTO>(candidates.OrderByDescending(candidate => candidate.Id), request, cancellationToken));
            case "recruiters":
                var recruiters = db.Recuirters.AsNoTracking().Where(recruiter => !recruiter.IsDelete);
                if (request.Status == "active") recruiters = recruiters.Where(recruiter => recruiter.IsActive);
                if (request.Status == "inactive") recruiters = recruiters.Where(recruiter => !recruiter.IsActive);
                if (!string.IsNullOrEmpty(query)) recruiters = recruiters.Where(recruiter => recruiter.FullName.ToLower().Contains(query)
                    || recruiter.UserName.ToLower().Contains(query) || recruiter.Email.ToLower().Contains(query)
                    || (recruiter.Company != null && recruiter.Company.CompanyName.ToLower().Contains(query)));
                return Ok(await Page<APIServer.Models.Entity.Recuirter, RecuirterDTO>(recruiters.OrderByDescending(recruiter => recruiter.Id)
                    .Include(recruiter => recruiter.Company).Include(recruiter => recruiter.Gender).Include(recruiter => recruiter.Role), request, cancellationToken));
            default: return NotFound();
        }
    }

    private async Task<PagingResponseBody<List<TDto>>> Page<TEntity, TDto>(IQueryable<TEntity> source, AdminEntityQuery request, CancellationToken cancellationToken)
        where TEntity : class
    {
        var count = await source.CountAsync(cancellationToken);
        var pageSize = Math.Clamp(request.PageSize, 1, 50);
        var totalPage = (int)Math.Ceiling(count / (double)pageSize);
        var page = Math.Clamp(request.Page, 1, Math.Max(1, totalPage));
        var entities = await source.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
        return new() { data = mapper.Map<List<TDto>>(entities), ObjectLength = count, TotalPage = totalPage,
            currentPage = page, statusCode = HttpStatusCode.OK, message = "Thành công" };
    }
}

public sealed class AdminEntityQuery
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    [StringLength(120)] public string? Query { get; init; }
    [RegularExpression("^(all|active|inactive)$")] public string Status { get; init; } = "all";
}
