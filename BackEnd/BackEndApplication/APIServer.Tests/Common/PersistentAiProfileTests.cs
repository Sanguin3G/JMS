using APIServer.Features.AiConfiguration;
using APIServer.Models;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace APIServer.Tests.Common;

public sealed class PersistentAiProfileTests
{
    [Fact]
    public async Task EncryptedProfileRemainsReadableAfterRecreatingDatabaseAndKeyProviders()
    {
        var root = Path.Combine(Path.GetTempPath(), "jms-persistence-test-" + Guid.NewGuid());
        Directory.CreateDirectory(root);
        try
        {
            var options = new DbContextOptionsBuilder<JMSDBContext>()
                .UseSqlite($"Data Source={Path.Combine(root, "jms.db")};Pooling=False").Options;
            var keys = new DirectoryInfo(Path.Combine(root, "keys"));
            keys.Create();
            await using (var original = new JMSDBContext(options))
            {
                await original.Database.MigrateAsync();
                var profiles = new AiProviderProfileService(original,
                    DataProtectionProvider.Create(keys, builder => builder.SetApplicationName("JMS")), []);
                await profiles.CreateAsync(new()
                {
                    Provider = "openai", ModelId = "gpt-5-mini", DisplayName = "Persistence test",
                    ApiKey = "fictional-persistence-test-key", IsDefaultForMatching = true
                });
            }
            await using (var restarted = new JMSDBContext(options))
            {
                await restarted.Database.MigrateAsync();
                var profiles = new AiProviderProfileService(restarted,
                    DataProtectionProvider.Create(keys, builder => builder.SetApplicationName("JMS")), []);
                var profile = await profiles.GetActiveMatchingProfileAsync();
                Assert.Equal("fictional-persistence-test-key", profile!.ApiKey);
                Assert.Single(await profiles.GetAllAsync());
                Assert.Equal(restarted.Database.GetMigrations(), await restarted.Database.GetAppliedMigrationsAsync());
            }
        }
        finally
        {
            SqliteConnection.ClearAllPools();
            Directory.Delete(root, recursive: true);
        }
    }
}
