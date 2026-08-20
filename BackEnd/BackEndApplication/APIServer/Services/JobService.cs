using APIServer.Common;
using APIServer.DTO.EntityDTO;
using APIServer.DTO.ResponseBody;
using APIServer.IRepositories;
using APIServer.IServices;
using APIServer.Models;
using APIServer.Models.Entity;
using AutoMapper;
using X.PagedList;

namespace APIServer.Services
{
    public class JobService : IJobService
    {
        private readonly IJobRepository _jobRepo;
        private readonly IRecuirterRepository _recuirterRepo;
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;
        private readonly IBaseRepository<Level> _levelRepo;

        public JobService(IJobRepository jobRepo, IRecuirterRepository recuirterRepo, IConfiguration configuration, IMapper mapper, IBaseRepository<Level> positionTitleRepo)
        {
            _jobRepo = jobRepo;
            _recuirterRepo = recuirterRepo;
            _configuration = configuration;
            _mapper = mapper;
            _levelRepo = positionTitleRepo;
        }

        public int Create(JobDescription data)
        {
            throw new NotImplementedException();
        }

        public int CreateById(JobDescription? data, int recuirterId)
        {
            throw new NotImplementedException();
        }

        public int Delete(JobDescription data)
        {
            throw new NotImplementedException();
        }

        public List<JobDescription> getAll()
        {
            return _jobRepo.GetAll();
        }

        public List<JobDescription> getAllById(int id)
        {
            if (id <= 0) throw new Exception("Not exist");
            return _jobRepo.GetAllById(id);
        }

        public JobDescription? GetById(int id)
        {
            if (id <= 0)
                throw new Exception("Data not valid");
            return _jobRepo.GetById(id);
        }

        public int Update(JobDescription data)
        {
            throw new NotImplementedException();
        }

        public PagingResponseBody<List<JobDTO>> GetJobsPaging(int? page, List<JobDTO> listData)
        {
            if (!listData.Any())
            {
                return new PagingResponseBody<List<JobDTO>>
                {
                    currentPage = 0,
                    message = GlobalStrings.SUCCESSFULLY,
                    ObjectLength = 0,
                    statusCode = System.Net.HttpStatusCode.OK,
                    TotalPage = 0,
                };
            }
            var numberInOnePage = int.Parse(_configuration["PageSize"]);
            var k = listData.Count;
            var totalPage = (int)Math.Ceiling((decimal)k / numberInOnePage);
            page = page <= 0 || page == null ? 1 : page;
            page = page > totalPage ? totalPage : page;
            var data = listData.ToPagedList((int)page, numberInOnePage).ToList();
            return new PagingResponseBody<List<JobDTO>>
            {
                currentPage = (int)page,
                message = GlobalStrings.SUCCESSFULLY,
                data = data,
                ObjectLength = k,
                statusCode = System.Net.HttpStatusCode.OK,
                TotalPage = totalPage,
            };
        }

        public List<JobDescription> getAllByCompany(int companyId)
        {
            return _jobRepo.getAllByCompanyId(companyId);
        }

        public List<JobDescription> getAllByRecuirter(int recuirterId)
        {
            return _jobRepo.getAllByRecuirterId(recuirterId);
        }

        public int deleteByRecuirterId(int? recuirterId, int JDid)
        {
            if (recuirterId < 1 || JDid < 1)
                throw new Exception("Input not valid");
            var jd = _jobRepo.GetById(JDid);
            if (!_recuirterRepo.checkExistById(recuirterId) || jd == null ||
                jd.RecuirterId != recuirterId)
            {
                throw new Exception("Not found");
            }
            jd.IsDelete = true;
            return _jobRepo.Update(jd);
        }

        public int deleteByCompanyId(int? companyId, int JDid)
        {
            throw new NotImplementedException();
        }

        public int updateByRecuirterId(int? recuirterId, JobDTO jobDTO)
        {
            var data = _mapper.Map<JobDescription>(jobDTO);
            var jd = _jobRepo.GetById(jobDTO.JobId);
            if (!_recuirterRepo.checkExistById(recuirterId) || jd == null ||
                jd.RecuirterId != recuirterId)
            {
                throw new Exception("Not found");
            }
            if (Validation.checkStringIsEmpty(data.Title, data.EducationRequirement,
                data.ExperienceRequirement, data.SkillRequirement, data.CandidateBenefit,
                data.Salary, data.ContactEmail, data.Address, data.JobDetail
                ))
            {
                throw new Exception("job not completed yet");
            }

            jd.Title = data.Title;
            jd.EmploymentTypeId = data.EmploymentTypeId;
            jd.GenderId = data.GenderId;
            jd.AgeRequirement = data.AgeRequirement;
            jd.EducationRequirement = data.EducationRequirement;
            jd.JobDetail = data.JobDetail;
            jd.ExperienceRequirement = data.ExperienceRequirement;
            jd.ProjectRequirement = data.ProjectRequirement;
            jd.SkillRequirement = data.SkillRequirement;
            jd.CertificateRequirement = data.CertificateRequirement;
            jd.OtherInformation = data.OtherInformation;
            jd.CandidateBenefit = data.CandidateBenefit;
            jd.Salary = data.Salary;
            jd.ContactEmail = data.ContactEmail;
            jd.Address = data.Address;
            jd.NumberRequirement = data.NumberRequirement;
            jd.LevelId = data.LevelId;
            jd.CategoryId = data.CategoryId;
            jd.CompanyId = data.CompanyId;
            jd.ExpiredDate = data.ExpiredDate;
            if (jd.CreatedAt > jd.ExpiredDate)
                throw new Exception("Expired date not valid");
            jd.PositionTitle = data.PositionTitle;

            return _jobRepo.Update(jd);
        }

        public List<int> GetVitaeListByMatching(int jobDesciptionId)
        {
            throw new NotImplementedException();
        }

        public int createById(JobDTO jobDTO, int recuirterId)
        {
            var data = _mapper.Map<JobDescription>(jobDTO);
            if (recuirterId <= 0) throw new Exception("recuirter not exist");
            if (data == null) throw new Exception("JD not accepted");
            if (!_recuirterRepo.checkExistById(recuirterId))
            {
                throw new Exception("recuirter not exist");
            }
            if (Validation.checkStringIsEmpty(data.Title, data.EducationRequirement,
                data.ExperienceRequirement, data.SkillRequirement, data.CandidateBenefit,
                data.Salary, data.ContactEmail, data.Address, data.JobDetail
                ))
            {
                throw new Exception("job not completed yet");
            }
            data.CompanyId = jobDTO.CompanyDTO == null ? null : jobDTO.CompanyDTO.CompanyId;
            data.IsDelete = false;
            data.CreatedAt = DateTime.Now;
            data.ExpiredDate = data.ExpiredDate == null ? DateTime.Now.AddDays(7) : data.ExpiredDate;
            if (data.CreatedAt > data.ExpiredDate)
                throw new Exception("Expired date not valid");

            return _jobRepo.CreateById(data, recuirterId);
        }

        public JobDescription getByRecruiterIdAndJobId(int recruiterId, int jobId)
        {
            try
            {
                if (recruiterId < 1 || jobId < 1)
                    throw new Exception("Data not valid");
                var job = _jobRepo.GetById(jobId);
                if (job.RecuirterId != recruiterId)
                    throw new UnauthorizedAccessException("Permission denied");
                return job;
            }
            catch (OverflowException ex)
            {
                throw ex;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        //public async List<int> GetVitaeListByMatching(int jobDesciptionId)
        //{
        //    JobDescription jobDescription = _JDRepository.GetById(jobDesciptionId);
        //    List<CurriculumVitae> vitaeList = _CVRepository.GetAll();

        //    foreach(CurriculumVitae curriculumVitae in vitaeList)
        //    {
        //        JObject jsonObject = JObject.Parse(rs);


        //    }

        //    return null;
        //}


    }
}
