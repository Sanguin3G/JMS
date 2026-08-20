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
using System.Net;

namespace APIServer.Controllers.RecuirterModule
{
    [Route("api/[controller]")]
    [ApiController]
    public class JobDescController : ControllerBase
    {
        private readonly IJobService _jobService;
        private readonly ICurriculumVitaeService _curriculumVitaeService;
        private readonly IMapper _mapper;
        private readonly IConfiguration _config;

        public JobDescController(IJobService jobService, ICurriculumVitaeService curriculumVitaeService, IMapper mapper, IConfiguration config)
        {
            _jobService = jobService;
            _curriculumVitaeService = curriculumVitaeService;
            _mapper = mapper;
            _config = config;
        }

        [HttpGet]
        [Route("get-all-jd/{page}")]
        public PagingResponseBody<List<JobDTO>> getAllPostJob(int? page)
        {
            var listJob = _mapper.Map<List<JobDTO>>(_jobService.getAll());
            return _jobService.GetJobsPaging(page, listJob);
        }

        [HttpPost]
        [Authorize(Roles = GlobalStrings.ROLE_RECUIRTER)]
        [Route("new-post/{recuirterId}")]
        [UserIdMatchesClaim("recuirterId")]
        public async Task<BaseResponseBody<string>> createNewJD(int recuirterId, JobDTO jobDTO)
        {
            try
            {
                var count = _jobService.createById(jobDTO, recuirterId);
                return new BaseResponseBody<string>
                {
                    data = count.ToString(),
                    statusCode = HttpStatusCode.Created,
                    message = GlobalStrings.SUCCESSFULLY,
                };
            }
            catch (Exception ex)
            {
                return new BaseResponseBody<string>
                {
                    message = ex.Message,
                    statusCode = HttpStatusCode.BadRequest,
                };
            }
        }

        [HttpGet]
        [Route("all-jd-by-recuirter/{id}/{page}")]
        public PagingResponseBody<List<JobDTO>> getAllJDByRecuirterId(int id, int page)
        {
            var listJD = _mapper.Map<List<JobDTO>>(_jobService.getAllByRecuirter(id));
            return _jobService.GetJobsPaging(page, listJD);
        }

        [HttpGet]
        [Route("all-jd-by-company/{id}/{page}")]
        public PagingResponseBody<List<JobDTO>> getAllJDByCompany(int id, int page)
        {
            var listJD = _mapper.Map<List<JobDTO>>(_jobService.getAllByCompany(id));
            return _jobService.GetJobsPaging(page, listJD);
        }

        [HttpPost]
        [Authorize(Roles = GlobalStrings.ROLE_RECUIRTER)]
        [Route("delete-jd/{recuirterId}/{jobId}")]
        [UserIdMatchesClaim("recuirterId")]
        public BaseResponseBody<int> deleteJDByRecuirter(int recuirterId, int jobId)
        {
            try
            {
                return new BaseResponseBody<int>
                {
                    data = _jobService.deleteByRecuirterId(recuirterId, jobId),
                    message = GlobalStrings.SUCCESSFULLY_SAVED,
                    statusCode = HttpStatusCode.OK,
                };
            }
            catch
            {
                return new BaseResponseBody<int>
                {
                    message = GlobalStrings.BAD_REQUEST,
                    statusCode = HttpStatusCode.BadRequest,
                };
            }
        }

        [HttpPost]
        [Authorize(Roles = GlobalStrings.ROLE_RECUIRTER)]
        [Route("update-jd/{recuirterId}")]
        [UserIdMatchesClaim("recuirterId")]
        public BaseResponseBody<int> updateByRecuirter(int recuirterId,
            [FromBody] JobDTO jobDTO)
        {
            try
            {
                return new BaseResponseBody<int>
                {
                    message = GlobalStrings.SUCCESSFULLY,
                    data = _jobService.updateByRecuirterId(recuirterId, jobDTO),
                    statusCode = HttpStatusCode.OK,
                };
            }
            catch (Exception ex)
            {
                return new BaseResponseBody<int>
                {
                    message = ex.Message,
                    data = -1,
                    statusCode = HttpStatusCode.BadRequest,
                };
            }
        }

        [HttpGet]
        [Route("get-jd-by-id")]
        public BaseResponseBody<JobDTO> getJDById(int jdId)
        {
            try
            {
                var rs = _mapper.Map<JobDTO>(_jobService.GetById(jdId));
                return new BaseResponseBody<JobDTO>
                {
                    message = GlobalStrings.SUCCESSFULLY,
                    data = rs,
                    statusCode = HttpStatusCode.OK,
                };
            }
            catch (Exception ex)
            {
                return new BaseResponseBody<JobDTO>
                {
                    message = ex.Message,
                    statusCode = HttpStatusCode.BadRequest,
                };
            }
        }

        [Authorize(Roles = $"{GlobalStrings.ROLE_RECUIRTER}," +
            $"{GlobalStrings.ROLE_ADMIN}")]
        [HttpGet]
        [Route("get-jd-detail/{recruiterId}/{jdId}")]
        public BaseResponseBody<JobDTO> getJDById(int recruiterId, int jdId)
        {
            try
            {
                var rs = _mapper.Map<JobDTO>(_jobService.getByRecruiterIdAndJobId(recruiterId, jdId));
                return new BaseResponseBody<JobDTO>
                {
                    message = GlobalStrings.SUCCESSFULLY,
                    data = rs,
                    statusCode = HttpStatusCode.OK,
                };
            }
            catch (Exception ex)
            {
                return new BaseResponseBody<JobDTO>
                {
                    message = ex.Message,
                    statusCode = HttpStatusCode.BadRequest,
                };
            }
        }
    }
}
