using APIServer.Common;
using APIServer.Models;
using APIServer.Models.Entity;
using Microsoft.EntityFrameworkCore;

namespace APIServer.Infrastructure;

/// <summary>
/// Populates an empty development database with fictional data that exercises the main JMS workflows.
/// It intentionally does not seed an AI provider key or invoke an AI model.
/// </summary>
public static class DevelopmentDataSeeder
{
    private const string DemoPassword = "JmsDemo!2026";

    private const string TeamPhoto = "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=crop&w=1600&q=80";
    private const string StudioPhoto = "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=80";
    private const string MeetingPhoto = "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80";
    private const string PortraitOne = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";
    private const string PortraitTwo = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80";
    private const string PortraitThree = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80";

    public static async Task SeedAsync(JMSDBContext dbContext, ILogger logger, CancellationToken cancellationToken = default)
    {
        if (!await dbContext.FaqEntries.AnyAsync(cancellationToken))
        {
            dbContext.FaqEntries.AddRange(
                new FaqEntry
                {
                    Question = "What is JMS matching?",
                    Answer = "JMS compares a CV with a job using deterministic category eligibility and requirement-token scoring. Optional Gemini output adds an explanation; it does not make a hiring decision.",
                    Keywords = "matching score eligibility explanation",
                    Category = "Matching",
                    SortOrder = 1,
                    CreatedAt = new DateTime(2026, 8, 20, 9, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 8, 20, 9, 0, 0, DateTimeKind.Utc)
                },
                new FaqEntry
                {
                    Question = "How do I improve a CV match?",
                    Answer = "Keep the CV current, describe concrete work in each section, and use truthful skills and experience that relate to the job requirements. The match explanation shows evidence and gaps when available.",
                    Keywords = "CV resume improve gaps skills experience",
                    Category = "Candidates",
                    SortOrder = 2,
                    CreatedAt = new DateTime(2026, 8, 20, 9, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 8, 20, 9, 0, 0, DateTimeKind.Utc)
                },
                new FaqEntry
                {
                    Question = "What happens when Gemini is unavailable?",
                    Answer = "The deterministic match score and eligibility result still work. JMS labels the explanation as unavailable or failed and does not expose provider secrets to the browser.",
                    Keywords = "Gemini AI unavailable fallback key",
                    Category = "AI safety",
                    SortOrder = 3,
                    CreatedAt = new DateTime(2026, 8, 20, 9, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 8, 20, 9, 0, 0, DateTimeKind.Utc)
                });
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        if (await dbContext.Admins.AnyAsync(cancellationToken)
            || await dbContext.Candidates.AnyAsync(cancellationToken)
            || await dbContext.Recuirters.AnyAsync(cancellationToken)
            || await dbContext.Companies.AnyAsync(cancellationToken))
        {
            return;
        }

        var now = new DateTime(2026, 8, 20, 9, 0, 0, DateTimeKind.Utc);
        var recruiterRole = new Role { Name = GlobalStrings.ROLE_RECUIRTER, IsDelete = false };
        var employerRole = new Role { Name = "Hiring manager", IsDelete = false };

        var productCategory = new Category { CategoryName = "Product & Technology", Description = "Product, engineering, design, and data roles.", CreatedAt = now, IsDelete = false };
        var peopleCategory = new Category { CategoryName = "People & Operations", Description = "People operations, business support, and talent roles.", CreatedAt = now, IsDelete = false };
        var creativeCategory = new Category { CategoryName = "Creative & Marketing", Description = "Brand, content, and visual communication roles.", CreatedAt = now, IsDelete = false };
        var fullTime = new EmploymentType { Title = "Full time", IsDelete = false };
        var hybrid = new EmploymentType { Title = "Hybrid", IsDelete = false };
        var junior = new Level { Title = "Junior", Description = "Early-career professional", IsDelete = false };
        var mid = new Level { Title = "Mid-level", Description = "Independent contributor", IsDelete = false };
        var senior = new Level { Title = "Senior", Description = "Experienced specialist or technical lead", IsDelete = false };

        var admin = new Admin
        {
            UserName = "demo.admin",
            FullName = "JMS Development Admin",
            Password = BCrypt.Net.BCrypt.HashPassword(DemoPassword),
            PhoneNumber = "0900000001",
            DOB = new DateTime(1990, 6, 15),
            CreatedDate = now,
            LastUpdateDate = now,
            IsActive = true,
            IsDelete = false
        };

        var recruiterOne = new Recuirter
        {
            FullName = "Minh Tran",
            UserName = "minh.northstar",
            Email = "minh@northstar-labs.example",
            Password = BCrypt.Net.BCrypt.HashPassword(DemoPassword),
            GenderId = 2,
            PhoneNumber = "0900000101",
            DOB = new DateTime(1991, 3, 11),
            CreatedDate = now.AddDays(-90),
            LastUpdate = now.AddDays(-2),
            Description = "Talent partner for product and engineering teams.",
            Role = recruiterRole,
            IsActive = true,
            IsDelete = false,
            AvatarURL = PortraitTwo
        };
        var recruiterTwo = new Recuirter
        {
            FullName = "Linh Nguyen",
            UserName = "linh.paperkite",
            Email = "linh@paperkite.example",
            Password = BCrypt.Net.BCrypt.HashPassword(DemoPassword),
            GenderId = 3,
            PhoneNumber = "0900000102",
            DOB = new DateTime(1992, 11, 22),
            CreatedDate = now.AddDays(-65),
            LastUpdate = now.AddDays(-1),
            Description = "Building thoughtful teams for creative technology work.",
            Role = employerRole,
            IsActive = true,
            IsDelete = false,
            AvatarURL = PortraitOne
        };

        var northstar = new Company
        {
            CompanyName = "Northstar Labs",
            Email = "hello@northstar-labs.example",
            Phone = "0280000101",
            Address = "District 1, Ho Chi Minh City",
            Description = "A fictional product studio making practical tools for ambitious teams.",
            DateCreated = now.AddDays(-90),
            Category = productCategory,
            Recuirter = recruiterOne,
            YearOfEstablishment = 2021,
            WebURL = "https://northstar-labs.example",
            IsDelete = false,
            Size = "51-200",
            AvatarURL = TeamPhoto,
            BackGroundURL = StudioPhoto
        };
        var paperkite = new Company
        {
            CompanyName = "Paper Kite Studio",
            Email = "hello@paperkite.example",
            Phone = "0280000102",
            Address = "Binh Thanh, Ho Chi Minh City",
            Description = "A fictional design and brand studio for products people enjoy using.",
            DateCreated = now.AddDays(-65),
            Category = creativeCategory,
            Recuirter = recruiterTwo,
            YearOfEstablishment = 2022,
            WebURL = "https://paperkite.example",
            IsDelete = false,
            Size = "11-50",
            AvatarURL = MeetingPhoto,
            BackGroundURL = TeamPhoto
        };

        var jobOne = new JobDescription
        {
            Recuirter = recruiterOne,
            Company = northstar,
            Title = "Frontend Engineer — Angular",
            PositionTitle = "Frontend Engineer",
            Category = productCategory,
            Level = mid,
            EmploymentType = fullTime,
            GenderId = 1,
            AgeRequirement = "Open to all eligible applicants",
            EducationRequirement = "Practical experience or relevant portfolio",
            ExperienceRequirement = "2+ years building production Angular applications",
            SkillRequirement = "Angular, TypeScript, accessible HTML/CSS, REST APIs",
            JobDetail = "Own polished candidate-facing workflows and collaborate closely with backend and product peers.",
            CandidateBenefit = "Learning budget, flexible hybrid schedule, and a small team that reviews work carefully.",
            Salary = "35,000,000–48,000,000 VND",
            ContactEmail = "minh@northstar-labs.example",
            Address = northstar.Address,
            CreatedAt = now.AddDays(-8),
            ExpiredDate = now.AddDays(32),
            IsDelete = false,
            NumberRequirement = 1,
            MatchingNumberRequirement = 8
        };
        var jobTwo = new JobDescription
        {
            Recuirter = recruiterTwo,
            Company = paperkite,
            Title = "Product Designer",
            PositionTitle = "Product Designer",
            Category = creativeCategory,
            Level = junior,
            EmploymentType = hybrid,
            GenderId = 1,
            ExperienceRequirement = "A portfolio showing product-thinking and visual craft.",
            SkillRequirement = "Figma, user flows, prototyping, visual systems, clear writing",
            JobDetail = "Shape experiments from rough problem framing through usable interface detail.",
            CandidateBenefit = "A small studio, direct client exposure, and room to make the work unmistakably yours.",
            Salary = "22,000,000–32,000,000 VND",
            ContactEmail = "linh@paperkite.example",
            Address = paperkite.Address,
            CreatedAt = now.AddDays(-5),
            ExpiredDate = now.AddDays(35),
            IsDelete = false,
            NumberRequirement = 1,
            MatchingNumberRequirement = 6
        };

        var candidateOne = new Candidate
        {
            UserName = "an.le",
            FullName = "An Le",
            Email = "an.le@example.test",
            Password = BCrypt.Net.BCrypt.HashPassword(DemoPassword),
            GenderId = 3,
            PhoneNumber = "0900000201",
            DOB = new DateTime(1998, 4, 17),
            CreatedDate = now.AddDays(-44),
            LastUpdateDate = now.AddDays(-1),
            IsActive = true,
            IsDelete = false,
            AvatarURL = PortraitOne
        };
        var candidateTwo = new Candidate
        {
            UserName = "duc.pham",
            FullName = "Duc Pham",
            Email = "duc.pham@example.test",
            Password = BCrypt.Net.BCrypt.HashPassword(DemoPassword),
            GenderId = 2,
            PhoneNumber = "0900000202",
            DOB = new DateTime(1996, 9, 3),
            CreatedDate = now.AddDays(-31),
            LastUpdateDate = now.AddDays(-3),
            IsActive = true,
            IsDelete = false,
            AvatarURL = PortraitThree
        };

        var anCv = new CurriculumVitae
        {
            Candidate = candidateOne,
            CareerGoal = "Build recruitment and career products that feel calm, useful, and surprisingly human.",
            EmploymentType = fullTime,
            Phone = candidateOne.PhoneNumber,
            DisplayName = candidateOne.FullName,
            GenderId = candidateOne.GenderId,
            DisplayEmail = candidateOne.Email,
            Address = "Ho Chi Minh City",
            DOB = candidateOne.DOB,
            CreatedDate = now.AddDays(-30),
            LastUpdateDate = now.AddDays(-1),
            Level = mid,
            IsActive = true,
            IsDelete = false,
            Category = productCategory,
            IsFindingJob = true,
            CVTitle = "Angular engineer — product-minded",
            Theme = 6,
            Font = "Arial",
            AvatarURL = PortraitOne
        };
        var ducCv = new CurriculumVitae
        {
            Candidate = candidateTwo,
            CareerGoal = "Help teams turn ambiguous problems into honest, legible interfaces.",
            EmploymentType = hybrid,
            Phone = candidateTwo.PhoneNumber,
            DisplayName = candidateTwo.FullName,
            GenderId = candidateTwo.GenderId,
            DisplayEmail = candidateTwo.Email,
            Address = "Thu Duc City",
            DOB = candidateTwo.DOB,
            CreatedDate = now.AddDays(-21),
            LastUpdateDate = now.AddDays(-3),
            Level = junior,
            IsActive = true,
            IsDelete = false,
            Category = creativeCategory,
            IsFindingJob = true,
            CVTitle = "Product designer — systems and story",
            Theme = 3,
            Font = "Helvetica",
            AvatarURL = PortraitThree
        };

        dbContext.AddRange(
            recruiterRole, employerRole, productCategory, peopleCategory, creativeCategory, fullTime, hybrid, junior, mid, senior,
            admin, recruiterOne, recruiterTwo, northstar, paperkite, jobOne, jobTwo, candidateOne, candidateTwo, anCv, ducCv,
            new EmployeeInCompany { Recuirter = recruiterOne, Company = northstar, StartDate = now.AddDays(-90), IsWorking = true },
            new EmployeeInCompany { Recuirter = recruiterTwo, Company = paperkite, StartDate = now.AddDays(-65), IsWorking = true },
            new Skill { CurriculumVitae = anCv, Title = "Angular", SkillDescription = "Maintains modular Angular applications with attention to accessibility and useful interaction details." },
            new Skill { CurriculumVitae = anCv, Title = "TypeScript", SkillDescription = "Comfortable improving typed API boundaries and untangling legacy UI state." },
            new JobExperience { CurriculumVitae = anCv, ComapanyName = "Lantern Works", Position = "Frontend Developer", FromDate = "06/2023", ToDate = "Present", Description = "Delivered internal workflow tools and public-facing forms.", EmploymentType = fullTime },
            new Education { CurriculumVitae = anCv, SchoolName = "Fictional University of Technology", MajorName = "Software Engineering", FromYear = "09/2016", ToYear = "06/2020", Description = "Capstone focus: matching systems and usable forms.", StillLearning = false },
            new Project { CurriculumVitae = anCv, ProjectName = "JMS Fork", FromDate = "07/2026", ToDate = "Present", Description = "Modernization of a graduation job-matching platform.", IsStillWorking = true },
            new Certificate { CurriculumVitae = anCv, CertificateName = "Web Accessibility Foundations", CertificateProvider = "Independent study", IssuedDate = "03/2025" },
            new Award { CurriculumVitae = anCv, AwardName = "Best capstone interface", FromYear = "2020", Description = "Fictional development seed achievement." },
            new Skill { CurriculumVitae = ducCv, Title = "Product design", SkillDescription = "Turns research notes and awkward edge cases into focused interface systems." },
            new Skill { CurriculumVitae = ducCv, Title = "Prototyping", SkillDescription = "Uses prototypes to resolve interaction questions before visual polish." },
            new JobExperience { CurriculumVitae = ducCv, ComapanyName = "Small Signals", Position = "Junior Product Designer", FromDate = "01/2025", ToDate = "Present", Description = "Worked on onboarding, design-system cleanup, and usability testing.", EmploymentType = hybrid },
            new Education { CurriculumVitae = ducCv, SchoolName = "Fictional School of Art and Design", MajorName = "Interaction Design", FromYear = "09/2018", ToYear = "06/2022", Description = "Focused on systems, typography, and interface critique.", StillLearning = false },
            new Project { CurriculumVitae = ducCv, ProjectName = "Night Shift Notes", FromDate = "02/2026", ToDate = "05/2026", Description = "A fictional case study for a shared-team planning tool.", IsStillWorking = false },
            new CVMatching
            {
                Candidate = candidateOne, CurriculumVitae = anCv, JobDescription = jobOne,
                CareerGoal = anCv.CareerGoal, Phone = anCv.Phone, DisplayName = anCv.DisplayName, DisplayEmail = anCv.DisplayEmail,
                GenderId = anCv.GenderId, DOB = anCv.DOB, Address = anCv.Address, Level = mid, EmploymentType = fullTime,
                CategoryName = productCategory.CategoryName, ApplyDate = now.AddDays(-2), CreatedDate = now.AddDays(-2), LastUpdateDate = now.AddDays(-2),
                PercentMatching = 84, IsMatched = true, IsApplied = true, IsSelected = false, IsReject = false, Theme = anCv.Theme, Font = anCv.Font,
                AvatarURL = PortraitOne, Skill = "Angular; TypeScript", JobExperience = "Frontend Developer", Education = "Software Engineering",
                Project = "JMS Fork", JSONMatching = "{\"summary\":\"Development seed: strong frontend and product fit.\",\"source\":\"seed\"}",
                MatchingRulesVersion = "deterministic-v1", MatchingProvider = "development-seed", MatchingModel = "fixture",
                MatchingStatus = "complete", MatchingEligibilityStatus = "eligible", MatchingExplanation = "Development seed: strong frontend and product fit.", MatchingEvaluatedAtUtc = now.AddDays(-2)
            },
            new CVMatching
            {
                Candidate = candidateTwo, CurriculumVitae = ducCv, JobDescription = jobTwo,
                CareerGoal = ducCv.CareerGoal, Phone = ducCv.Phone, DisplayName = ducCv.DisplayName, DisplayEmail = ducCv.DisplayEmail,
                GenderId = ducCv.GenderId, DOB = ducCv.DOB, Address = ducCv.Address, Level = junior, EmploymentType = hybrid,
                CategoryName = creativeCategory.CategoryName, ApplyDate = now.AddDays(-1), CreatedDate = now.AddDays(-1), LastUpdateDate = now.AddDays(-1),
                PercentMatching = 88, IsMatched = true, IsApplied = false, IsSelected = true, IsReject = false, Theme = ducCv.Theme, Font = ducCv.Font,
                AvatarURL = PortraitThree, Skill = "Product design; Prototyping", JobExperience = "Junior Product Designer", Education = "Interaction Design",
                Project = "Night Shift Notes", JSONMatching = "{\"summary\":\"Development seed: strong portfolio and craft fit.\",\"source\":\"seed\"}",
                MatchingRulesVersion = "deterministic-v1", MatchingProvider = "development-seed", MatchingModel = "fixture",
                MatchingStatus = "complete", MatchingEligibilityStatus = "eligible", MatchingExplanation = "Development seed: strong portfolio and craft fit.", MatchingEvaluatedAtUtc = now.AddDays(-1)
            });

        await dbContext.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Seeded the empty JMS development database with fictional portfolio data.");
    }
}
