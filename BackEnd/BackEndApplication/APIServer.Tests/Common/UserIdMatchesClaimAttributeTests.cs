using System.Security.Claims;
using APIServer.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using Xunit;

namespace APIServer.Tests.Common;

public sealed class UserIdMatchesClaimAttributeTests
{
    [Fact]
    public void OnActionExecuting_AllowsMatchingUserId()
    {
        var context = CreateContext("candidateId", 42, "42");

        new UserIdMatchesClaimAttribute("candidateId").OnActionExecuting(context);

        Assert.Null(context.Result);
    }

    [Fact]
    public void OnActionExecuting_ForbidsDifferentUserId()
    {
        var context = CreateContext("candidateId", 42, "7");

        new UserIdMatchesClaimAttribute("candidateId").OnActionExecuting(context);

        Assert.IsType<ForbidResult>(context.Result);
    }

    [Fact]
    public void OnActionExecuting_ForbidsMissingUserIdClaim()
    {
        var context = CreateContext("candidateId", 42, null);

        new UserIdMatchesClaimAttribute("candidateId").OnActionExecuting(context);

        Assert.IsType<ForbidResult>(context.Result);
    }

    [Fact]
    public void OnActionExecuting_ForbidsMissingActionArgument()
    {
        var context = CreateContext("candidateId", null, "42");

        new UserIdMatchesClaimAttribute("candidateId").OnActionExecuting(context);

        Assert.IsType<ForbidResult>(context.Result);
    }

    private static ActionExecutingContext CreateContext(string parameterName, int? value, string? userIdClaim)
    {
        var httpContext = new DefaultHttpContext();
        if (userIdClaim is not null)
        {
            httpContext.User = new ClaimsPrincipal(new ClaimsIdentity(
                [new Claim("UserId", userIdClaim)], "Test"));
        }

        var actionContext = new ActionContext(httpContext, new RouteData(), new ActionDescriptor());
        var actionArguments = new Dictionary<string, object?>();
        if (value is not null)
        {
            actionArguments[parameterName] = value.Value;
        }

        return new ActionExecutingContext(actionContext, [], actionArguments, new object());
    }
}
