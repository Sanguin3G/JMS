using System.Globalization;
using APIServer.DTO.EntityDTO;
using APIServer.MappingObj;
using APIServer.Models.Entity;
using AutoMapper;
using Xunit;

namespace APIServer.Tests.Features.Matching;
public sealed class MatchingPresentationTests
{
    [Fact]
    public void ReviewDatesStayTypedUnderVietnameseCulture()
    {
        var original = CultureInfo.CurrentCulture;
        try {
            CultureInfo.CurrentCulture = CultureInfo.GetCultureInfo("vi-VN");
            var mapper = new MapperConfiguration(config => config.AddProfile<MapObject>()).CreateMapper();
            var record = new CVMatching { DOB = new(1998, 4, 17), ApplyDate = new(2026, 10, 6), CreatedDate = new(2026, 10, 5), LastUpdateDate = new(2026, 10, 6) };
            var result = mapper.Map<CVMatchingDTO>(record);
            Assert.Equal(record.DOB, result.DOB);
            Assert.Equal(record.ApplyDate, result.ApplyDate);
            Assert.Equal(record.CreatedDate, result.CreatedDate);
            var cv = new CurriculumVitae { CreatedDate = new(2026, 10, 5), LastUpdateDate = new(2026, 10, 6) };
            var presentedCv = mapper.Map<CurriculumVitaeDTO>(cv);
            Assert.Equal("05/10/2026", presentedCv.CreatedDateDisplay);
            Assert.Equal("06/10/2026", presentedCv.LastUpdateDateDisplay);
            var editedJob = mapper.Map<JobDescription>(new JobDTO {
                CreatedAt = "09/28/2026", ExpiredDate = "2027-01-31",
                EmploymentTypeName = "1", CategoryName = "1", CompanyName = "1", GenderRequirement = "1", LevelTitle = "1"
            });
            Assert.Equal(new DateTime(2027, 1, 31), editedJob.ExpiredDate);
            Assert.Equal(default, editedJob.CreatedAt);
        } finally { CultureInfo.CurrentCulture = original; }
    }
}
