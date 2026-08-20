using APIServer.Common;
using APIServer.DTO.ResponseBody;
using APIServer.Features.Catalog;
using APIServer.Models;
using APIServer.Models.Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace APIServer.Controllers.AdminModule;

[ApiController]
[Authorize(Roles = GlobalStrings.ROLE_ADMIN)]
[Route("api/admin/catalogs")]
public sealed class CatalogAdminController(JMSDBContext db) : ControllerBase
{
    [HttpGet]
    public async Task<BaseResponseBody<CatalogSnapshot>> Get(CancellationToken cancellationToken)
    {
        return Success(await ReadSnapshot(cancellationToken));
    }

    [HttpPost("{kind}")]
    public async Task<ActionResult<BaseResponseBody<CatalogEntryResponse>>> Create(
        string kind,
        CatalogEntryRequest request,
        CancellationToken cancellationToken)
    {
        var normalizedKind = NormalizeKind(kind);
        if (normalizedKind is null)
            return BadRequest(Failure<CatalogEntryResponse>("Unknown catalog kind.", HttpStatusCode.BadRequest));

        var name = request.Name.Trim();
        if (name.Length == 0)
            return BadRequest(Failure<CatalogEntryResponse>("Catalog name is required.", HttpStatusCode.BadRequest));

        if (await NameExists(normalizedKind, name, null, cancellationToken))
            return Conflict(Failure<CatalogEntryResponse>("A catalog entry with that name already exists.", HttpStatusCode.Conflict));

        CatalogEntryResponse response;
        switch (normalizedKind)
        {
            case "categories":
                var category = new Category
                {
                    CategoryName = name,
                    Description = request.Description?.Trim(),
                    CreatedAt = DateTime.UtcNow,
                    IsDelete = false,
                };
                db.Categories.Add(category);
                await db.SaveChangesAsync(cancellationToken);
                response = ToResponse(category.CategoryName, category.Id, category.Description, !category.IsDelete);
                break;
            case "levels":
                var level = new Level
                {
                    Title = name,
                    Description = request.Description?.Trim(),
                    IsDelete = false,
                };
                db.Levels.Add(level);
                await db.SaveChangesAsync(cancellationToken);
                response = ToResponse(level.Title, level.Id, level.Description, !level.IsDelete);
                break;
            default:
                var employmentType = new EmploymentType { Title = name, IsDelete = false };
                db.EmploymentTypes.Add(employmentType);
                await db.SaveChangesAsync(cancellationToken);
                response = ToResponse(employmentType.Title, employmentType.Id, null, !employmentType.IsDelete);
                break;
        }

        return StatusCode(StatusCodes.Status201Created, Success(response));
    }

    [HttpPut("{kind}/{id:int}")]
    public async Task<ActionResult<BaseResponseBody<CatalogEntryResponse>>> Update(
        string kind,
        int id,
        CatalogEntryRequest request,
        CancellationToken cancellationToken)
    {
        var normalizedKind = NormalizeKind(kind);
        if (normalizedKind is null)
            return BadRequest(Failure<CatalogEntryResponse>("Unknown catalog kind.", HttpStatusCode.BadRequest));

        var name = request.Name.Trim();
        if (name.Length == 0)
            return BadRequest(Failure<CatalogEntryResponse>("Catalog name is required.", HttpStatusCode.BadRequest));

        if (await NameExists(normalizedKind, name, id, cancellationToken))
            return Conflict(Failure<CatalogEntryResponse>("A catalog entry with that name already exists.", HttpStatusCode.Conflict));

        CatalogEntryResponse? response = normalizedKind switch
        {
            "categories" => await UpdateCategory(id, name, request.Description, cancellationToken),
            "levels" => await UpdateLevel(id, name, request.Description, cancellationToken),
            _ => await UpdateEmploymentType(id, name, cancellationToken),
        };

        return response is null
            ? NotFound(Failure<CatalogEntryResponse>("Catalog entry not found.", HttpStatusCode.NotFound))
            : Ok(Success(response));
    }

    [HttpDelete("{kind}/{id:int}")]
    public async Task<ActionResult<BaseResponseBody<string>>> Delete(string kind, int id, CancellationToken cancellationToken)
    {
        var normalizedKind = NormalizeKind(kind);
        if (normalizedKind is null)
            return BadRequest(Failure<string>("Unknown catalog kind.", HttpStatusCode.BadRequest));

        var changed = normalizedKind switch
        {
            "categories" => await SoftDeleteCategory(id, cancellationToken),
            "levels" => await SoftDeleteLevel(id, cancellationToken),
            _ => await SoftDeleteEmploymentType(id, cancellationToken),
        };

        return changed
            ? Ok(Success("Catalog entry archived."))
            : NotFound(Failure<string>("Catalog entry not found.", HttpStatusCode.NotFound));
    }

    private async Task<CatalogSnapshot> ReadSnapshot(CancellationToken cancellationToken)
    {
        var categories = await db.Categories.AsNoTracking().Where(x => !x.IsDelete).OrderBy(x => x.CategoryName).ToListAsync(cancellationToken);
        var levels = await db.Levels.AsNoTracking().Where(x => !x.IsDelete).OrderBy(x => x.Title).ToListAsync(cancellationToken);
        var employmentTypes = await db.EmploymentTypes.AsNoTracking().Where(x => !x.IsDelete).OrderBy(x => x.Title).ToListAsync(cancellationToken);

        return new CatalogSnapshot(
            categories.Select(x => ToResponse(x.CategoryName, x.Id, x.Description, true)).ToList(),
            levels.Select(x => ToResponse(x.Title, x.Id, x.Description, true)).ToList(),
            employmentTypes.Select(x => ToResponse(x.Title, x.Id, null, true)).ToList());
    }

    private async Task<bool> NameExists(string kind, string name, int? exceptId, CancellationToken cancellationToken) => kind switch
    {
        "categories" => await db.Categories.AnyAsync(x => !x.IsDelete && (!exceptId.HasValue || x.Id != exceptId) && x.CategoryName.ToLower() == name.ToLower(), cancellationToken),
        "levels" => await db.Levels.AnyAsync(x => !x.IsDelete && (!exceptId.HasValue || x.Id != exceptId) && x.Title.ToLower() == name.ToLower(), cancellationToken),
        _ => await db.EmploymentTypes.AnyAsync(x => !x.IsDelete && (!exceptId.HasValue || x.Id != exceptId) && x.Title.ToLower() == name.ToLower(), cancellationToken),
    };

    private async Task<CatalogEntryResponse?> UpdateCategory(int id, string name, string? description, CancellationToken cancellationToken)
    {
        var entry = await db.Categories.FirstOrDefaultAsync(x => x.Id == id && !x.IsDelete, cancellationToken);
        if (entry is null) return null;
        entry.CategoryName = name;
        entry.Description = description?.Trim();
        await db.SaveChangesAsync(cancellationToken);
        return ToResponse(entry.CategoryName, entry.Id, entry.Description, true);
    }

    private async Task<CatalogEntryResponse?> UpdateLevel(int id, string name, string? description, CancellationToken cancellationToken)
    {
        var entry = await db.Levels.FirstOrDefaultAsync(x => x.Id == id && !x.IsDelete, cancellationToken);
        if (entry is null) return null;
        entry.Title = name;
        entry.Description = description?.Trim();
        await db.SaveChangesAsync(cancellationToken);
        return ToResponse(entry.Title, entry.Id, entry.Description, true);
    }

    private async Task<CatalogEntryResponse?> UpdateEmploymentType(int id, string name, CancellationToken cancellationToken)
    {
        var entry = await db.EmploymentTypes.FirstOrDefaultAsync(x => x.Id == id && !x.IsDelete, cancellationToken);
        if (entry is null) return null;
        entry.Title = name;
        await db.SaveChangesAsync(cancellationToken);
        return ToResponse(entry.Title, entry.Id, null, true);
    }

    private async Task<bool> SoftDeleteCategory(int id, CancellationToken cancellationToken)
    {
        var entry = await db.Categories.FirstOrDefaultAsync(x => x.Id == id && !x.IsDelete, cancellationToken);
        if (entry is null) return false;
        entry.IsDelete = true;
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    private async Task<bool> SoftDeleteLevel(int id, CancellationToken cancellationToken)
    {
        var entry = await db.Levels.FirstOrDefaultAsync(x => x.Id == id && !x.IsDelete, cancellationToken);
        if (entry is null) return false;
        entry.IsDelete = true;
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    private async Task<bool> SoftDeleteEmploymentType(int id, CancellationToken cancellationToken)
    {
        var entry = await db.EmploymentTypes.FirstOrDefaultAsync(x => x.Id == id && !x.IsDelete, cancellationToken);
        if (entry is null) return false;
        entry.IsDelete = true;
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static string? NormalizeKind(string kind) => kind.Trim().ToLowerInvariant() switch
    {
        "category" or "categories" => "categories",
        "level" or "levels" => "levels",
        "employment-type" or "employment-types" or "employmenttype" => "employment-types",
        _ => null,
    };

    private static CatalogEntryResponse ToResponse(string name, int id, string? description, bool active) => new(id, name, description, active);
    private static BaseResponseBody<T> Success<T>(T data) => new() { statusCode = HttpStatusCode.OK, data = data };
    private static BaseResponseBody<T> Failure<T>(string message, HttpStatusCode statusCode) => new() { statusCode = statusCode, message = message };
}
