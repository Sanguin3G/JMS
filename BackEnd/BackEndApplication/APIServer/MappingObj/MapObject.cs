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
            // Profiles are created during container startup, where launchSettings.json
            // is intentionally absent. Keep the public asset host environment-driven
            // instead of coupling mapping to a Windows-only development file.
            var host = ResolvePublicHost();

            CreateMap<UserCreatingDTO, Recuirter>().MaxDepth(16)
                .ForMember(x => x.DOB, src => src.MapFrom(src => Validation.convertDateTime(src.dobStr)));
            CreateMap<Recuirter, RecuirterDTO>().MaxDepth(16)
                .ForMember(x => x.DOB_Display, src => src.MapFrom(src => src.DOB.ToString(GlobalStrings.FORMAT_DATE)))
                .ForMember(x => x.CreatedDateDisplay, src => src.MapFrom(src => src.CreatedDate.ToString(GlobalStrings.FORMAT_DATE)))
                .ForMember(x => x.LastUpdateDisplay, src => src.MapFrom(src => src.LastUpdate.ToString(GlobalStrings.FORMAT_DATE)))
                .ForMember(x => x.RoleTitle, src => src.MapFrom(source => source.Role == null ? (int?)null : source.Role.Id))
                .ForMember(x => x.GenderTitle, src => src.MapFrom(src => src.Gender == null ? null : src.Gender.Title))
                .ForMember(x => x.AvatarURL, src => src.MapFrom(src => ResolveAssetUrl(host, src.AvatarURL)))
                .ForMember(x => x.CompanyId, src => src.MapFrom(source => source.Company == null ? (int?)null : source.Company.CompanyId))
                .ForMember(x => x.CompanyName, src => src.MapFrom(source => source.Company == null ? null : source.Company.CompanyName))
                ;
            CreateMap<JobDTO, JobDescription>().MaxDepth(16)
                .ForMember(x => x.CreatedAt, src => src.Ignore())
                .ForMember(x => x.EmploymentTypeId, src => src.MapFrom(src => Validation.ConvertInt(src.EmploymentTypeName)))
                .ForMember(x => x.CategoryId, src => src.MapFrom(src => Validation.ConvertInt(src.CategoryName)))
                .ForMember(x => x.CompanyId, src => src.MapFrom(src => Validation.ConvertInt(src.CompanyName)))
                .ForMember(x => x.CategoryId, src => src.MapFrom(src => Validation.ConvertInt(src.CategoryName)))
                .ForMember(x => x.GenderId, src => src.MapFrom(src => Validation.ConvertInt(src.GenderRequirement)))
                .ForMember(x => x.LevelId, src => src.MapFrom(src => Validation.ConvertInt(src.LevelTitle)))
                .ForMember(x => x.ExpiredDate, src => src.MapFrom(src => Validation.convertDateTime(src.ExpiredDate)))
                ;
            CreateMap<JobDescription, JobDTO>().MaxDepth(16)
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
            CreateMap<CurriculumVitaeDTO, CurriculumVitae>().MaxDepth(16)
                .ForMember(x => x.DOB, src => src.MapFrom(src => Validation.convertDateTime(src.DOB)))
                .ForMember(x => x.CreatedDate, src => src.Ignore())
                .ForMember(x => x.LastUpdateDate, src => src.Ignore())
                .ForMember(x => x.DOB, src => src.MapFrom(src => Validation.convertDateTime(src.DOB)))
                .ForMember(x => x.EmploymentTypeId, src => src.MapFrom(src => Validation.ConvertInt(src.EmploymentTypeName)))
                .ForMember(x => x.LevelId, src => src.MapFrom(src => Validation.ConvertInt(src.LevelTitle)))
                .ForMember(x => x.CategoryId, src => src.MapFrom(src => src.CategoryId))
                .ForMember(x => x.GenderId, src => src.MapFrom(src => Validation.ConvertInt(src.GenderDisplay)))
                ;
            CreateMap<CurriculumVitae, CurriculumVitaeDTO>().MaxDepth(16)
                .ForMember(x => x.EmploymentTypeName, src => src.MapFrom(src => src.EmploymentType.Title))
                .ForMember(x => x.DOB, src => src.MapFrom(src => src.DOB.ToString(GlobalStrings.FORMAT_DATE1)))
                .ForMember(x => x.CreatedDateDisplay, src => src.MapFrom(src => src.CreatedDate.ToString(GlobalStrings.FORMAT_DATE)))
                .ForMember(x => x.LastUpdateDateDisplay, src => src.MapFrom(src => src.LastUpdateDate.ToString(GlobalStrings.FORMAT_DATE)))
                .ForMember(x => x.LevelTitle, src => src.MapFrom(src => src.Level.Title))
                .ForMember(x => x.CategoryName, src => src.MapFrom(src => src.Category.CategoryName))
                .ForMember(x => x.GenderDisplay, src => src.MapFrom(src => src.Gender.Title))
                .ForMember(x => x.AvatarURL, src => src.MapFrom(src => ResolveAssetUrl(host, src.AvatarURL)))
                ;
            CreateMap<CVMatching, CVMatchingDTO>().MaxDepth(16)
                .ForMember(x => x.Candidate, src => src.MapFrom(src => src.Candidate))
                .ForMember(x => x.JobDescription, src => src.MapFrom(src => src.JobDescription))
                .ForMember(x => x.Level, src => src.MapFrom(src => src.Level))
                .ForMember(x => x.CurriculumVitae, src => src.MapFrom(src => src.CurriculumVitae))




                .ForMember(x => x.GenderDisplay, src => src.MapFrom(src => src.Gender.Title))
                .ForMember(x => x.EmploymentTypeName, src => src.MapFrom(src => src.EmploymentType.Title))
                .ForMember(x => x.AvatarURL, src => src.MapFrom(src => ResolveAssetUrl(host, src.AvatarURL)))
                ;

            CreateMap<Admin, AdminDTO>().MaxDepth(16);

            CreateMap<Candidate, CandidateDTO>().MaxDepth(16)
                .ForMember(x => x.IsMale, src => src.MapFrom(src => src.GenderId == 1 ? true : false))
                .ForMember(x => x.AvatarURL, src => src.MapFrom(src => ResolveAssetUrl(host, src.AvatarURL)))
            ;
            CreateMap<CandidateDTO, Candidate>().MaxDepth(16)
                .ForMember(x => x.GenderId, src => src.MapFrom(src => src.IsMale ? 1 : 2))
            ;

            CreateMap<Award, AwardDTO>().MaxDepth(16);
            CreateMap<Skill, SkillDTO>().MaxDepth(16);
            CreateMap<Education, EducationDTO>().MaxDepth(16);
            CreateMap<Project, ProjectDTO>().MaxDepth(16);
            CreateMap<Certificate, CertificateDTO>().MaxDepth(16);
            CreateMap<JobExperience, JobExperienceDTO>().MaxDepth(16);

            CreateMap<AwardDTO, Award>().MaxDepth(16);
            CreateMap<SkillDTO, Skill>().MaxDepth(16);
            CreateMap<EducationDTO, Education>().MaxDepth(16);
            CreateMap<ProjectDTO, Project>().MaxDepth(16);
            CreateMap<CertificateDTO, Certificate>().MaxDepth(16);
            CreateMap<JobExperienceDTO, JobExperience>().MaxDepth(16);

            CreateMap<Company, CompanyDTO>().MaxDepth(16)
                .ForMember(x => x.CategoryName, src => src.MapFrom(y => y.Category.CategoryName))
                .ForMember(x => x.DateCreatedDisplay, src => src.MapFrom(y => y.DateCreated.ToString(GlobalStrings.FORMAT_DATE)))
                .ForMember(x => x.RecuirterFounder, src => src.MapFrom(y => y.Recuirter.FullName))
                .ForMember(x => x.AvatarURL, src => src.MapFrom(src => ResolveAssetUrl(host, src.AvatarURL)))
                .ForMember(x => x.BackGroundURL, src => src.MapFrom(src => ResolveAssetUrl(host, src.BackGroundURL)))
                .ForMember(x => x.JDs, src => src.MapFrom(y => y.JobDescriptions))
                ;
            CreateMap<CompanyDTO, Company>().MaxDepth(16)
                .ForMember(x => x.IsDelete, src => src.Ignore())
                .ForMember(x => x.CategoryId, src => src.MapFrom(y => Validation.ConvertInt(y.CategoryName)))
                ;
            CreateMap<EmployeeInCompany, EmployeeDTO>().MaxDepth(16)
                .ForMember(x => x.RecuirterName, src => src.MapFrom(y => y.Recuirter.FullName))
                .ForMember(x => x.StartDateDisplay, src => src.MapFrom(y => y.StartDate.ToString(GlobalStrings.FORMAT_DATE)))
                .ForMember(x => x.EndDateDisplay, src => src.MapFrom(y => !y.EndDate.HasValue ? "Now" : y.EndDate.Value.ToString(GlobalStrings.FORMAT_DATE)))
                ;
            CreateMap<EmployeeDTO, EmployeeInCompany>().MaxDepth(16)
                .ForMember(x => x.StartDate, src => src.MapFrom(y => Validation.convertDateTime(y.StartDateDisplay)))
                .ForMember(x => x.EndDate, src => src.MapFrom(y => convertDateTimeNull(y.EndDateDisplay)))
                ;

            CreateMap<Category, CategoryDTO>().MaxDepth(16)
                .ForMember(x => x.CreatedAt, src => src.MapFrom(y => y.CreatedAt.ToString(GlobalStrings.FORMAT_DATE)))
                ;
            CreateMap<Level, LevelDTO>().MaxDepth(16);
            CreateMap<EmploymentType, EmploymentTypeDTO>().MaxDepth(16);

            CreateMap<CategoryDTO, Category>().MaxDepth(16)
                .ForMember(x => x.CreatedAt, src => src.MapFrom(y => Validation.convertDateTime(y.CreatedAt)))
                ;
            CreateMap<LevelDTO, Level>().MaxDepth(16);
            CreateMap<EmploymentTypeDTO, EmploymentType>().MaxDepth(16);
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
            var defaultAvatarUrl = host.TrimEnd('/') + "/defaults/avatar.svg";

            if (Validation.checkStringIsEmpty(assetUrl))
            {
                return defaultAvatarUrl;
            }

            return Uri.TryCreate(assetUrl, UriKind.Absolute, out _)
                ? assetUrl
                : $"{host.TrimEnd('/')}/{assetUrl.TrimStart('/', '\\')}";
        }

        private static string ResolvePublicHost()
        {
            var configuredHost = Environment.GetEnvironmentVariable("JMS_PUBLIC_URL");
            if (!string.IsNullOrWhiteSpace(configuredHost))
            {
                return configuredHost.TrimEnd('/');
            }

            var urls = Environment.GetEnvironmentVariable("ASPNETCORE_URLS")?
                .Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .FirstOrDefault();

            if (!string.IsNullOrWhiteSpace(urls))
            {
                return urls.Replace("://+", "://localhost", StringComparison.Ordinal).TrimEnd('/');
            }

            return "http://localhost:8080";
        }
    }
}
