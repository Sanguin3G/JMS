using System.Net;
using System.Text.Json;
using APIServer.Features.AiConfiguration;
using APIServer.Features.AiConfiguration.Contracts;
using Xunit;

namespace APIServer.Tests.Features.AiConfiguration;

public sealed class ProviderAdapterTests
{
    [Fact]
    public async Task SonnetUsesEffortAndBetweenToolsInsteadOfHaikusThinkingBudget()
    {
        var handler = new RecordingHandler("anthropic");
        var adapter = Create("anthropic", new ClientFactory(handler));
        await adapter.GenerateAsync(new("anthropic", "test-key", "claude-sonnet-5-5", "low"), "Return JSON", default);
        using var body = JsonDocument.Parse(handler.Body!);
        Assert.Equal("between_tools", body.RootElement.GetProperty("thinking").GetProperty("type").GetString());
        Assert.Equal("low", body.RootElement.GetProperty("output_config").GetProperty("effort").GetString());
        Assert.False(body.RootElement.GetProperty("thinking").TryGetProperty("budget_tokens", out _));
    }

    [Theory]
    [InlineData("gemini", "gemini-3.1-flash-lite", "low")]
    [InlineData("openai", "gpt-5-mini", "minimal")]
    [InlineData("anthropic", "claude-haiku-4-5-20251001", "budget-1024")]
    public async Task AdaptersSendTheirOwnReasoningContractAndReadOnlyVisibleText(string provider, string model, string reasoning)
    {
        var handler = new RecordingHandler(provider);
        var adapter = Create(provider, new ClientFactory(handler));
        Assert.Equal("{\"summary\":\"Evidence\"}", await adapter.GenerateAsync(new(provider, "test-key", model, reasoning), "Return JSON", default));
        using var body = JsonDocument.Parse(handler.Body!);
        Assert.Equal(HttpMethod.Post, handler.Method);
        Assert.DoesNotContain("test-key", handler.Url);
        switch (provider)
        {
            case "gemini":
                Assert.Equal(reasoning, body.RootElement.GetProperty("generationConfig").GetProperty("thinkingConfig").GetProperty("thinkingLevel").GetString());
                Assert.Equal("test-key", handler.ApiKey);
                break;
            case "openai":
                Assert.Equal(reasoning, body.RootElement.GetProperty("reasoning").GetProperty("effort").GetString());
                Assert.False(body.RootElement.GetProperty("store").GetBoolean());
                Assert.Equal("Bearer test-key", handler.Authorization);
                break;
            case "anthropic":
                Assert.Equal(1024, body.RootElement.GetProperty("thinking").GetProperty("budget_tokens").GetInt32());
                Assert.True(body.RootElement.GetProperty("max_tokens").GetInt32() > 1024);
                Assert.Equal("2023-06-01", handler.Version);
                break;
        }
    }

    [Theory]
    [InlineData("gemini", "gemini-3.1-flash-lite")]
    [InlineData("openai", "gpt-5-mini")]
    [InlineData("anthropic", "claude-haiku-4-5-20251001")]
    public async Task ConnectionChecksDoNotGenerateBillableContent(string provider, string model)
    {
        var handler = new RecordingHandler(provider);
        await Create(provider, new ClientFactory(handler)).TestAsync(new(provider, "test-key", model, "unused"), default);
        Assert.Equal(HttpMethod.Get, handler.Method);
        Assert.Null(handler.Body);
        Assert.Contains("/models/" + model, handler.Url);
    }

    [Fact]
    public async Task ProviderErrorsDoNotExposeResponseBody()
    {
        var handler = new RecordingHandler("openai", HttpStatusCode.Unauthorized);
        var exception = await Assert.ThrowsAsync<HttpRequestException>(() => Create("openai", new ClientFactory(handler))
            .GenerateAsync(new("openai", "test-key", "gpt-5-mini", "minimal"), "Return JSON", default));
        Assert.DoesNotContain("sensitive-provider-error", exception.ToString());
    }

    private static IAiProviderAdapter Create(string provider, IHttpClientFactory factory) => provider switch
    {
        "gemini" => new GeminiProviderAdapter(factory), "openai" => new OpenAiProviderAdapter(factory),
        _ => new AnthropicProviderAdapter(factory)
    };

    private sealed class ClientFactory(HttpMessageHandler handler) : IHttpClientFactory
    {
        public HttpClient CreateClient(string name) => new(handler, disposeHandler: false);
    }

    private sealed class RecordingHandler(string provider, HttpStatusCode status = HttpStatusCode.OK) : HttpMessageHandler
    {
        public HttpMethod? Method { get; private set; }
        public string Url { get; private set; } = "";
        public string? Body { get; private set; }
        public string? ApiKey { get; private set; }
        public string? Authorization { get; private set; }
        public string? Version { get; private set; }
        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            Method = request.Method;
            Url = request.RequestUri!.ToString();
            Body = request.Content is null ? null : await request.Content.ReadAsStringAsync(cancellationToken);
            Authorization = request.Headers.Authorization?.ToString();
            ApiKey = request.Headers.TryGetValues(provider == "gemini" ? "x-goog-api-key" : "x-api-key", out var keys) ? keys.Single() : null;
            Version = request.Headers.TryGetValues("anthropic-version", out var versions) ? versions.Single() : null;
            var text = "{\"summary\":\"Evidence\"}";
            object response = provider switch
            {
                "gemini" => new { candidates = new[] { new { content = new { parts = new object[] { new { text = "private thinking", thought = true }, new { text } } } } } },
                "openai" => new { status = "completed", output = new object[] { new { type = "reasoning" }, new { type = "message", content = new[] { new { type = "output_text", text } } } } },
                _ => new { stop_reason = "end_turn", content = new object[] { new { type = "thinking", thinking = "private thinking" }, new { type = "text", text } } }
            };
            return new HttpResponseMessage(status) { Content = new StringContent(status == HttpStatusCode.OK ? JsonSerializer.Serialize(response) : "sensitive-provider-error") };
        }
    }
}
