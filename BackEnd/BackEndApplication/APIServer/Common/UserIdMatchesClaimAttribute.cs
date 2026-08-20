using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace APIServer.Common;

/// <summary>
/// Prevents a caller from using a route or query user ID that differs from the
/// identity established by the access token.
/// </summary>
[AttributeUsage(AttributeTargets.Method, AllowMultiple = false)]
public sealed class UserIdMatchesClaimAttribute : ActionFilterAttribute
{
    private readonly string parameterName;

    public UserIdMatchesClaimAttribute(string parameterName)
    {
        this.parameterName = parameterName;
    }

    public override void OnActionExecuting(ActionExecutingContext context)
    {
        var claimValue = context.HttpContext.User.FindFirstValue("UserId");
        var argument = context.ActionArguments.TryGetValue(parameterName, out var value)
            ? value
            : null;

        if (!int.TryParse(claimValue, out var authenticatedUserId) ||
            argument is not int requestedUserId ||
            requestedUserId != authenticatedUserId)
        {
            context.Result = new ForbidResult();
        }
    }
}
