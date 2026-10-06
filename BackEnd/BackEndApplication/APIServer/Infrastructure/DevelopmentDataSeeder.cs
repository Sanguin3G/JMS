using APIServer.Features.Matching;
using APIServer.Features.Matching.Contracts;
using Newtonsoft.Json;
using APIServer.DTO.EntityDTO;
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

    private const string TeamPhoto = "/defaults/northstar.svg";
    private const string StudioPhoto = "/defaults/workspace.jpg";
    private const string MeetingPhoto = "/defaults/paperkite.svg";
    private const string PortraitOne = "/defaults/avatar.svg";
    private const string PortraitTwo = "/defaults/avatar.svg";
    private const string PortraitThree = "/defaults/avatar.svg";

    public static async Task SeedAsync(JMSDBContext dbContext, ILogger logger, CancellationToken cancellationToken = default)
    {
        if (!await dbContext.FaqEntries.AnyAsync(cancellationToken))
        {
            dbContext.FaqEntries.AddRange(
                new FaqEntry
                {
                    Question = "JMS đánh giá độ phù hợp như thế nào?",
                    QuestionEn = "How does JMS evaluate matching?",
                    AnswerEn = "JMS compares a CV with job requirements using categories and deterministic criteria. AI can add explanations and evidence; the recruiter makes hiring decisions.",
                    Answer = "JMS so sánh CV với công việc theo ngành nghề và các tiêu chí xác định. AI có thể bổ sung giải thích và bằng chứng; quyết định tuyển dụng thuộc về nhà tuyển dụng.",
                    Keywords = "matching score eligibility explanation",
                    Category = "Matching",
                    SortOrder = 1,
                    CreatedAt = new DateTime(2026, 8, 20, 9, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 8, 20, 9, 0, 0, DateTimeKind.Utc)
                },
                new FaqEntry
                {
                    Question = "Làm thế nào để cải thiện CV?",
                    QuestionEn = "How can I improve my CV?",
                    AnswerEn = "Keep your CV current. Describe your contribution clearly and present relevant skills and experience honestly. Matching evidence helps you see strengths and gaps worth exploring.",
                    Answer = "Cập nhật CV, mô tả cụ thể công việc đã làm và trình bày trung thực kỹ năng, kinh nghiệm liên quan. Phần đánh giá giúp bạn hiểu bằng chứng phù hợp và những điểm còn thiếu.",
                    Keywords = "CV resume improve gaps skills experience",
                    Category = "Candidates",
                    SortOrder = 2,
                    CreatedAt = new DateTime(2026, 8, 20, 9, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 8, 20, 9, 0, 0, DateTimeKind.Utc)
                },
                new FaqEntry
                {
                    Question = "Điều gì xảy ra khi AI không khả dụng?",
                    QuestionEn = "What happens when AI is unavailable?",
                    AnswerEn = "Deterministic scores and evaluation results still work. JMS identifies unavailable AI explanations and keeps API keys on the server.",
                    Answer = "Điểm số và kết quả đánh giá theo quy tắc vẫn hoạt động. JMS thông báo khi phần giải thích AI không khả dụng và luôn giữ khóa API trên máy chủ.",
                    Keywords = "AI unavailable fallback key không khả dụng",
                    Category = "AI safety",
                    SortOrder = 3,
                    CreatedAt = new DateTime(2026, 8, 20, 9, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 8, 20, 9, 0, 0, DateTimeKind.Utc)
                },
                new FaqEntry
                {
                    Question = "Làm sao tìm, lưu và ứng tuyển công việc?",
                    Answer = "Dùng Tìm việc để lọc theo từ khóa, ngành nghề, địa điểm hoặc hình thức. Mở công việc để đọc yêu cầu; Lưu để xem lại sau. Khi ứng tuyển, chọn một CV đã tạo. Theo dõi CV đã gửi và trạng thái tại Ứng tuyển của bạn.",
                    QuestionEn = "How do I find, save and apply for jobs?",
                    AnswerEn = "Use Find jobs to filter by keyword, category, location or employment type. Open a job to read its requirements; save it to revisit later. To apply, choose a CV you have created. Follow the submitted snapshot and status in Your applications.",
                    Keywords = "job search save bookmark apply application tìm việc lưu ứng tuyển",
                    Category = "Candidates", SortOrder = 4, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
                },
                new FaqEntry
                {
                    Question = "Nhà tuyển dụng xem xét ứng viên ở đâu?",
                    Answer = "Mở tin tuyển dụng trong khu vực Nhà tuyển dụng, rồi vào danh sách ứng viên. Đọc CV, bằng chứng matching và giải thích AI nếu có. Bạn có thể chọn hoặc từ chối hồ sơ; AI không thực hiện quyết định đó.",
                    QuestionEn = "Where can recruiters review candidates?",
                    AnswerEn = "Open a job in the recruiter workspace, then its candidate list. Read the CV, matching evidence and any available AI explanation. You can select or reject an application; AI never makes that decision.",
                    Keywords = "recruiter review candidate shortlist reject nhà tuyển dụng ứng viên",
                    Category = "Recruiters", SortOrder = 5, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
                },
                new FaqEntry
                {
                    Question = "Calibration có ảnh hưởng đến tuyển dụng không?",
                    Answer = "Không. Đây là truyện tương tác để giải trí, có vài gợi ý tự suy ngẫm tùy bạn muốn nhận hay không. Kết thúc và lượt đang chơi chỉ lưu trên thiết bị; không gửi vào CV, matching hay hồ sơ nhà tuyển dụng. Bạn có thể xóa bộ sưu tập trong trò chơi.",
                    QuestionEn = "Does Calibration affect recruitment?",
                    AnswerEn = "No. It is interactive fiction for entertainment, with optional reflection. Endings and the current run stay on your device; they never enter your CV, matching or recruiter records. You can clear the collection in the game.",
                    Keywords = "calibration game personality entertainment privacy trò chơi tính cách",
                    Category = "JMS basics", SortOrder = 6, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
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

        // Stable relative dates keep freshly initialized demos useful over time.
        var now = DateTime.UtcNow.Date.AddHours(9);
        var recruiterRole = new Role { Name = GlobalStrings.ROLE_RECUIRTER, IsDelete = false };
        var employerRole = new Role { Name = "Hiring manager", IsDelete = false };

        var productCategory = new Category { CategoryName = "Công nghệ & Sản phẩm", Description = "Phát triển phần mềm, dữ liệu và sản phẩm số.", CreatedAt = now, IsDelete = false };
        var peopleCategory = new Category { CategoryName = "Nhân sự & Vận hành", Description = "Nhân sự, vận hành và hỗ trợ doanh nghiệp.", CreatedAt = now, IsDelete = false };
        var creativeCategory = new Category { CategoryName = "Sáng tạo & Marketing", Description = "Thiết kế, thương hiệu và truyền thông.", CreatedAt = now, IsDelete = false };
        var fullTime = new EmploymentType { Title = "Toàn thời gian", IsDelete = false };
        var hybrid = new EmploymentType { Title = "Linh hoạt tại văn phòng", IsDelete = false };
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
            FullName = "Trần Minh",
            UserName = "minh.northstar",
            Email = "minh@northstar-labs.example",
            Password = BCrypt.Net.BCrypt.HashPassword(DemoPassword),
            GenderId = 2,
            PhoneNumber = "0900000101",
            DOB = new DateTime(1991, 3, 11),
            CreatedDate = now.AddDays(-90),
            LastUpdate = now.AddDays(-2),
            Description = "Kết nối đội ngũ sản phẩm với kỹ sư thích làm ra những công cụ hữu ích.",
            Role = recruiterRole,
            IsActive = true,
            IsDelete = false,
            AvatarURL = PortraitTwo
        };
        var recruiterTwo = new Recuirter
        {
            FullName = "Nguyễn Linh",
            UserName = "linh.paperkite",
            Email = "linh@paperkite.example",
            Password = BCrypt.Net.BCrypt.HashPassword(DemoPassword),
            GenderId = 3,
            PhoneNumber = "0900000102",
            DOB = new DateTime(1992, 11, 22),
            CreatedDate = now.AddDays(-65),
            LastUpdate = now.AddDays(-1),
            Description = "Tìm đồng đội yêu thiết kế, biết đặt câu hỏi và sẵn sàng thử nghiệm.",
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
            Address = "Quận 1, TP. Hồ Chí Minh",
            Description = "Northstar Labs là công ty mẫu của JMS: một nhóm xây dựng sản phẩm số cho doanh nghiệp nhỏ. Chúng tôi thích những công cụ gọn gàng, giải quyết được việc thật — từ bảng điều phối giao hàng đến trải nghiệm tìm việc. Nhóm sản phẩm làm việc cùng kỹ sư, thử nghiệm sớm và dành thời gian cho chất lượng.",
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
            Address = "Bình Thạnh, TP. Hồ Chí Minh",
            Description = "Paper Kite Studio là studio mẫu của JMS, kết hợp thiết kế sản phẩm và kể chuyện thương hiệu. Nhóm nhỏ, trao đổi trực tiếp và chú ý từng chi tiết: một luồng đăng ký dễ hiểu, một bộ chữ có cá tính hay một nguyên mẫu đủ tốt để kiểm chứng ý tưởng. Hồ sơ có quá trình suy nghĩ rõ ràng luôn được chào đón.",
            DateCreated = now.AddDays(-65),
            Category = creativeCategory,
            Recuirter = recruiterTwo,
            YearOfEstablishment = 2022,
            WebURL = "https://paperkite.example",
            IsDelete = false,
            Size = "11-50",
            AvatarURL = MeetingPhoto,
            BackGroundURL = "/defaults/team-work.jpg"
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
            AgeRequirement = "Không giới hạn độ tuổi",
            EducationRequirement = "Kinh nghiệm thực tế hoặc portfolio phù hợp",
            ExperienceRequirement = "Từ 2 năm phát triển ứng dụng Angular thực tế",
            SkillRequirement = "Angular, TypeScript, accessible HTML/CSS, REST APIs",
            JobDetail = "<p>Tham gia nhóm xây dựng công cụ tìm việc và quản lý hồ sơ. Bạn phụ trách trải nghiệm từ tìm kiếm đến biểu mẫu ứng tuyển, phối hợp cùng backend và thiết kế.</p><ul><li>Xây dựng giao diện Angular và API typed bằng TypeScript.</li><li>Cải thiện khả năng truy cập, xử lý trạng thái tải và lỗi.</li><li>Review code, chia sẻ cách làm và đo hiệu quả của thay đổi.</li></ul>",
            CandidateBenefit = "<ul><li>Ngân sách học tập và thời gian chia sẻ kỹ thuật mỗi tháng.</li><li>Làm việc linh hoạt 2 ngày từ xa mỗi tuần.</li><li>Review code có trao đổi, không chạy theo số lượng ticket.</li></ul>",
            Salary = "35–48 triệu đồng",
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
            ExperienceRequirement = "Portfolio thể hiện tư duy sản phẩm và khả năng hoàn thiện giao diện.",
            SkillRequirement = "Figma, user flows, prototyping, visual systems, clear writing",
            JobDetail = "<p>Thiết kế trải nghiệm cho sản phẩm mới của khách hàng: từ xác định vấn đề, phác thảo luồng đến prototype có thể kiểm thử.</p><ul><li>Trao đổi cùng người dùng và nhóm phát triển.</li><li>Xây dựng hệ thống giao diện bằng Figma.</li><li>Ghi lại quyết định thiết kế và điều học được sau mỗi thử nghiệm.</li></ul>",
            CandidateBenefit = "<p>Studio nhỏ, được tham gia trao đổi với khách hàng, có người hướng dẫn và thời gian phát triển portfolio. Làm việc linh hoạt tại văn phòng 3 ngày mỗi tuần.</p>",
            Salary = "22–32 triệu đồng",
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
            FullName = "Lê An",
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
            FullName = "Phạm Đức",
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
            CareerGoal = "Phát triển sản phẩm tuyển dụng dễ sử dụng, chú ý khả năng truy cập và chất lượng biểu mẫu. Mong muốn đồng hành cùng nhóm nhỏ có trao đổi kỹ thuật cởi mở.",
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
            CareerGoal = "Giúp nhóm sản phẩm chuyển những vấn đề chưa rõ thành giao diện dễ hiểu. Tập trung vào nghiên cứu, luồng sử dụng và hệ thống thiết kế nhất quán.",
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
            new Skill { CurriculumVitae = anCv, Title = "Angular", SkillDescription = "Phát triển Angular theo tính năng, xử lý trạng thái tải và lỗi, tối ưu thao tác bàn phím." },
            new Skill { CurriculumVitae = anCv, Title = "TypeScript", SkillDescription = "Thiết kế kiểu dữ liệu API rõ ràng, cải thiện biểu mẫu và trạng thái giao diện cũ." },
            new JobExperience { CurriculumVitae = anCv, ComapanyName = "Lantern Works", Position = "Frontend Developer", FromDate = "06/2023", ToDate = "Present", Description = "Xây dựng công cụ điều phối đơn hàng, biểu mẫu đăng ký và bộ thành phần dùng chung. Phối hợp cùng backend để giảm lỗi nhập liệu.", EmploymentType = fullTime },
            new Education { CurriculumVitae = anCv, SchoolName = "Fictional University of Technology", MajorName = "Software Engineering", FromYear = "09/2016", ToYear = "06/2020", Description = "Capstone focus: matching systems and usable forms.", StillLearning = false },
            new Project { CurriculumVitae = anCv, ProjectName = "JMS Fork", FromDate = "07/2026", ToDate = "Present", Description = "Hoàn thiện nền tảng matching đồ án: tìm kiếm việc làm, quản lý CV và giải thích kết quả đối chiếu.", IsStillWorking = true },
            new Certificate { CurriculumVitae = anCv, CertificateName = "Web Accessibility Foundations", CertificateProvider = "Independent study", IssuedDate = "03/2025" },
            new Award { CurriculumVitae = anCv, AwardName = "Best capstone interface", FromYear = "2020", Description = "Fictional development seed achievement." },
            new Skill { CurriculumVitae = ducCv, Title = "Product design", SkillDescription = "Chuyển ghi chú phỏng vấn và tình huống khó thành luồng sử dụng rõ ràng, có cơ sở." },
            new Skill { CurriculumVitae = ducCv, Title = "Prototyping", SkillDescription = "Dùng Figma prototype để kiểm chứng thao tác trước khi hoàn thiện hình ảnh." },
            new JobExperience { CurriculumVitae = ducCv, ComapanyName = "Small Signals", Position = "Junior Product Designer", FromDate = "01/2025", ToDate = "Present", Description = "Thiết kế luồng onboarding, chuẩn hóa thành phần giao diện và tổ chức thử nghiệm với người dùng.", EmploymentType = hybrid },
            new Education { CurriculumVitae = ducCv, SchoolName = "Fictional School of Art and Design", MajorName = "Interaction Design", FromYear = "09/2018", ToYear = "06/2022", Description = "Focused on systems, typography, and interface critique.", StillLearning = false },
            new Project { CurriculumVitae = ducCv, ProjectName = "Night Shift Notes", FromDate = "02/2026", ToDate = "05/2026", Description = "A fictional case study for a shared-team planning tool.", IsStillWorking = false },
            new CVMatching
            {
                Candidate = candidateOne, CurriculumVitae = anCv, JobDescription = jobOne,
                CareerGoal = anCv.CareerGoal, Phone = anCv.Phone, DisplayName = anCv.DisplayName, DisplayEmail = anCv.DisplayEmail,
                GenderId = anCv.GenderId, DOB = anCv.DOB, Address = anCv.Address, Level = mid, EmploymentType = fullTime,
                CategoryName = productCategory.CategoryName, ApplyDate = now.AddDays(-2), CreatedDate = now.AddDays(-2), LastUpdateDate = now.AddDays(-2),
                IsMatched = true, IsApplied = true, IsSelected = false, IsReject = false, Theme = anCv.Theme, Font = anCv.Font,
                AvatarURL = PortraitOne, Skill = "Angular; TypeScript", JobExperience = "Frontend Developer", Education = "Software Engineering",
                Project = "JMS Fork"
            },
            new CVMatching
            {
                Candidate = candidateTwo, CurriculumVitae = ducCv, JobDescription = jobTwo,
                CareerGoal = ducCv.CareerGoal, Phone = ducCv.Phone, DisplayName = ducCv.DisplayName, DisplayEmail = ducCv.DisplayEmail,
                GenderId = ducCv.GenderId, DOB = ducCv.DOB, Address = ducCv.Address, Level = junior, EmploymentType = hybrid,
                CategoryName = creativeCategory.CategoryName, ApplyDate = now.AddDays(-1), CreatedDate = now.AddDays(-1), LastUpdateDate = now.AddDays(-1),
                IsMatched = true, IsApplied = false, IsSelected = true, IsReject = false, Theme = ducCv.Theme, Font = ducCv.Font,
                AvatarURL = PortraitThree, Skill = "Product design; Prototyping", JobExperience = "Junior Product Designer", Education = "Interaction Design",
                Project = "Night Shift Notes"
            });

        await dbContext.SaveChangesAsync(cancellationToken);

        JobDescription DemoJob(Company company, Recuirter recruiter, string title, Category category,
            Level level, EmploymentType employmentType, string location, string salary, string skills,
            string detail, int daysOld, int daysRemaining) => new()
        {
            Company = company, Recuirter = recruiter, Title = title, PositionTitle = title,
            Category = category, Level = level, EmploymentType = employmentType, GenderId = 1,
            Address = location, Salary = salary, SkillRequirement = skills,
            ExperienceRequirement = level == junior ? "Portfolio hoặc kinh nghiệm dự án phù hợp" : "Từ 2 năm kinh nghiệm ở vị trí tương đương",
            JobDetail = detail,
            CandidateBenefit = "<p>Nhóm nhỏ, phản hồi trực tiếp, ngân sách học tập và lịch làm việc linh hoạt. Quyền lợi chi tiết được trao đổi khi phỏng vấn.</p>",
            ContactEmail = recruiter.Email, CreatedAt = now.AddDays(-daysOld),
            ExpiredDate = now.AddDays(daysRemaining), IsDelete = false,
            NumberRequirement = 1, MatchingNumberRequirement = 6
        };
        dbContext.AddRange(
            DemoJob(northstar, recruiterOne, "Backend Developer — .NET", productCategory, mid, fullTime,
                "Quận 1, TP. Hồ Chí Minh", "32–45 triệu đồng", "C#, ASP.NET Core, SQL, REST APIs, testing",
                "<p>Xây dựng API cho công cụ vận hành doanh nghiệp nhỏ. Ưu tiên tính đúng đắn, phân quyền rõ ràng và khả năng bảo trì.</p><ul><li>Phát triển ASP.NET Core và EF Core.</li><li>Kiểm tra quyền sở hữu dữ liệu, tối ưu truy vấn.</li><li>Viết test cho nghiệp vụ quan trọng.</li></ul>", 3, 24),
            DemoJob(northstar, recruiterOne, "QA Engineer — Web & API", productCategory, junior, hybrid,
                "Thủ Đức, TP. Hồ Chí Minh", "18–26 triệu đồng", "API testing, exploratory testing, Playwright, SQL",
                "<p>Đồng hành cùng kỹ sư để phát hiện những tình huống người dùng dễ gặp: biểu mẫu bị lỗi, dữ liệu thiếu hoặc thao tác lặp.</p><ul><li>Kiểm thử web trên desktop và mobile.</li><li>Xây dựng các hành trình tự động quan trọng.</li><li>Viết báo cáo lỗi có bước tái hiện rõ ràng.</li></ul>", 1, 28),
            DemoJob(northstar, recruiterOne, "People Operations Specialist", peopleCategory, mid, fullTime,
                "Quận 1, TP. Hồ Chí Minh", "20–28 triệu đồng", "Onboarding, communication, Excel, documentation",
                "<p>Chăm sóc trải nghiệm gia nhập nhóm, duy trì tài liệu nội bộ và phối hợp tuyển dụng. Vị trí dành cho người thích tổ chức công việc và giao tiếp rõ ràng.</p>", 6, 21),
            DemoJob(paperkite, recruiterTwo, "Brand & Visual Designer", creativeCategory, mid, hybrid,
                "Bình Thạnh, TP. Hồ Chí Minh", "24–34 triệu đồng", "Typography, Illustrator, Figma, brand systems",
                "<p>Thiết kế nhận diện cho các sản phẩm đang hình thành: nghiên cứu câu chuyện thương hiệu, phát triển ngôn ngữ hình ảnh và áp dụng lên giao diện số.</p>", 2, 30),
            DemoJob(paperkite, recruiterTwo, "Content Strategist — Sản phẩm số", creativeCategory, junior, hybrid,
                "Đà Nẵng · làm việc linh hoạt", "16–23 triệu đồng", "UX writing, content planning, Vietnamese writing, research",
                "<p>Viết nội dung giúp người dùng hiểu và sử dụng sản phẩm: nhãn thao tác, hướng dẫn, thông báo lỗi và câu chuyện giới thiệu. Làm việc cùng designer từ giai đoạn phác thảo.</p>", 4, 25),
            DemoJob(northstar, recruiterOne, "Data Analyst — Product Insights", productCategory, mid, fullTime,
                "Quận 1, TP. Hồ Chí Minh", "28–38 triệu đồng", "SQL, data analysis, dashboards, product metrics",
                "<p>Phân tích hành vi sử dụng để trả lời câu hỏi sản phẩm cụ thể. Đợt tuyển dụng mẫu này đã kết thúc; được giữ lại để minh họa quản lý bài hết hạn.</p>", 40, -3));
        await dbContext.SaveChangesAsync(cancellationToken);

        // Seed snapshots use the same presentation contract and real rule scores
        // as applications. No fabricated AI evaluation or inflated percentage.
        foreach (var matching in await dbContext.CVMatchings.Include(item => item.CurriculumVitae).ThenInclude(cv => cv!.Skills)
            .Include(item => item.CurriculumVitae).ThenInclude(cv => cv!.Educations)
            .Include(item => item.CurriculumVitae).ThenInclude(cv => cv!.JobExperiences)
            .Include(item => item.CurriculumVitae).ThenInclude(cv => cv!.Projects)
            .Include(item => item.CurriculumVitae).ThenInclude(cv => cv!.Certificates)
            .Include(item => item.CurriculumVitae).ThenInclude(cv => cv!.Awards).Include(item => item.JobDescription).ToListAsync(cancellationToken))
        {
            var cv = matching.CurriculumVitae!;
            matching.Skill = JsonConvert.SerializeObject(cv.Skills!.Select(item => new { item.Title, item.SkillDescription }));
            matching.Education = JsonConvert.SerializeObject(cv.Educations!.Select(item => new { item.SchoolName, item.MajorName, item.FromYear, item.ToYear, item.Description, item.StillLearning }));
            matching.JobExperience = JsonConvert.SerializeObject(cv.JobExperiences!.Select(item => new { item.ComapanyName, item.Position, item.FromDate, item.ToDate, item.Description, EmploymentTypeName = item.EmploymentType?.Title }));
            matching.Project = JsonConvert.SerializeObject(cv.Projects!.Select(item => new { item.ProjectName, item.FromDate, item.ToDate, item.Description, item.IsStillWorking }));
            matching.Certificate = JsonConvert.SerializeObject(cv.Certificates!.Select(item => new { item.CertificateName, item.CertificateProvider, item.IssuedDate, item.ExpiredDate, item.credentialURL }));
            matching.Award = JsonConvert.SerializeObject(cv.Awards!.Select(item => new { item.AwardName, item.FromYear, item.Description }));
            var rules = DeterministicMatchScorer.Evaluate(matching.JobDescription!, cv);
            MatchEvaluationPersistence.Apply(matching, new MatchEvaluation("none", "none", "not-configured", null, null, null, null,
                "Đánh giá theo quy tắc; chưa cấu hình nhà cung cấp AI.", [], [], "Chưa cấu hình khóa API.",
                DeterministicScore: rules.Score, DeterministicSkillScore: rules.SkillScore,
                DeterministicExperienceScore: rules.ExperienceScore, DeterministicEducationScore: rules.EducationScore,
                DeterministicProjectAndCertificateScore: rules.ProjectAndCertificateScore,
                EligibilityStatus: rules.EligibilityStatus, EligibilityReason: rules.EligibilityReason));
        }
        await dbContext.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Seeded the empty JMS development database with fictional portfolio data.");
    }
}
