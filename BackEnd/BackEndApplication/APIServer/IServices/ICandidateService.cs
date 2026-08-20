using APIServer.DTO.EntityDTO;
using APIServer.DTO.ResponseBody;
using APIServer.Models.Entity;

namespace APIServer.IServices
{
    public interface ICandidateService :IBaseService<Candidate>
    {
        public Task<int> ApplyJob(int candaidateId, int CVid, int jobDescriptionId);
        public List<CVMatching> GetCVAppliedHistory(int candaidateId, DateTime? fromDate, DateTime? toDate);
        public PagingResponseBody<List<CVMatchingDTO>> GetCVAppliedHistoryPaging(int? page, List<CVMatchingDTO> listData);
        public CVMatching GetCVAppliedDetail(int candidateId, int CVAppliedId);
        public string LoginCandidate(string? userName, string? password);
        public List<CVMatching> GetCVApplied(int candaidateId);
        public CandidateDTO GetCandidateInformation(int candidateId);
        public int UpdateProfile(int candidateId, string fullName, string phone, DateTime DOB, int genderId);
        public int UpdatePassword(int candidateId, string oldPassword, string newPassword, string confirmPassword);
    }
}
