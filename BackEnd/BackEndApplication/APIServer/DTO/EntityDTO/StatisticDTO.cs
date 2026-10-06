namespace APIServer.DTO.EntityDTO
{
    public class StatisticDTO
    {
        public int TotalCompany { get; set; }
        public int TotalJDs { get; set;}
        public int TotalCV { get; set; }
        public int TotalMatching { get; set; }
        public int TotalCandidates { get; set; }
        public int TotalRecruiters { get; set; }
        public int ActiveJobs { get; set; }
        public int ExpiredJobs { get; set; }
        public int ActiveCVs { get; set; }
        public int Applications { get; set; }
        public int SelectedApplications { get; set; }
        public int RejectedApplications { get; set; }
    }
}
