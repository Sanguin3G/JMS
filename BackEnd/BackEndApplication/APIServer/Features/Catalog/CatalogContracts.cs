using System.ComponentModel.DataAnnotations;

namespace APIServer.Features.Catalog;

public sealed record CatalogEntryResponse(
    int Id,
    string Name,
    string? Description,
    bool IsActive);

public sealed record CatalogSnapshot(
    IReadOnlyList<CatalogEntryResponse> Categories,
    IReadOnlyList<CatalogEntryResponse> Levels,
    IReadOnlyList<CatalogEntryResponse> EmploymentTypes);

public sealed class CatalogEntryRequest
{
    [Required, StringLength(200, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }
}
