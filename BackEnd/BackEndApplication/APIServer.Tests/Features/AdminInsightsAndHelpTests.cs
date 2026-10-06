using System.Text.Json;
using APIServer.Features.Admin;
using APIServer.Features.Faq;
using APIServer.Features.Faq.Contracts;
using APIServer.Infrastructure;
using APIServer.Models;
using APIServer.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace APIServer.Tests.Features;

public sealed class AdminInsightsAndHelpTests
{
    [Fact]
    public async Task BilingualMigrationPreservesExistingFaqAndSearchesBothLanguages()
    {
        await using var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();
        await using var db = new JMSDBContext(new DbContextOptionsBuilder<JMSDBContext>().UseSqlite(connection).Options);
        await db.GetService<IMigrator>().MigrateAsync("20261006114549_AddSavedJobs");
        await db.Database.ExecuteSqlRawAsync("INSERT INTO FaqEntries (Question, Answer, Category, IsPublished, SortOrder, CreatedAt, UpdatedAt) VALUES ('Old question', 'Original answer', 'JMS', 1, 0, '2026-01-01', '2026-01-01')");
        await db.Database.MigrateAsync();
        var old = await db.FaqEntries.SingleAsync();
        Assert.Equal("Original answer", old.Answer); Assert.Null(old.AnswerEn);
        var faq = new FaqService(db);
        var entry = await faq.CreateAsync(new FaqEntryRequest { Question = "Ứng tuyển", Answer = "Chọn CV để gửi", QuestionEn = "Applying for jobs", AnswerEn = "Choose your CV to apply" });
        Assert.Equal(entry.Id, (await faq.SearchAsync("applying")).Single().Id);
        Assert.Equal("Choose your CV to apply", (await faq.AnswerAsync("applying", language: "en")).Answer);
        Assert.Equal("Chọn CV để gửi", (await faq.AnswerAsync("applying", language: "vi")).Answer);
        await faq.UpdateAsync(entry.Id, new FaqEntryRequest { Question = "Ứng tuyển", Answer = "Private draft", QuestionEn = "Applying", IsPublished = false });
        Assert.Empty(await faq.SearchAsync("applying"));
        Assert.Equal("curated-faq-vi", (await faq.AnswerAsync("question", language: "en")).Source);
    }

    [Fact]
    public async Task InsightsUseRealSeededCountsAndBoundedUtcActivityWithoutApplicantDetails()
    {
        await using var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();
        await using var db = new JMSDBContext(new DbContextOptionsBuilder<JMSDBContext>().UseSqlite(connection).Options);
        await db.Database.MigrateAsync();
        await DevelopmentDataSeeder.SeedAsync(db, NullLogger.Instance);
        // This path uses AdminService's database statistics only.
        var admin = new AdminService(null!, null!, new ConfigurationBuilder().Build(), db);
        var insights = await new AdminInsightsService(db, admin).GetAsync(30);
        Assert.Equal(await db.JobDescriptions.CountAsync(x => !x.IsDelete), insights.Totals.TotalJDs);
        Assert.Equal(await db.CVMatchings.CountAsync(x => x.IsApplied), insights.Totals.Applications);
        Assert.Equal(30, insights.Activity.Count);
        Assert.Equal(DateTime.UtcNow.Date.ToString("yyyy-MM-dd"), insights.Activity.Last().Date);
        Assert.Equal(insights.Totals.ActiveJobs, insights.Categories.Sum(x => x.Count));
        Assert.Equal(insights.Totals.TotalMatching, insights.EvaluationStatus.Sum(x => x.Count));
        Assert.NotEmpty(insights.Companies);
        var json = JsonSerializer.Serialize(insights);
        Assert.DoesNotContain("DisplayEmail", json); Assert.DoesNotContain("Phone", json); Assert.DoesNotContain("Password", json);
    }
}
