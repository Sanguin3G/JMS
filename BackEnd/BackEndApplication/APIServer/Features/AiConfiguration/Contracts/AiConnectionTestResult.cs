namespace APIServer.Features.AiConfiguration.Contracts;

public sealed record AiConnectionTestResult(
    bool Success,
    string Status,
    string Provider,
    string ModelId,
    DateTime TestedAtUtc);
