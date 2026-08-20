using APIServer.Models.Entity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace APIServer.DTO.EntityDTO
{
    public class JobDTO
    {
        public int JobId { get; set; }
        public int? RecuirterId { get; set; }
        [Required, StringLength(200)]
        public string Title { get; set; } = string.Empty;
        public string? EmploymentTypeName { get; set; }
        public string? GenderRequirement { get; set; }
        public string? AgeRequirement { get; set; }
        public string? EducationRequirement { get; set; }
        public string? JobDetail { get; set; }
        public string? ExperienceRequirement { get; set; }
        public string? ProjectRequirement { get; set; }
        public string? SkillRequirement { get; set; }
        public string? CertificateRequirement { get; set; }
        public string? OtherInformation { get; set; }
        public string? CandidateBenefit { get; set; }
        public string? Salary { get; set; }
        public string? ContactEmail { get; set; }
        public string? Address { get; set; }
        public int? NumberRequirement { get; set; }
        public string? CompanyName { get; set; } = null;
        public CompanyDTO? CompanyDTO { get; set; }
        public string? CategoryName { get; set; } = null;
        public string? LevelTitle { get; set; }
        public string? PositionTitle { get; set; }
        public string? CreatedAt { get; set; }
        public string? ExpiredDate { get; set; }
        public bool? IsExpired { get; set; }
    }
}
