using APIServer.Common;
using APIServer.Features.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace APIServer.Controllers.AdminModule;

[ApiController]
[Authorize(Roles = GlobalStrings.ROLE_ADMIN)]
[Route("api/admin/insights")]
public sealed class AdminInsightsController(AdminInsightsService insights) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] int days = 30, CancellationToken cancellationToken = default)
    {
        if (days is not (30 or 90 or 365)) return BadRequest(new { message = "Days must be 30, 90 or 365." });
        return Ok(new { statusCode = 200, data = await insights.GetAsync(days, cancellationToken) });
    }
}
