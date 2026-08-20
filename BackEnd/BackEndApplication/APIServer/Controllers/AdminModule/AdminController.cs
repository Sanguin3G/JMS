using APIServer.Common;
using APIServer.DTO.EntityDTO;
using APIServer.DTO.ResponseBody;
using APIServer.IServices;
using APIServer.Services;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace APIServer.Controllers.AdminModule
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = GlobalStrings.ROLE_ADMIN)]
    public class AdminController : Controller
    {
        private readonly IAdminService _adminService;
        private readonly IMapper _mapper;
        private readonly IConfiguration _config;

        public AdminController(IAdminService adminService, IMapper mapper, IConfiguration configuration)
        {
            _adminService = adminService;
            _mapper = mapper;
            _config = configuration;
        }

        [HttpGet("get-all-cv-by-candidateid")]
        public BaseResponseBody<List<CurriculumVitaeDTO>> GetAllCvByCandidate(int candidateId)
        {
            try
            {
                var rs = _mapper.Map<List<CurriculumVitaeDTO>>(_adminService.GetAllCVsByCandidateId(candidateId));
                return new BaseResponseBody<List<CurriculumVitaeDTO>>
                {
                    data = rs,
                    statusCode = HttpStatusCode.OK,
                    message = GlobalStrings.SUCCESSFULLY,
                };
            }
            catch (OverflowException ex)
            {
                return new BaseResponseBody<List<CurriculumVitaeDTO>>
                {
                    data = null,
                    statusCode = HttpStatusCode.BadRequest,
                    message = ex.Message,
                };
            }
            catch (Exception ex)
            {
                return new BaseResponseBody<List<CurriculumVitaeDTO>>
                {
                    data = null,
                    statusCode = HttpStatusCode.BadRequest,
                    message = ex.Message,
                };
            }

        }

        [HttpGet("get-all-jd-by-recruiter")]
        public BaseResponseBody<List<JobDTO>> GetAllJDByRecruiter(int recruiterId)
        {
            try
            {
                var rs = _mapper.Map<List<JobDTO>>(_adminService.GetAllJobsByRecruiterId(recruiterId));
                return new BaseResponseBody<List<JobDTO>>
                {
                    data = rs,
                    statusCode = HttpStatusCode.OK,
                    message = GlobalStrings.SUCCESSFULLY,
                };
            }
            catch (OverflowException ex)
            {
                return new BaseResponseBody<List<JobDTO>>
                {
                    data = null,
                    statusCode = HttpStatusCode.BadRequest,
                    message = ex.Message,
                };
            }
            catch (Exception ex)
            {
                return new BaseResponseBody<List<JobDTO>>
                {
                    data = null,
                    statusCode = HttpStatusCode.BadRequest,
                    message = ex.Message,
                };
            }
        }

        [HttpGet("get-all-candidates")]
        public BaseResponseBody<List<CandidateDTO>> GetAllCandidates()
        {
            try
            {
                var rs = _mapper.Map<List<CandidateDTO>>(_adminService.GetAllCandidates());
                return new BaseResponseBody<List<CandidateDTO>>
                {
                    data = rs,
                    statusCode = HttpStatusCode.OK,
                    message = GlobalStrings.SUCCESSFULLY,
                };
            }
            catch (OverflowException ex)
            {
                return new BaseResponseBody<List<CandidateDTO>>
                {
                    data = null,
                    statusCode = HttpStatusCode.BadRequest,
                    message = ex.Message,
                };
            }
            catch (Exception ex)
            {
                return new BaseResponseBody<List<CandidateDTO>>
                {
                    data = null,
                    statusCode = HttpStatusCode.BadRequest,
                    message = ex.Message,
                };
            }
        }

        [HttpGet("get-all-recruiters")]
        public BaseResponseBody<List<RecuirterDTO>> GetAllRecruiters()
        {
            try
            {
                var rs = _mapper.Map<List<RecuirterDTO>>(_adminService.GetAllRecruiters());
                return new BaseResponseBody<List<RecuirterDTO>>
                {
                    data = rs,
                    statusCode = HttpStatusCode.OK,
                    message = GlobalStrings.SUCCESSFULLY,
                };
            }
            catch (OverflowException ex)
            {
                return new BaseResponseBody<List<RecuirterDTO>>
                {
                    data = null,
                    statusCode = HttpStatusCode.BadRequest,
                    message = ex.Message,
                };
            }
            catch (Exception ex)
            {
                return new BaseResponseBody<List<RecuirterDTO>>
                {
                    data = null,
                    statusCode = HttpStatusCode.BadRequest,
                    message = ex.Message,
                };
            }
        }

        [HttpGet("get-all-companies")]
        public BaseResponseBody<List<CompanyDTO>> GetAllCompanies()
        {
            try
            {
                var rs = _mapper.Map<List<CompanyDTO>>(_adminService.GetAllCompanies());
                return new BaseResponseBody<List<CompanyDTO>>
                {
                    data = rs,
                    statusCode = HttpStatusCode.OK,
                    message = GlobalStrings.SUCCESSFULLY,
                };
            }
            catch (OverflowException ex)
            {
                return new BaseResponseBody<List<CompanyDTO>>
                {
                    data = null,
                    statusCode = HttpStatusCode.BadRequest,
                    message = ex.Message,
                };
            }
            catch (Exception ex)
            {
                return new BaseResponseBody<List<CompanyDTO>>
                {
                    data = null,
                    statusCode = HttpStatusCode.BadRequest,
                    message = ex.Message,
                };
            }
        }


        [HttpGet("get-company-by-id/{id}")]
        public BaseResponseBody<CompanyDTO> GetCompanyById(int id)
        {
            try
            {
                var rs = _mapper.Map<CompanyDTO>(_adminService.GetCompanyById(id));
                return new BaseResponseBody<CompanyDTO>
                {
                    data = rs,
                    statusCode = HttpStatusCode.OK,
                    message = GlobalStrings.SUCCESSFULLY,
                };
            }
            catch (OverflowException ex)
            {
                return new BaseResponseBody<CompanyDTO>
                {
                    data = null,
                    statusCode = HttpStatusCode.BadRequest,
                    message = ex.Message,
                };
            }
            catch (Exception ex)
            {
                return new BaseResponseBody<CompanyDTO>
                {
                    data = null,
                    statusCode = HttpStatusCode.BadRequest,
                    message = ex.Message,
                };
            }
        }

        [HttpGet("get-candidate-by-id/{id}")]
        public BaseResponseBody<CandidateDTO> GetCandidateById(int id)
        {
            try
            {
                var rs = _mapper.Map<CandidateDTO>(_adminService.GetCandidateById(id));
                return new BaseResponseBody<CandidateDTO>
                {
                    data = rs,
                    statusCode = HttpStatusCode.OK,
                    message = GlobalStrings.SUCCESSFULLY,
                };
            }
            catch (OverflowException ex)
            {
                return new BaseResponseBody<CandidateDTO>
                {
                    data = null,
                    statusCode = HttpStatusCode.BadRequest,
                    message = ex.Message,
                };
            }
            catch (Exception ex)
            {
                return new BaseResponseBody<CandidateDTO>
                {
                    data = null,
                    statusCode = HttpStatusCode.BadRequest,
                    message = ex.Message,
                };
            }
        }

        [HttpGet("get-recruiter-by-id/{id}")]
        public BaseResponseBody<RecuirterDTO> GetRecruiterById(int id)
        {
            try
            {
                var rs = _mapper.Map<RecuirterDTO>(_adminService.GetRecruiterById(id));
                return new BaseResponseBody<RecuirterDTO>
                {
                    data = rs,
                    statusCode = HttpStatusCode.OK,
                    message = GlobalStrings.SUCCESSFULLY,
                };
            }
            catch (OverflowException ex)
            {
                return new BaseResponseBody<RecuirterDTO>
                {
                    data = null,
                    statusCode = HttpStatusCode.BadRequest,
                    message = ex.Message,
                };
            }
            catch (Exception ex)
            {
                return new BaseResponseBody<RecuirterDTO>
                {
                    data = null,
                    statusCode = HttpStatusCode.BadRequest,
                    message = ex.Message,
                };
            }
        }

        [HttpGet("get-jd-by-id/{id}")]
        public BaseResponseBody<JobDTO> GetJDById(int id)
        {
            try
            {
                var rs = _mapper.Map<JobDTO>(_adminService.GetJDById(id));
                return new BaseResponseBody<JobDTO>
                {
                    data = rs,
                    statusCode = HttpStatusCode.OK,
                    message = GlobalStrings.SUCCESSFULLY,
                };
            }
            catch (OverflowException ex)
            {
                return new BaseResponseBody<JobDTO>
                {
                    data = null,
                    statusCode = HttpStatusCode.BadRequest,
                    message = ex.Message,
                };
            }
            catch (Exception ex)
            {
                return new BaseResponseBody<JobDTO>
                {
                    data = null,
                    statusCode = HttpStatusCode.BadRequest,
                    message = ex.Message,
                };
            }
        }

        [HttpGet("get-cv-by-id/{id}")]
        public BaseResponseBody<CurriculumVitaeDTO> GetCVById(int id)
        {
            try
            {
                var rs = _mapper.Map<CurriculumVitaeDTO>(_adminService.GetCVById(id));
                return new BaseResponseBody<CurriculumVitaeDTO>
                {
                    data = rs,
                    statusCode = HttpStatusCode.OK,
                    message = GlobalStrings.SUCCESSFULLY,
                };
            }
            catch (OverflowException ex)
            {
                return new BaseResponseBody<CurriculumVitaeDTO>
                {
                    data = null,
                    statusCode = HttpStatusCode.BadRequest,
                    message = ex.Message,
                };
            }
            catch (Exception ex)
            {
                return new BaseResponseBody<CurriculumVitaeDTO>
                {
                    data = null,
                    statusCode = HttpStatusCode.BadRequest,
                    message = ex.Message,
                };
            }
        }

        [HttpPost("update-active-status")]
        public BaseResponseBody<string> UpdateActiveStatus(int? recruiterId, int? candidateId)
        {
            try
            {
                int n = _adminService.UpdateActiveStatus(recruiterId, candidateId);
                if (n > 0)
                    return new BaseResponseBody<string>
                    {
                        data = "update status successfully",
                        statusCode = HttpStatusCode.OK,
                        message = GlobalStrings.SUCCESSFULLY,
                    };
                else
                    return new BaseResponseBody<string>
                    {
                        data = "update status failed",
                        statusCode = HttpStatusCode.BadRequest,
                        message = GlobalStrings.BAD_REQUEST,
                    };
            }
            catch (OverflowException ex)
            {
                return new BaseResponseBody<string>
                {
                    data = null,
                    statusCode = HttpStatusCode.BadRequest,
                    message = ex.Message,
                };
            }
            catch (Exception ex)
            {
                return new BaseResponseBody<string>
                {
                    data = null,
                    statusCode = HttpStatusCode.BadRequest,
                    message = ex.Message,
                };
            }
        }

        [HttpGet("get-admin-by-id/{id}")]
        public BaseResponseBody<AdminDTO> GetAdminById(int id)
        {
            try
            {
                var rs = _mapper.Map<AdminDTO>(_adminService.GetById(id));
                return new BaseResponseBody<AdminDTO>
                {
                    data = rs,
                    statusCode = HttpStatusCode.OK,
                    message = GlobalStrings.SUCCESSFULLY,
                };
            }
            catch (OverflowException ex)
            {
                return new BaseResponseBody<AdminDTO>
                {
                    data = null,
                    statusCode = HttpStatusCode.BadRequest,
                    message = ex.Message,
                };
            }
            catch (Exception ex)
            {
                return new BaseResponseBody<AdminDTO>
                {
                    data = null,
                    statusCode = HttpStatusCode.BadRequest,
                    message = ex.Message,
                };
            }
        }

        [Route("get-statistic")]
        [HttpGet]
        public BaseResponseBody<StatisticDTO> getStatistic()
        {
            return new BaseResponseBody<StatisticDTO>
            {
                message = GlobalStrings.SUCCESSFULLY,
                statusCode = HttpStatusCode.OK,
                data = _adminService.GetStatisticDTO()
            };
        }

        [HttpPost("change-password")]
        [UserIdMatchesClaim("adminId")]
        public BaseResponseBody<int> ChangePassword(int adminId, string oldPassword, string newPassword, string confirmPassword)
        {
            try
            {
                int n = _adminService.UpdatePassword(adminId, oldPassword, newPassword, confirmPassword);
                if (n > 0)
                    return new BaseResponseBody<int>
                    {
                        data = n,
                        message = "Change password successfully",
                        statusCode = HttpStatusCode.OK,
                    };
                else if (n == 0)
                    return new BaseResponseBody<int>
                    {
                        data = n,
                        message = "Old password is not correct",
                        statusCode = HttpStatusCode.BadRequest,
                    };
                else if (n == -1)
                    return new BaseResponseBody<int>
                    {
                        data = n,
                        message = "Password have to have number of characters >= 8 and <= 20",
                        statusCode = HttpStatusCode.BadRequest,
                    };
                else
                    return new BaseResponseBody<int>
                    {
                        data = n,
                        message = "Password and confirmPassword are not matching",
                        statusCode = HttpStatusCode.BadRequest,
                    };

            }
            catch (Exception ex)
            {
                return new BaseResponseBody<int>
                {
                    message = ex.Message,
                    statusCode = HttpStatusCode.BadRequest,
                };
            }
        }
    }
}
