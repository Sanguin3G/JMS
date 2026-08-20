using APIServer.Common;
using APIServer.DTO.EntityDTO;
using APIServer.Models.Entity;
using AutoMapper;

namespace APIServer.MappingObj
{
    public class MapObject : Profile
    {
        public MapObject()
        {
            var configuration = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("Properties\\launchSettings.json")
    .Build();
            var host = configuration["profiles:APIServer:applicationUrl"];

            CreateMap<UserCreatingDTO, Recuirter>()
                .ForMember(x => x.DOB, src => src.MapFrom(src => Validation.convertDateTime(src.dobStr)));
            CreateMap<Recuirter, RecuirterDTO>()
                .ForMember(x => x.DOB_Display, src => src.MapFrom(src => src.DOB.ToString(GlobalStrings.FORMAT_DATE)))
                .ForMember(x => x.CreatedDateDisplay, src => src.MapFrom(src => src.CreatedDate.ToString(GlobalStrings.FORMAT_DATE)))
                .ForMember(x => x.LastUpdateDisplay, src => src.MapFrom(src => src.LastUpdate.ToString(GlobalStrings.FORMAT_DATE)))
                .ForMember(x => x.RoleTitle, src => src.MapFrom(src => src.Role.Name))
                .ForMember(x => x.GenderTitle, src => src.MapFrom(src => src.Gender.Title))
                .ForMember(x => x.AvatarURL, src => src.MapFrom(src => ResolveAssetUrl(host, src.AvatarURL)))
                .ForMember(x => x.CompanyId, src => src.MapFrom(src => src.Company.CompanyId))
                ;
            CreateMap<JobDTO, JobDescription>()
                .ForMember(x => x.EmploymentTypeId, src => src.MapFrom(src => Validation.ConvertInt(src.EmploymentTypeName)))
                .ForMember(x => x.CategoryId, src => src.MapFrom(src => Validation.ConvertInt(src.CategoryName)))
                .ForMember(x => x.CompanyId, src => src.MapFrom(src => Validation.ConvertInt(src.CompanyName)))
                .ForMember(x => x.CategoryId, src => src.MapFrom(src => Validation.ConvertInt(src.CategoryName)))
                .ForMember(x => x.GenderId, src => src.MapFrom(src => Validation.ConvertInt(src.GenderRequirement)))
                .ForMember(x => x.LevelId, src => src.MapFrom(src => Validation.ConvertInt(src.LevelTitle)))
                .ForMember(x => x.ExpiredDate, src => src.MapFrom(src => Validation.convertDateTime(src.ExpiredDate)))
                ;
            CreateMap<JobDescription, JobDTO>()
                .ForMember(x => x.LevelTitle, src => src.MapFrom(src => src.Level.Title))
                .ForMember(x => x.EmploymentTypeName, src => src.MapFrom(src => src.EmploymentType.Title))
                .ForMember(x => x.CompanyName, src => src.MapFrom(src => src.Company.CompanyName))
                .ForMember(x => x.CategoryName, src => src.MapFrom(src => src.Category.CategoryName))
                .ForMember(x => x.GenderRequirement, src => src.MapFrom(src => src.Gender.Title))
                .ForMember(x => x.CreatedAt, src => src.MapFrom(src => src.CreatedAt.ToString(GlobalStrings.FORMAT_DATE)))
                .ForMember(x => x.ExpiredDate, src => src.MapFrom(src => src.ExpiredDate.ToString(GlobalStrings.FORMAT_DATE)))
                .ForMember(x => x.IsExpired, src => src.MapFrom(src => src.ExpiredDate < DateTime.Now))
                .ForMember(x => x.CompanyDTO, src => src.MapFrom(src => src.Company))
                ;
            CreateMap<CurriculumVitaeDTO, CurriculumVitae>()
                .ForMember(x => x.DOB, src => src.MapFrom(src => Validation.convertDateTime(src.DOB)))
                .ForMember(x => x.CreatedDate, src => src.MapFrom(src => Validation.convertDateTime(src.CreatedDateDisplay)))
                .ForMember(x => x.LastUpdateDate, src => src.MapFrom(src => Validation.convertDateTime(src.LastUpdateDateDisplay)))
                .ForMember(x => x.DOB, src => src.MapFrom(src => Validation.convertDateTime(src.DOB)))
                .ForMember(x => x.EmploymentTypeId, src => src.MapFrom(src => Validation.ConvertInt(src.EmploymentTypeName)))
                .ForMember(x => x.LevelId, src => src.MapFrom(src => Validation.ConvertInt(src.LevelTitle)))
                .ForMember(x => x.CategoryId, src => src.MapFrom(src => src.CategoryId))
                .ForMember(x => x.GenderId, src => src.MapFrom(src => Validation.ConvertInt(src.GenderDisplay)))
                ;
            CreateMap<CurriculumVitae, CurriculumVitaeDTO>()
                .ForMember(x => x.EmploymentTypeName, src => src.MapFrom(src => src.EmploymentType.Title))
                .ForMember(x => x.DOB, src => src.MapFrom(src => src.DOB.ToString(GlobalStrings.FORMAT_DATE1)))
                .ForMember(x => x.CreatedDateDisplay, src => src.MapFrom(src => src.CreatedDate.ToString(GlobalStrings.FORMAT_DATE1)))
                .ForMember(x => x.LastUpdateDateDisplay, src => src.MapFrom(src => src.LastUpdateDate.ToString(GlobalStrings.FORMAT_DATE1)))
                .ForMember(x => x.LevelTitle, src => src.MapFrom(src => src.Level.Title))
                .ForMember(x => x.CategoryName, src => src.MapFrom(src => src.Category.CategoryName))
                .ForMember(x => x.GenderDisplay, src => src.MapFrom(src => src.Gender.Title))
                .ForMember(x => x.AvatarURL, src => src.MapFrom(src => ResolveAssetUrl(host, src.AvatarURL)))
                ;
            CreateMap<CVMatching, CVMatchingDTO>()
                .ForMember(x => x.Candidate, src => src.MapFrom(src => src.Candidate))
                .ForMember(x => x.JobDescription, src => src.MapFrom(src => src.JobDescription))
                .ForMember(x => x.Level, src => src.MapFrom(src => src.Level))
                .ForMember(x => x.CurriculumVitae, src => src.MapFrom(src => src.CurriculumVitae))
                .ForMember(x => x.DOB, src => src.MapFrom(src => src.DOB.ToString(GlobalStrings.FORMAT_DATE1)))
                .ForMember(x => x.LastUpdateDate, src => src.MapFrom(src => src.LastUpdateDate.ToString(GlobalStrings.FORMAT_DATE1)))
                .ForMember(x => x.ApplyDate, src => src.MapFrom(src => src.ApplyDate.ToString(GlobalStrings.FORMAT_DATE1)))
                .ForMember(x => x.CreatedDate, src => src.MapFrom(src => src.CreatedDate.ToString(GlobalStrings.FORMAT_DATE1)))
                .ForMember(x => x.GenderDisplay, src => src.MapFrom(src => src.Gender.Title))
                .ForMember(x => x.EmploymentTypeName, src => src.MapFrom(src => src.EmploymentType.Title))
                .ForMember(x => x.AvatarURL, src => src.MapFrom(src => ResolveAssetUrl(host, src.AvatarURL)))
                ;

            CreateMap<Admin, AdminDTO>();

            CreateMap<Candidate, CandidateDTO>()
                .ForMember(x => x.IsMale, src => src.MapFrom(src => src.GenderId == 1 ? true : false))
                .ForMember(x => x.AvatarURL, src => src.MapFrom(src => ResolveAssetUrl(host, src.AvatarURL)))
            ;
            CreateMap<CandidateDTO, Candidate>()
                .ForMember(x => x.GenderId, src => src.MapFrom(src => src.IsMale ? 1 : 2))
            ;

            CreateMap<Award, AwardDTO>();
            CreateMap<Skill, SkillDTO>();
            CreateMap<Education, EducationDTO>();
            CreateMap<Project, ProjectDTO>();
            CreateMap<Certificate, CertificateDTO>();
            CreateMap<JobExperience, JobExperienceDTO>();

            CreateMap<AwardDTO, Award>();
            CreateMap<SkillDTO, Skill>();
            CreateMap<EducationDTO, Education>();
            CreateMap<ProjectDTO, Project>();
            CreateMap<CertificateDTO, Certificate>();
            CreateMap<JobExperienceDTO, JobExperience>();

            CreateMap<Company, CompanyDTO>()
                .ForMember(x => x.CategoryName, src => src.MapFrom(y => y.Category.CategoryName))
                .ForMember(x => x.DateCreatedDisplay, src => src.MapFrom(y => y.DateCreated.ToString(GlobalStrings.FORMAT_DATE)))
                .ForMember(x => x.RecuirterFounder, src => src.MapFrom(y => y.Recuirter.FullName))
                .ForMember(x => x.AvatarURL, src => src.MapFrom(src => ResolveAssetUrl(host, src.AvatarURL)))
                .ForMember(x => x.BackGroundURL, src => src.MapFrom(src => ResolveAssetUrl(host, src.BackGroundURL)))
                .ForMember(x => x.JDs, src => src.MapFrom(y => y.JobDescriptions))
                ;
            CreateMap<CompanyDTO, Company>()
                .ForMember(x => x.CategoryId, src => src.MapFrom(y => Validation.ConvertInt(y.CategoryName)))
                ;
            CreateMap<EmployeeInCompany, EmployeeDTO>()
                .ForMember(x => x.RecuirterName, src => src.MapFrom(y => y.Recuirter.FullName))
                .ForMember(x => x.StartDateDisplay, src => src.MapFrom(y => y.StartDate.ToString(GlobalStrings.FORMAT_DATE)))
                .ForMember(x => x.EndDateDisplay, src => src.MapFrom(y => !y.EndDate.HasValue ? "Now" : y.EndDate.Value.ToString(GlobalStrings.FORMAT_DATE)))
                ;
            CreateMap<EmployeeDTO, EmployeeInCompany>()
                .ForMember(x => x.StartDate, src => src.MapFrom(y => Validation.convertDateTime(y.StartDateDisplay)))
                .ForMember(x => x.EndDate, src => src.MapFrom(y => convertDateTimeNull(y.EndDateDisplay)))
                ;

            CreateMap<Category, CategoryDTO>()
                .ForMember(x => x.CreatedAt, src => src.MapFrom(y => y.CreatedAt.ToString(GlobalStrings.FORMAT_DATE)))
                ;
            CreateMap<Level, LevelDTO>();
            CreateMap<EmploymentType, EmploymentTypeDTO>();

            CreateMap<CategoryDTO, Category>()
                .ForMember(x => x.CreatedAt, src => src.MapFrom(y => Validation.convertDateTime(y.CreatedAt)))
                ;
            CreateMap<LevelDTO, Level>();
            CreateMap<EmploymentTypeDTO, EmploymentType>();
        }

        private DateTime? convertDateTimeNull(string? input)
        {
            if (Validation.checkStringIsEmpty(input))
            {
                return null;
            }
            else
            {
                return Validation.convertDateTime(input);
            }
        }

        private static string ResolveAssetUrl(string host, string? assetUrl)
        {
            const string defaultAvatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

            if (Validation.checkStringIsEmpty(assetUrl))
            {
                return defaultAvatarUrl;
            }

            return Uri.TryCreate(assetUrl, UriKind.Absolute, out _) ? assetUrl : $"{host}{assetUrl}";
        }
    }
}
