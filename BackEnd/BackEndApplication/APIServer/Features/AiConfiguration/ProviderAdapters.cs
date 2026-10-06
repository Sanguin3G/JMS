using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using APIServer.Features.AiConfiguration.Contracts;

namespace APIServer.Features.AiConfiguration;

public interface IAiProviderAdapter
{
    string Provider { get; }
    Task TestAsync(ResolvedAiProfile profile, CancellationToken cancellationToken);
    Task<string> GenerateAsync(ResolvedAiProfile profile, string prompt, CancellationToken cancellationToken);
}

// URLs are fixed here; administrator input cannot redirect a server-side API key.
public abstract class AiProviderAdapter(IHttpClientFactory clients) : IAiProviderAdapter
{
    public abstract string Provider { get; }
    protected abstract HttpRequestMessage CreateRequest(ResolvedAiProfile profile, string? prompt);
    protected abstract string ReadText(JsonElement response);

    public async Task TestAsync(ResolvedAiProfile profile, CancellationToken cancellationToken)
    {
        using var request = CreateRequest(profile, null);
        using var response = await clients.CreateClient("AiProviders").SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        if (!response.IsSuccessStatusCode)
            throw new HttpRequestException("The provider rejected the model access check.", null, response.StatusCode);
    }

    public async Task<string> GenerateAsync(ResolvedAiProfile profile, string prompt, CancellationToken cancellationToken)
    {
        using var request = CreateRequest(profile, prompt);
        using var response = await clients.CreateClient("AiProviders").SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        if (!response.IsSuccessStatusCode)
            throw new HttpRequestException("The provider rejected the evaluation request.", null, response.StatusCode);
        await response.Content.LoadIntoBufferAsync(128 * 1024, cancellationToken);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
        return ReadText(json.RootElement);
    }

    protected static string TextParts(JsonElement parts, string type) => string.Concat(parts.EnumerateArray()
        .Where(part => part.TryGetProperty("type", out var value) && value.GetString() == type)
        .Select(part => part.GetProperty("text").GetString()));
}

public sealed class GeminiProviderAdapter(IHttpClientFactory clients) : AiProviderAdapter(clients)
{
    public override string Provider => "gemini";
    protected override HttpRequestMessage CreateRequest(ResolvedAiProfile profile, string? prompt)
    {
        var url = "https://generativelanguage.googleapis.com/v1beta/models/" + Uri.EscapeDataString(profile.ModelId);
        var request = new HttpRequestMessage(prompt is null ? HttpMethod.Get : HttpMethod.Post, prompt is null ? url : url + ":generateContent");
        request.Headers.Add("x-goog-api-key", profile.ApiKey);
        if (prompt is not null)
            request.Content = JsonContent.Create(new
            {
                contents = new[] { new { role = "user", parts = new[] { new { text = prompt } } } },
                generationConfig = new { responseMimeType = "application/json", maxOutputTokens = 2048,
                    thinkingConfig = new { thinkingLevel = profile.ReasoningLevel } }
            });
        return request;
    }
    protected override string ReadText(JsonElement response) => string.Concat(response.GetProperty("candidates")[0]
        .GetProperty("content").GetProperty("parts").EnumerateArray()
        .Where(part => part.TryGetProperty("text", out _) && (!part.TryGetProperty("thought", out var thought) || !thought.GetBoolean()))
        .Select(part => part.GetProperty("text").GetString()));
}

public sealed class OpenAiProviderAdapter(IHttpClientFactory clients) : AiProviderAdapter(clients)
{
    public override string Provider => "openai";
    protected override HttpRequestMessage CreateRequest(ResolvedAiProfile profile, string? prompt)
    {
        var request = new HttpRequestMessage(prompt is null ? HttpMethod.Get : HttpMethod.Post,
            prompt is null ? "https://api.openai.com/v1/models/" + Uri.EscapeDataString(profile.ModelId) : "https://api.openai.com/v1/responses");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", profile.ApiKey);
        if (prompt is not null)
            request.Content = JsonContent.Create(new { model = profile.ModelId, input = prompt, store = false,
                reasoning = new { effort = profile.ReasoningLevel }, max_output_tokens = 2048,
                text = new { format = new { type = "json_object" } } });
        return request;
    }
    protected override string ReadText(JsonElement response)
    {
        if (response.GetProperty("status").GetString() != "completed")
            throw new InvalidOperationException("The provider did not complete the evaluation.");
        return string.Concat(response.GetProperty("output").EnumerateArray()
            .Where(item => item.TryGetProperty("type", out var type) && type.GetString() == "message")
            .Select(item => TextParts(item.GetProperty("content"), "output_text")));
    }
}

public sealed class AnthropicProviderAdapter(IHttpClientFactory clients) : AiProviderAdapter(clients)
{
    public override string Provider => "anthropic";
    protected override HttpRequestMessage CreateRequest(ResolvedAiProfile profile, string? prompt)
    {
        var request = new HttpRequestMessage(prompt is null ? HttpMethod.Get : HttpMethod.Post,
            prompt is null ? "https://api.anthropic.com/v1/models/" + Uri.EscapeDataString(profile.ModelId) : "https://api.anthropic.com/v1/messages");
        request.Headers.Add("x-api-key", profile.ApiKey);
        request.Headers.Add("anthropic-version", "2023-06-01");
        if (prompt is not null)
        {
            object thinking = profile.ReasoningLevel == "budget-1024"
                ? new { type = "enabled", budget_tokens = 1024 } : new { type = "disabled" };
            request.Content = JsonContent.Create(new { model = profile.ModelId, max_tokens = 2048, thinking,
                messages = new[] { new { role = "user", content = prompt } } });
        }
        return request;
    }
    protected override string ReadText(JsonElement response)
    {
        if (response.GetProperty("stop_reason").GetString() != "end_turn")
            throw new InvalidOperationException("The provider did not complete the evaluation.");
        return TextParts(response.GetProperty("content"), "text");
    }
}
