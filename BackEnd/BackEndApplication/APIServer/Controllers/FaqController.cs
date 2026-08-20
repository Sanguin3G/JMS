using APIServer.Features.Faq.Contracts;
using APIServer.DTO.ResponseBody;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace APIServer.Controllers;

[ApiController]
[Route("api/faq")]
public sealed class FaqController(IFaqService faqService) : ControllerBase
{
    [HttpGet]
    public async Task<BaseResponseBody<IReadOnlyList<FaqEntryResponse>>> Search([FromQuery] string? query, CancellationToken cancellationToken)
    {
        var entries = await faqService.SearchAsync(query, cancellationToken: cancellationToken);
        return new BaseResponseBody<IReadOnlyList<FaqEntryResponse>>
        {
            statusCode = HttpStatusCode.OK,
            data = entries,
            message = "Curated JMS help content."
        };
    }

    [HttpPost("chat")]
    public async Task<BaseResponseBody<FaqChatResponse>> Chat([FromBody] FaqChatRequest request, CancellationToken cancellationToken)
    {
        var answer = await faqService.AnswerAsync(request.Message, cancellationToken);
        return new BaseResponseBody<FaqChatResponse>
        {
            statusCode = HttpStatusCode.OK,
            data = answer,
            message = answer.AiAvailable ? "AI assistant response." : "Deterministic help response; AI is unavailable."
        };
    }
}
