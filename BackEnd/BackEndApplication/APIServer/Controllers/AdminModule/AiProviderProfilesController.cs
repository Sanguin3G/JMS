using APIServer.Common;
using APIServer.DTO.ResponseBody;
using APIServer.Features.AiConfiguration;
using APIServer.Features.AiConfiguration.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace APIServer.Controllers.AdminModule;

[ApiController]
[Authorize(Roles = GlobalStrings.ROLE_ADMIN)]
[Route("api/admin/ai-profiles")]
public sealed class AiProviderProfilesController(IAiProviderProfileService profileService) : ControllerBase
{
    [HttpGet("gemini-options")]
    public ActionResult<IReadOnlyList<GeminiModelOption>> GetGeminiOptions() => Ok(GeminiModelCatalog.GetOptions());

    [HttpGet]
    public async Task<BaseResponseBody<IReadOnlyList<AiProviderProfileSummary>>> GetAll(CancellationToken cancellationToken)
    {
        var profiles = await profileService.GetAllAsync(cancellationToken);
        return Success(profiles);
    }

    [HttpPost]
    public async Task<ActionResult<BaseResponseBody<AiProviderProfileSummary>>> Create(
        [FromBody] UpsertAiProviderProfileRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var profile = await profileService.CreateAsync(request, cancellationToken);
            return StatusCode(StatusCodes.Status201Created, Success(profile));
        }
        catch (ArgumentException exception)
        {
            return BadRequest(Failure<AiProviderProfileSummary>(exception.Message));
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<BaseResponseBody<AiProviderProfileSummary>>> Update(
        int id,
        [FromBody] UpsertAiProviderProfileRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            return Success(await profileService.UpdateAsync(id, request, cancellationToken));
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(Failure<AiProviderProfileSummary>(exception.Message, HttpStatusCode.NotFound));
        }
        catch (ArgumentException exception)
        {
            return BadRequest(Failure<AiProviderProfileSummary>(exception.Message));
        }
    }

    [HttpPost("{id:int}/activate-matching")]
    public async Task<ActionResult<BaseResponseBody<string>>> ActivateForMatching(int id, CancellationToken cancellationToken)
    {
        try
        {
            await profileService.ActivateForMatchingAsync(id, cancellationToken);
            return Success("AI provider profile activated for matching.");
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(Failure<string>(exception.Message, HttpStatusCode.NotFound));
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(Failure<string>(exception.Message));
        }
    }

    private static BaseResponseBody<T> Success<T>(T data) => new()
    {
        data = data,
        message = GlobalStrings.SUCCESSFULLY,
        statusCode = HttpStatusCode.OK
    };

    private static BaseResponseBody<T> Failure<T>(string message, HttpStatusCode statusCode = HttpStatusCode.BadRequest) => new()
    {
        message = message,
        statusCode = statusCode
    };
}
