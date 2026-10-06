using APIServer.Models.Entity;

namespace APIServer.IRepositories
{
    public interface ICVMatchingRepository : IBaseRepository<CVMatching>
    {
        public List<CVMatching> GetAllByCandidateIdAndFromDataAndToDate(int candidateId, DateTime? fromDate, DateTime? toDate);
        public List<CVMatching> GetAllByRecruiterIdAndJobDescriptionIdAndFromDataAndToDate(int recruiterId, int? jobDescription, DateTime? fromDate, DateTime? toDate);
        public CVMatching GetByCandidateIdAndCVAppliedId(int candidateId, int CVAppliedId);
        public CVMatching GetByRecruiterIdAndCVAppliedId(int recruiterId, int jobDescriptionId, int CVMatchingId);
        public List<CVMatching> GetByCVIdAndJobDescriptionId(int CVId, int jobDescriptionId);
        public bool HasApplication(int candidateId, int jobDescriptionId);
        public List<CVMatching> GetAllByIsApplied(int candidateId);
        public List<CVMatching> GetAllByIsSelected(int recruiterId, int jobDescriptionId);
        public List<CVMatching> GetAllByIsMatchedByNumberRequirement(int recruiterId, int jobDescriptionId);
        public List<CVMatching> GetAllByIsMatchedLeft(int recruiterId, int jobDescriptionId);
        public List<CVMatching> GetAllByIsApplied(int recruiterId, int jobDescriptionId);
        public int UpdateSelectedStatus(int recruiterId, int jobDescriptionId, int CVMatchingId);
        public int UpdateRejectedStatus(int recruiterId, int jobDescriptionId, int CVMatchingId);
    }
}
