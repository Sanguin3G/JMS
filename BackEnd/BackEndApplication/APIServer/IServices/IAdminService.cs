using APIServer.DTO.EntityDTO;
using APIServer.Models.Entity;

namespace APIServer.IServices
{
    public interface IAdminService : IBaseService<Admin>
    {
        public List<JobDescription> GetAllJobsByRecruiterId(int recruiterId);
        public List<CurriculumVitae> GetAllCVsByCandidateId(int candidateId);
        public List<Candidate> GetAllCandidates();
        public List<Recuirter> GetAllRecruiters();
        public List<Company> GetAllCompanies();
        public JobDescription GetJDById(int id);
        public CurriculumVitae GetCVById(int id);
        public Candidate GetCandidateById(int id);
        public Recuirter GetRecruiterById(int id);
        public Company GetCompanyById(int id);
        public int UpdateActiveStatus(int? recruiterId, int? candidateId);
        public string generateToken(Admin? admin);
        public Admin Login(string? username, string? password);
        public AdminDTO GetAdminInformation(int adminId);
        public int UpdatePassword(int adminId, string oldPassword, string newPassword, string confirmPassword);
        public StatisticDTO GetStatisticDTO();
    }
}
