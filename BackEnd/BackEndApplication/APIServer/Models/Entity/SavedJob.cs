namespace APIServer.Models.Entity;

public sealed class SavedJob
{
    public int CandidateId { get; set; }
    public Candidate Candidate { get; set; } = null!;
    public int JobId { get; set; }
    public JobDescription Job { get; set; } = null!;
    public DateTime SavedAtUtc { get; set; }
}
