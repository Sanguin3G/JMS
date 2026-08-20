using APIServer.Common;
using APIServer.DTO.EntityDTO;
using APIServer.DTO.ResponseBody;
using APIServer.IServices;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Security.Claims;

namespace APIServer.Controllers.UserModule
{
    [Route("api/[controller]")]
    [ApiController]
    public class TokenController : ControllerBase
    {
        private readonly IMapper mapper;
        private readonly IConfiguration _configuration;
        private readonly IRecuirterService recuirterService;
        private readonly ICandidateService candidateService;
        private readonly IAdminService adminService;

        public TokenController(IMapper mapper, IRecuirterService userService, IConfiguration configuration, ICandidateService candidateService, IAdminService adminService)
        {
            this.mapper = mapper;
            this.recuirterService = userService;
            this.recuirterService = userService;
            _configuration = configuration;
            this.candidateService = candidateService;
            this.adminService = adminService;
        }

        [HttpPost]
        [Route("login-admin")]
        public BaseResponseBody<string> loginForAdmin(LoginModel loginModel)
        {
            try
            {
                var user = adminService.Login(loginModel.username, loginModel.password);
                return new BaseResponseBody<string>
                {
                    statusCode = HttpStatusCode.OK,
                    data = adminService.generateToken(user),
                    message = GlobalStrings.SUCCESSFULLY,
                };
            }
            catch
            {
                return new BaseResponseBody<string>
                {
                    statusCode = HttpStatusCode.Unauthorized,
                    data = null,
                    message = GlobalStrings.LOGIN_ERROR,
                };
            }
        }

        [HttpPost]
        [Route("login-recuirter")]
        public BaseResponseBody<string> loginForRecuirter(LoginModel loginModel)
        {
            try
            {
                var user = recuirterService.Login(loginModel.username, loginModel.password);
                return new BaseResponseBody<string>
                {
                    statusCode = HttpStatusCode.OK,
                    data = recuirterService.generateToken(user),
                    message = GlobalStrings.SUCCESSFULLY,
                };
            }
            catch(Exception ex)
            {
                return new BaseResponseBody<string>
                {
                    statusCode = HttpStatusCode.Unauthorized,
                    data = null,
                    message = ex.Message,
                };
            }
        }



        [HttpPost]
        [Route("login-candidate")]
        public BaseResponseBody<string> loginForCandidate(LoginModel loginModel)
        {
            try
            {
                var u = loginModel.username;
                var p = loginModel.password;
                return new BaseResponseBody<string>
                {
                    data = candidateService.LoginCandidate(u, p),
                    message = GlobalStrings.SUCCESSFULLY,
                    statusCode = HttpStatusCode.OK,
                };
            }
            catch (Exception ex)
            {
                return new BaseResponseBody<string>
                {
                    message = ex.Message,
                    statusCode = HttpStatusCode.Unauthorized,
                };
            }
        }

        [HttpGet]
        [Route("test-recuirter")]
        [Authorize(Roles = $"{GlobalStrings.ROLE_RECUIRTER}")]
        public IActionResult testAuthor()
        {
            return Ok(recuirterService.getAll());
        }

        [HttpGet]
        [Route("test-candidate")]
        [Authorize(Roles = $"{GlobalStrings.ROLE_CANDIDATE}")]
        public IActionResult testAuthorCan()
        {
            return Ok(recuirterService.getAll());
        }

        [HttpPost]
        [Route("get-data-candidate")]
        [Authorize(Roles = GlobalStrings.ROLE_CANDIDATE)]
        public BaseResponseBody<CandidateDTO> getCandidateInformation()
        {
            try
            {
                var candidateId = GetAuthenticatedUserId();
                return new BaseResponseBody<CandidateDTO>()
                {
                    message = GlobalStrings.SUCCESSFULLY,
                    statusCode = HttpStatusCode.OK,
                    data = candidateService.GetCandidateInformation(candidateId),
                };
            }
            catch (Exception ex)
            {
                return new BaseResponseBody<CandidateDTO>()
                {
                    message = GlobalStrings.LOGIN_ERROR,
                    statusCode = HttpStatusCode.Unauthorized,
                };
            }
        }

        [HttpPost]
        [Route("get-data-recruiter")]
        [Authorize(Roles = GlobalStrings.ROLE_RECUIRTER)]
        public BaseResponseBody<RecuirterDTO> getRecruiterInformation()
        {
            try
            {
                var recruiterId = GetAuthenticatedUserId();
                return new BaseResponseBody<RecuirterDTO>()
                {
                    message = GlobalStrings.SUCCESSFULLY,
                    statusCode = HttpStatusCode.OK,
                    data = recuirterService.GetRecruiterInformation(recruiterId),
                };
            }
            catch (Exception ex)
            {
                return new BaseResponseBody<RecuirterDTO>()
                {
                    message = ex.Message,
                    statusCode = HttpStatusCode.Unauthorized,
                };
            }
        }
        [HttpPost]
        [Route("get-data-admin")]
        [Authorize(Roles = GlobalStrings.ROLE_ADMIN)]
        public BaseResponseBody<AdminDTO> getAdminInformation()
        {
            try
            {
                var adminId = GetAuthenticatedUserId();
                return new BaseResponseBody<AdminDTO>()
                {
                    message = GlobalStrings.SUCCESSFULLY,
                    statusCode = HttpStatusCode.OK,
                    data = adminService.GetAdminInformation(adminId),
                };
            }
            catch (Exception ex)
            {
                return new BaseResponseBody<AdminDTO>()
                {
                    message = ex.Message,
                    statusCode = HttpStatusCode.Unauthorized,
                };
            }
        }

        private int GetAuthenticatedUserId()
        {
            var userId = User.FindFirstValue("UserId");
            if (!int.TryParse(userId, out var parsedUserId))
                throw new UnauthorizedAccessException("Authenticated user id is missing.");
            return parsedUserId;
        }
    }
}
