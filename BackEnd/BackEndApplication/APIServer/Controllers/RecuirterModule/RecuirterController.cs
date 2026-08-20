using APIServer.Common;
using APIServer.DTO.EntityDTO;
using APIServer.DTO.ResponseBody;
using APIServer.IServices;
using APIServer.Models;
using APIServer.Models.Entity;
using APIServer.Services;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Collections.Generic;
using System.Net;
using X.PagedList;

namespace APIServer.Controllers.RecuirterModule
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecuirterController : ControllerBase
    {
        private readonly IJobService _jobService;
        private readonly ICurriculumVitaeService _curriculumVitaeService;
        private readonly IRecuirterService _recuirterService;
        private readonly IMapper _mapper;
        private readonly IConfiguration _config;
        private readonly JMSDBContext context;

        public RecuirterController(IJobService jobService, ICurriculumVitaeService curriculumVitaeService, IRecuirterService recuirterService, IMapper mapper, IConfiguration config, JMSDBContext context)
        {
            _jobService = jobService;
            _curriculumVitaeService = curriculumVitaeService;
            _recuirterService = recuirterService;
            _mapper = mapper;
            _config = config;
            this.context = context;
        }

        [HttpGet]
        [Route("get-all")]
        public BaseResponseBody<List<RecuirterDTO>> getAllRec()
        {
            try
            {
                var rs = _recuirterService.getAll();
                return new BaseResponseBody<List<RecuirterDTO>>
                {
                    statusCode = HttpStatusCode.OK,
                    message = GlobalStrings.SUCCESSFULLY,
                    data = _mapper.Map<List<RecuirterDTO>>(rs),
                };
            }
            catch (Exception e)
            {
                return new BaseResponseBody<List<RecuirterDTO>>
                {
                    statusCode = HttpStatusCode.BadRequest,
                    message = GlobalStrings.BAD_REQUEST,
                };
            }
        }

        [HttpGet]
        [Authorize(Roles = GlobalStrings.ROLE_RECUIRTER)]
        [Route("get-all-cv-matched-by-number-requirement")]
        public BaseResponseBody<List<CVMatchingDTO>> GetCVMatchedByNumberRequirement(int recruiterId, int jobDescriptionId)
        {
            List<CVMatchingDTO> rs = _mapper.Map<List<CVMatchingDTO>>(_recuirterService.GetCVMatchedByNumberRequirement(recruiterId, jobDescriptionId));
            return new BaseResponseBody<List<CVMatchingDTO>>
            {
                statusCode = HttpStatusCode.OK,
                message = GlobalStrings.SUCCESSFULLY,
                data = rs,
            };
        }

        [HttpGet]
        [Authorize(Roles = GlobalStrings.ROLE_RECUIRTER)]
        [Route("get-all-cv-matched")]
        public BaseResponseBody<List<CVMatchingDTO>> GetAllCVMatched(int recruiterId, int jobDescriptionId)
        {
            List<CVMatchingDTO> rs = _mapper.Map<List<CVMatchingDTO>>(_recuirterService.GetAllCVMatched(recruiterId, jobDescriptionId));
            return new BaseResponseBody<List<CVMatchingDTO>>
            {
                statusCode = HttpStatusCode.OK,
                message = GlobalStrings.SUCCESSFULLY,
                data = rs,
            };
        }

        [HttpGet]
        [Authorize(Roles = GlobalStrings.ROLE_RECUIRTER)]
        [Route("get-all-cv-selected")]
        public PagingResponseBody<List<CVMatchingDTO>> GetCVSelected(int recruiterId, int jobDescriptionId, int? pageIndex)
        {
            List<CVMatchingDTO> rs = _mapper.Map<List<CVMatchingDTO>>(_recuirterService.GetCVSelected(recruiterId, jobDescriptionId));
            return _recuirterService.GetCVPaging(pageIndex, rs);
        }

        [HttpPost]
        [Authorize(Roles = GlobalStrings.ROLE_RECUIRTER)]
        [Route("matching-job")]
        public async Task<BaseResponseBody<List<CVMatchingDTO>>> MatchingJob(int recruiterId, int jobDescriptionId)
        {
            try
            {
                List<CVMatchingDTO> cVApplies = _mapper.Map<List<CVMatchingDTO>>(await _recuirterService.GetCVFromMatchingJD(recruiterId, jobDescriptionId));

                return new BaseResponseBody<List<CVMatchingDTO>>
                {
                    statusCode = HttpStatusCode.OK,
                    message = GlobalStrings.SUCCESSFULLY,
                    data = _mapper.Map<List<CVMatchingDTO>>(cVApplies),
                };
            }
            catch (Exception ex)
            {
                return new BaseResponseBody<List<CVMatchingDTO>>
                {
                    statusCode = HttpStatusCode.InternalServerError,
                    message = ex.Message,
                    data = null
                };
            }
            
        }

        [HttpPost]
        [Authorize(Roles = GlobalStrings.ROLE_RECUIRTER)]
        [Route("update-cv-selected-status")]
        public BaseResponseBody<string> UpdateCVSelectedStatusd(int recruiterId, int jobDescriptionId, int CVMatchingId)
        {
            int n = _recuirterService.UpdateCVSelectedStatus(recruiterId, jobDescriptionId, CVMatchingId);
            if (n > 0)
            {
                return new BaseResponseBody<string>
                {
                    statusCode = HttpStatusCode.OK,
                    message = "update successfully",
                };
            }

            return new BaseResponseBody<string>
            {
                statusCode = HttpStatusCode.BadRequest,
                message = "update failed",
            };
        }

        [HttpPost]
        [Authorize(Roles = GlobalStrings.ROLE_RECUIRTER)]
        [Route("reject-cv")]
        public BaseResponseBody<string> RejectCV(int recruiterId, int jobDescriptionId, int CVMatchingId)
        {
            int n = _recuirterService.UpdateCVRejectedStatus(recruiterId, jobDescriptionId, CVMatchingId);
            if (n > 0)
            {
                return new BaseResponseBody<string>
                {
                    statusCode = HttpStatusCode.OK,
                    message = "Reject successfully",
                };
            }

            return new BaseResponseBody<string>
            {
                statusCode = HttpStatusCode.BadRequest,
                message = "Reject failed",
            };
        }

        [HttpGet]
        [Authorize(Roles = GlobalStrings.ROLE_RECUIRTER)]
        [Route("get-cv-matching-detail")]
        public BaseResponseBody<CVMatchingDTO> GetCVMatchingDetail(int recruiterId, int jobDescriptionId, int CVMatchingId)
        {
            try
            {
                CVMatching CVMatching = _recuirterService.GetCVMatchingDetail(recruiterId, jobDescriptionId, CVMatchingId);
                var CVMatchingDTO = _mapper.Map<CVMatchingDTO>(CVMatching);
                if (CVMatchingDTO != null)

                    return new BaseResponseBody<CVMatchingDTO>
                    {
                        data = CVMatchingDTO,
                        statusCode = HttpStatusCode.OK,
                        message = "get CV successfully",
                    };
                else
                    return new BaseResponseBody<CVMatchingDTO>
                    {
                        data = CVMatchingDTO,
                        statusCode = HttpStatusCode.NotFound,
                        message = "CV doesn't exist",
                    };
            } catch (Exception ex)
            {
                return new BaseResponseBody<CVMatchingDTO>
                {
                    message = ex.Message.ToString(),
                };
            }
        }

        [HttpPost("update-profile")]
        [Authorize(Roles = GlobalStrings.ROLE_RECUIRTER)]
        public BaseResponseBody<CVMatchingDTO> UpdateProfile(int recruiterId, string fullName, string phoneNumber, DateTime DOB, int genderId, string description)
        {
            try
            {
                int n = _recuirterService.UpdateProfile(recruiterId, fullName, phoneNumber, DOB, genderId, description);
                if (n > 0)
                    return new BaseResponseBody<CVMatchingDTO>
                    {
                        message = "update profile successfully",
                        statusCode = HttpStatusCode.OK,
                    };
                else
                    return new BaseResponseBody<CVMatchingDTO>
                    {
                        message = "update profile failed",
                        statusCode = HttpStatusCode.BadRequest,
                    };
            }
            catch (Exception ex)
            {
                return new BaseResponseBody<CVMatchingDTO>
                {
                    message = ex.Message,
                    statusCode = HttpStatusCode.BadRequest,
                };
            }
        }

        [HttpGet]
        [Route("get-estimate-date-to-matching")]
        public BaseResponseBody<string> GetEstimateDate(int jobId, DateTime dateRequirement)
        {
            string rs = _recuirterService.getEstimateDate(jobId, dateRequirement);

            return new BaseResponseBody<string>
            {
                statusCode = HttpStatusCode.OK,
                message = GlobalStrings.SUCCESSFULLY,
                data = rs,
            };
        }

        [HttpGet]
        [Authorize(Roles = GlobalStrings.ROLE_RECUIRTER)]
        [Route("get-all-expired-jd/{recruiterId}")]
        public BaseResponseBody<List<JobDTO>> GetAllExpiredJD(int recruiterId)
        {
            List<JobDescription> jobDescriptions = _recuirterService.getAllExpiredJD(recruiterId);
            var JD = _mapper.Map<List<JobDTO>>(jobDescriptions);
            return new BaseResponseBody<List<JobDTO>>
            {
                statusCode = HttpStatusCode.OK,
                message = GlobalStrings.SUCCESSFULLY,
                data = JD,
            };
        }

        [HttpPost("change-password")]
        [Authorize(Roles = GlobalStrings.ROLE_RECUIRTER)]
        public BaseResponseBody<int> ChangePassword(int recruiterId, string oldPassword, string newPassword, string confirmPassword)
        {
            try
            {
                int n = _recuirterService.UpdatePassword(recruiterId, oldPassword, newPassword, confirmPassword);
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
