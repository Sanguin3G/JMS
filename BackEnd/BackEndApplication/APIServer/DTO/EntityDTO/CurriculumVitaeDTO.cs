using APIServer.Models.Entity;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace APIServer.DTO.EntityDTO
{
    public class CurriculumVitaeDTO
    {
        public int Id { get; set; }
        public int? CandidateId { get; set; }
        public string? CareerGoal { get; set; }
        public string? EmploymentTypeName { get; set; }
        public string? Phone { get; set; }
        public string? DisplayName { get; set; }
        public string? GenderDisplay { get; set; }
        public string? DisplayEmail { get; set; }
        public string? Address { get; set; }
        public string? DOB { get; set; }
        public string? CreatedDateDisplay { get; set; }
        public string? LastUpdateDateDisplay { get; set; }
        //public string? PositionTitleName { get; set; }
        public List<JobExperienceDTO>? JobExperiences { get; set; }
        public List<SkillDTO>? Skills { get; set; }
        public List<EducationDTO>? Educations { get; set; }
        public List<ProjectDTO>? Projects { get; set; }
        public virtual List<CertificateDTO>? Certificates { get; set; }
        public List<AwardDTO>? Awards { get; set; }
        public string? AvatarURL { get; set; }
        public string? CategoryName { get; set; }
        public int? CategoryId { get; set; }
        public int? GenderId { get; set; }
        public bool? IsFindingJob { get; set; }
        public string? LevelTitle { get; set; }
        [Required, StringLength(200)]
        public string CVTitle { get; set; } = string.Empty;
        public int? Theme { get; set; }
        public string? Font { get; set; }
    }
}
