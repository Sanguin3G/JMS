namespace APIServer.DTO.EntityDTO
{
    public class CVMatchingDTO
    {
        public int Id { get; set; }
        public int? CandidateId { get; set; }
        public CandidateDTO? Candidate { get; set; }
        public int? JobDescriptionId { get; set; }
        public virtual JobDTO? JobDescription { get; set; }
        public string? CareerGoal { get; set; }
        public string? Phone { get; set; }
        public string? DisplayName { get; set; }
        public string? GenderDisplay { get; set; }
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
        public string? MatchingRulesVersion { get; set; }
        public string? MatchingProvider { get; set; }
        public string? MatchingModel { get; set; }
        public string? MatchingStatus { get; set; }
        public string? MatchingEligibilityStatus { get; set; }
        public string? MatchingEligibilityReason { get; set; }
        public string? MatchingExplanation { get; set; }
        public string? MatchingFailureReason { get; set; }
        public DateTime? MatchingEvaluatedAtUtc { get; set; }
        public string? EmploymentTypeName { get; set; }
        public virtual LevelDTO? Level { get; set; }
        public string? CategoryName { get; set; }
        public int? CurriculumVitaeId { get; set; }
        public virtual CurriculumVitaeDTO? CurriculumVitae { get; set; }
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
