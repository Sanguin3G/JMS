using APIServer.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Xunit;

namespace APIServer.Tests.Common;

public sealed class ApiErrorMessageTests
{
    [Theory]
    [InlineData("Production", false)]
    [InlineData("Development", true)]
    public void InternalDetailsAreOnlyReturnedInDevelopment(string environment, bool detailed)
    {
        using var services = new ServiceCollection().AddSingleton<IHostEnvironment>(new TestEnvironment(environment)).BuildServiceProvider();
        var context = new DefaultHttpContext { RequestServices = services };
        var error = new InvalidOperationException("Internal database path and mapping details");
        var message = ApiErrorMessage.For(error, context);
        Assert.Equal(detailed, message.Contains("Internal database path"));
        Assert.False(string.IsNullOrWhiteSpace(message));
    }

    private sealed class TestEnvironment(string name) : IHostEnvironment
    {
        public string EnvironmentName { get; set; } = name;
        public string ApplicationName { get; set; } = "JMS.Tests";
        public string ContentRootPath { get; set; } = ".";
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    }
}
