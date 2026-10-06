using APIServer.Models;
using APIServer.IServices;
using APIServer.DTO.EntityDTO;
using Microsoft.EntityFrameworkCore;
namespace APIServer.Features.Admin;

public sealed record ActivityPoint(string Date, int Jobs, int Applications);
public sealed record CountGroup(string Label, int Count);
public sealed record CompanyActivity(int Id, string Name, int ActiveJobs, int Applications);
public sealed record AttentionCounts(int PendingApplications, int ExpiringJobs, int JobsWithoutApplications, int CandidatesWithoutCv, int RecruitersWithoutCompany);
public sealed record AdminInsights(StatisticDTO Totals, AttentionCounts Attention, IReadOnlyList<ActivityPoint> Activity,
 IReadOnlyList<CountGroup> Categories, IReadOnlyList<CountGroup> EvaluationStatus, IReadOnlyList<CompanyActivity> Companies, int Days, DateTime GeneratedAtUtc);
public sealed class AdminInsightsService(JMSDBContext db, IAdminService admin)
{
    public async Task<AdminInsights> GetAsync(int days, CancellationToken ct = default)
    {
        days = days is 30 or 90 or 365 ? days : 30;
        var now = DateTime.UtcNow; var start = now.Date.AddDays(1 - days); var soon = now.AddDays(7);
        var jobs = db.JobDescriptions.AsNoTracking().Where(x => !x.IsDelete);
        var applications = db.CVMatchings.AsNoTracking().Where(x => x.IsApplied);
        var attention = new AttentionCounts(
         await applications.CountAsync(x => !x.IsSelected && x.IsReject != true, ct),
         await jobs.CountAsync(x => x.ExpiredDate > now && x.ExpiredDate <= soon, ct),
         await jobs.CountAsync(x => x.ExpiredDate > now && !db.CVMatchings.Any(a => a.JobDescriptionId == x.JobId && a.IsApplied), ct),
         await db.Candidates.CountAsync(x => !x.IsDelete && !db.CurriculumVitaes.Any(cv => cv.CandidateId == x.Id && !cv.IsDelete), ct),
         await db.Recuirters.CountAsync(x => !x.IsDelete && !db.Companies.Any(c => c.RecuirterId == x.Id && !c.IsDelete), ct));
        var jobDates = await jobs.Where(x => x.CreatedAt >= start && x.CreatedAt <= now).Select(x => x.CreatedAt).ToListAsync(ct);
        var applicationDates = await applications.Where(x => x.ApplyDate >= start && x.ApplyDate <= now).Select(x => x.ApplyDate).ToListAsync(ct);
        var jobCounts = jobDates.GroupBy(x => x.Date).ToDictionary(x => x.Key, x => x.Count());
        var applicationCounts = applicationDates.GroupBy(x => x.Date).ToDictionary(x => x.Key, x => x.Count());
        var points = Enumerable.Range(0, days).Select(i => start.AddDays(i)).Select(d => new ActivityPoint(d.ToString("yyyy-MM-dd"),
         jobCounts.GetValueOrDefault(d), applicationCounts.GetValueOrDefault(d))).ToList();
        var categoryRows = await jobs.Where(x => x.ExpiredDate > now).GroupBy(x => x.Category == null ? "Chưa phân loại" : x.Category.CategoryName)
         .Select(x => new { Label = x.Key, Count = x.Count() }).OrderByDescending(x => x.Count).ThenBy(x => x.Label).Take(8).ToListAsync(ct);
        var categories = categoryRows.Select(x => new CountGroup(x.Label, x.Count)).ToList();
        var statusRows = await db.CVMatchings.AsNoTracking().GroupBy(x => x.MatchingStatus ?? "legacy")
         .Select(x => new { Label = x.Key, Count = x.Count() }).OrderByDescending(x => x.Count).ToListAsync(ct);
        var status = statusRows.Select(x => new CountGroup(x.Label, x.Count)).ToList();
        var companyRows = await db.Companies.AsNoTracking().Where(x => !x.IsDelete)
         .Select(x => new
         {
             Id = x.CompanyId,
             Name = x.CompanyName,
             ActiveJobs = db.JobDescriptions.Count(j => j.CompanyId == x.CompanyId && !j.IsDelete && j.ExpiredDate > now),
             Applications = db.CVMatchings.Count(a => a.IsApplied && a.JobDescription != null && a.JobDescription.CompanyId == x.CompanyId)
         })
         .OrderByDescending(x => x.Applications).ThenByDescending(x => x.ActiveJobs).ThenBy(x => x.Name).Take(8).ToListAsync(ct);
        var companies = companyRows.Select(x => new CompanyActivity(x.Id, x.Name, x.ActiveJobs, x.Applications)).ToList();
        return new(admin.GetStatisticDTO(), attention, points, categories, status, companies, days, now);
    }
}
