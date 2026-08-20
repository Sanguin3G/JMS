using APIServer.Models;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace APIServer.Infrastructure;

public sealed class SqliteHealthCheck(JMSDBContext dbContext) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            return await dbContext.Database.CanConnectAsync(cancellationToken)
                ? HealthCheckResult.Healthy("SQLite is reachable.")
                : HealthCheckResult.Unhealthy("SQLite is not reachable.");
        }
        catch (Exception exception)
        {
            return HealthCheckResult.Unhealthy("SQLite readiness check failed.", exception);
        }
    }
}
