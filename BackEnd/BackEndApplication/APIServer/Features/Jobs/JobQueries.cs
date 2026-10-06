using APIServer.Models.Entity;
using Microsoft.EntityFrameworkCore;

namespace APIServer.Features.Jobs;

public static class JobQueries
{
    public static IQueryable<JobDescription> WithDetails(IQueryable<JobDescription> jobs) => jobs
        .Include(job => job.Company).Include(job => job.Category).Include(job => job.EmploymentType)
        .Include(job => job.Level).Include(job => job.Gender);

    public static IQueryable<JobDescription> PubliclyVisible(IQueryable<JobDescription> jobs) =>
        jobs.Where(job => !job.IsDelete && job.Company != null && !job.Company.IsDelete);
}
