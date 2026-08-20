using APIServer.Common;
using APIServer.DTO.ResponseBody;
using APIServer.Features.Faq.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace APIServer.Controllers.AdminModule;

[ApiController]
[Authorize(Roles = GlobalStrings.ROLE_ADMIN)]
[Route("api/admin/faq")]
public sealed class FaqAdminController(IFaqService faqService) : ControllerBase
{
    [HttpGet]
    public async Task<BaseResponseBody<IReadOnlyList<FaqEntryResponse>>> GetAll(CancellationToken cancellationToken) =>
        Success(await faqService.SearchAsync(null, includeUnpublished: true, cancellationToken));

    [HttpPost]
    public async Task<ActionResult<BaseResponseBody<FaqEntryResponse>>> Create(FaqEntryRequest request, CancellationToken cancellationToken) =>
        StatusCode(StatusCodes.Status201Created, Success(await faqService.CreateAsync(request, cancellationToken)));

    [HttpPut("{id:int}")]
    public async Task<ActionResult<BaseResponseBody<FaqEntryResponse>>> Update(int id, FaqEntryRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Success(await faqService.UpdateAsync(id, request, cancellationToken));
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(Failure<FaqEntryResponse>(exception.Message, HttpStatusCode.NotFound));
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult<BaseResponseBody<string>>> Delete(int id, CancellationToken cancellationToken)
    {
        try
        {
            await faqService.DeleteAsync(id, cancellationToken);
            return Success("FAQ entry deleted.");
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(Failure<string>(exception.Message, HttpStatusCode.NotFound));
        }
    }

    private static BaseResponseBody<T> Success<T>(T data) => new() { statusCode = HttpStatusCode.OK, data = data };
    private static BaseResponseBody<T> Failure<T>(string message, HttpStatusCode statusCode) => new() { statusCode = statusCode, message = message };
}
