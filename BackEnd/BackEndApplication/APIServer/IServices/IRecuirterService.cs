using APIServer.DTO;
using APIServer.DTO.EntityDTO;
using APIServer.DTO.ResponseBody;
using APIServer.Models.Entity;

namespace APIServer.IServices
{
    public interface IRecuirterService : IBaseService<Recuirter>
    {
        public Recuirter Login(string? username, string? password);
        public string generateToken(Recuirter? userInfo);
        public Recuirter getById(int? id);
        public int CreateRecuirterAccount(Recuirter? account);
        public List<CVMatching> GetCVAppliedHistory(int recruiterId, int? jobDescriptionId, DateTime? fromDate, DateTime? toDate);
        public PagingResponseBody<List<CVMatchingDTO>> GetCVPaging(int? page, List<CVMatchingDTO> listData);
        public CVMatching GetCVMatchingDetail(int recruiterId, int jobDescriptionId, int CVMatchingId);
        public Task<List<CVMatching>> GetCVFromMatchingJD(int recruiterId, int jobDescriptionId);
        public string getEstimateDate(int jobId, DateTime dateRequirment);
        public List<CVMatching> GetCVSelected(int recruiterId, int jobDescriptionId);
        public List<CVMatching> GetCVMatchedByNumberRequirement(int recruiterId, int jobDescriptionId);
        public List<CVMatching> GetAllCVMatched(int recruiterId, int jobDescriptionId);
        public RecuirterDTO GetRecruiterInformation(int recruiterId);
        public List<CVMatching> GetCVApplied(int recruiterId, int jobDescriptionId);
        public int UpdateCVSelectedStatus(int recruiterId, int jobDescriptionId, int CVMatchingId);
        public int UpdateCVRejectedStatus(int recruiterId, int jobDescriptionId, int CVMatchingId);
        public int UpdateProfile(int recruiterId, string fullName, string phoneNumber, DateTime DOB, int genderId, string description);
        public List<JobDescription> getAllExpiredJD(int? recruiterId);
        public int UpdatePassword(int recruiterId, string oldPassword, string newPassword, string confirmPassword);
    }
}
