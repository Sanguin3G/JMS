using APIServer.Common;
using APIServer.DTO.EntityDTO;
using APIServer.DTO.ResponseBody;
using APIServer.IRepositories;
using APIServer.IServices;
using APIServer.Models;
using APIServer.Models.Entity;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using X.PagedList;

namespace APIServer.Services
{
    public class CurriculumVitaeService : ICurriculumVitaeService
    {
        private readonly JMSDBContext _db;
        private readonly ICurriculumVitaeRepository _CvContext;
        private readonly ICVMatchingRepository _CVApplyContext;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;
        private readonly ICandidateRepository _candidateContext;

        public CurriculumVitaeService(ICurriculumVitaeRepository context, ICVMatchingRepository CVApplyContext, IMapper mapper, IConfiguration configuration, ICandidateRepository candidateRepository, JMSDBContext db)
        {
            _db = db;
            _CvContext = context;
            _CVApplyContext = CVApplyContext;
            _mapper = mapper;
            _configuration = configuration;
            _candidateContext = candidateRepository;
        }

        public int ChangeCVStatus(int candidateId, int CVId)
        {
            if (candidateId < 1 || CVId < 1)
                throw new Exception("Input not valid");
            return _CvContext.UpdateIsFindingJobStatus(candidateId, CVId);
        }

        public int Create(CurriculumVitae data)
        {
            throw new NotImplementedException();
        }

        public int CreateById(CurriculumVitae cv, int candidateId)
        {
            cv.Id = 0;
            cv.CandidateId = candidateId;
            ResetSectionIds(cv);
            if (Validation.checkStringIsEmpty(cv.Phone, cv.DisplayName, cv.DisplayEmail, cv.CVTitle) ||
                !Validation.IsPhoneNumberValid(cv.Phone))
            {
                throw new ArgumentNullException("cv not finished yet");
            }
            cv.IsFindingJob = false;
            cv.IsActive = true;
            cv.IsDelete = false;
            cv.CreatedDate = DateTime.Now;
            cv.LastUpdateDate = DateTime.Now;
            return _CvContext.Create(cv);
        }

        public int Delete(CurriculumVitae data)
        {
            throw new NotImplementedException();
        }

        public int DeleteCV(int candidateId, int CVId)
        {
            if (candidateId < 1 || CVId < 1)
                throw new Exception("Input not valid");
            return _CvContext.UpdateIsDeleteStatus(candidateId, CVId);
        }

        public List<CurriculumVitae> getAll()
        {
            return _CvContext.GetAll();
        }

        public List<CurriculumVitae> getAllById(int candidateId)
        {
            var rs = _CvContext.GetAllById(candidateId);
            if (rs == null)
                throw new Exception("CV not exist");
            return rs;
        }

        public CurriculumVitae? GetById(int id)
        {
            var rs = _CvContext.GetById(id);
            if (rs == null)
                throw new Exception("CV not exist");
            return rs;
        }

        public CurriculumVitae GetCurriculumVitaeByCandidateId(int candidateId, int CVid)
        {
            var rs = _CvContext.GetById(CVid);
            if (rs == null)
                throw new Exception("CV not exist");
            if (rs.CandidateId != candidateId)
            {
                throw new Exception("Permission denied");
            }
            return rs;
        }

        public int Update(CurriculumVitae data)
        {
            throw new NotImplementedException();
        }

        public int UpdateCvByCandidateIdAndCvId(int candidateId, int cvId, CurriculumVitaeDTO cvDTO)
        {
            var can = _candidateContext.GetById(candidateId);
            var cv = _CvContext.GetById(cvId);
            if (can == null || cv == null || cvDTO == null)
            {
                throw new Exception("Data not valid");
            }
            if (cv.CandidateId != candidateId || cv.IsDelete)
            {
                throw new Exception("Permission denied");
            }
            var cvChange = _mapper.Map<CurriculumVitae>(cvDTO);
            ResetSectionIds(cvChange);
            var context = _db;
            {
                var cvOrigin = context.CurriculumVitaes
                    .Include(x => x.Category)
                    .Include(x => x.Educations)
                    .Include(x => x.Certificates)
                    .Include(x => x.Awards)
                    .Include(x => x.Skills)
                    .Include(x => x.Projects)
                    .Include(x => x.JobExperiences)
                    .Include(x => x.Gender)
                    .Include(x => x.Level)
                    .Include(x => x.EmploymentType)
                    .First(x => x.Id == cvId);
                if (cvOrigin.Educations.Any())
                {
                    context.RemoveRange(cvOrigin.Educations);
                }
                if (cvOrigin.Certificates.Any())
                {
                    context.RemoveRange(cvOrigin.Certificates);
                }
                if (cvOrigin.Awards.Any())
                {
                    context.RemoveRange(cvOrigin.Awards);
                }
                if (cvOrigin.Skills.Any())
                {
                    context.RemoveRange(cvOrigin.Skills);
                }
                if (cvOrigin.Projects.Any())
                {
                    context.RemoveRange(cvOrigin.Projects);
                }
                if (cvOrigin.JobExperiences.Any())
                {
                    context.RemoveRange(cvOrigin.JobExperiences);
                }

                cvOrigin.CareerGoal = cvChange.CareerGoal;
                cvOrigin.EmploymentTypeId = cvChange.EmploymentTypeId;
                cvOrigin.Phone = cvChange.Phone;
                cvOrigin.DisplayName = cvChange.DisplayName;
                cvOrigin.DisplayEmail = cvChange.DisplayEmail;
                cvOrigin.Address = cvChange.Address;
                cvOrigin.DOB = cvChange.DOB;
                cvOrigin.LevelId = cvChange.LevelId;
                cvOrigin.CategoryId = cvChange.CategoryId;
                cvOrigin.CVTitle = cvChange.CVTitle;
                cvOrigin.Font = cvChange.Font;
                cvOrigin.Theme = cvChange.Theme;
                cvOrigin.GenderId = cvChange.GenderId;

                cvOrigin.Educations = cvChange.Educations;
                cvOrigin.Certificates = cvChange.Certificates;
                cvOrigin.Awards = cvChange.Awards;
                cvOrigin.Skills = cvChange.Skills;
                cvOrigin.Projects = cvChange.Projects;
                cvOrigin.JobExperiences = cvChange.JobExperiences;
                cvOrigin.LastUpdateDate = DateTime.Now;

                return context.SaveChanges();
            }
        }
        // Section records are owned by this CV; clients cannot reuse another CV's IDs.
        private static void ResetSectionIds(CurriculumVitae cv)
        {
            foreach (var item in cv.Educations ?? []) { item.Id = 0; item.CurriculumVitaeId = null; item.CurriculumVitae = null; }
            foreach (var item in cv.Certificates ?? []) { item.Id = 0; item.CurriculumVitaeId = null; item.CurriculumVitae = null; }
            foreach (var item in cv.Awards ?? []) { item.Id = 0; item.CurriculumVitaeId = null; item.CurriculumVitae = null; }
            foreach (var item in cv.Skills ?? []) { item.Id = 0; item.CurriculumVitaeId = null; item.CurriculumVitae = null; }
            foreach (var item in cv.Projects ?? []) { item.Id = 0; item.CurriculumVitaeId = null; item.CurriculumVitae = null; }
            foreach (var item in cv.JobExperiences ?? []) { item.Id = 0; item.CurriculumVitaeId = null; item.CurriculumVitae = null; }
        }

    }
}
