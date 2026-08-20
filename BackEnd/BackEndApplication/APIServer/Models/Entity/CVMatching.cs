using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace APIServer.Models.Entity
{
    public class CVMatching
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int? CandidateId { get; set; }
        public virtual Candidate? Candidate { get; set; }
        public int? JobDescriptionId { get; set; }
        public virtual JobDescription? JobDescription { get; set; }
        [StringLength(2000)]
        public string? CareerGoal { get; set; }
        [StringLength(10)]
        public string? Phone { get; set; }
        [StringLength(200)]
        public string? DisplayName { get; set; }
        public int? GenderId { get; set; }
        public virtual Gender? Gender { get; set; }
        [StringLength(100)]
        public string? DisplayEmail { get; set; }
        public DateTime DOB { get; set; }
        public string? Address { get; set; }
        public string? Skill { get; set; }
        public string? Education { get; set; }
        public string? JobExperience { get; set; }
        public string? Project { get; set; }
        public string? Certificate { get; set; }
        public string? Award { get; set; }
        public DateTime ApplyDate { get; set; }
        public string? JSONMatching { get; set; }
        public float? PercentMatching { get; set; }
        [StringLength(50)]
        public string? MatchingRulesVersion { get; set; }
        [StringLength(50)]
        public string? MatchingProvider { get; set; }
        [StringLength(100)]
        public string? MatchingModel { get; set; }
        [StringLength(30)]
        public string? MatchingStatus { get; set; }
        [StringLength(30)]
        public string? MatchingEligibilityStatus { get; set; }
        public string? MatchingEligibilityReason { get; set; }
        public string? MatchingExplanation { get; set; }
        public string? MatchingFailureReason { get; set; }
        public DateTime? MatchingEvaluatedAtUtc { get; set; }
        public int? LevelId { get; set; }
        public int? EmploymentTypeId { get; set; }
        public virtual EmploymentType? EmploymentType { get; set; }
        public virtual Level? Level { get; set; }
        [StringLength(200)]
        public string? CategoryName { get; set; }
        public int? CurriculumVitaeId { get; set; }
        public virtual CurriculumVitae? CurriculumVitae { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime LastUpdateDate { get; set; }
        public bool IsMatched { get; set; }
        public bool IsApplied { get; set; }
        public bool IsSelected { get; set; }
        public bool? IsReject { get; set; }
        public int? Theme { get; set; }
        public string? Font { get; set; }
        public string? AvatarURL { get; set; }
    }
}
