using APIServer.Common;
using APIServer.DTO.EntityDTO;
using APIServer.DTO.ResponseBody;
using APIServer.IServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace APIServer.Controllers.UserModule
{
    [Route("api/[controller]")]
    [ApiController]
    public class RegistersController : ControllerBase
    {
        private readonly IRegisterService _registerService;
        private readonly IConfiguration _config;

        public RegistersController(IConfiguration configuration, IRegisterService registerService)
        {
            _config = configuration;
            _registerService = registerService;
        }

        [HttpPost]
        [Route("register-for-candidate")]
        public BaseResponseBody<string> CreateCandidateAccount([FromBody] RegisterRequest request)
        {
            try
            {
                string registerMess = _registerService.RegisterForCandidate(request.Email, request.FullName, request.Username, request.Password, request.ConfirmPassword);
                return new BaseResponseBody<string>
                {
                    message = registerMess,
                    statusCode = HttpStatusCode.OK,
                };
            }
            catch(Exception ex)
            {
                return new BaseResponseBody<string>
                {
                    message = APIServer.Common.ApiErrorMessage.For(ex, HttpContext),
                    statusCode = HttpStatusCode.BadRequest,
                };
            }
        }

        [HttpPost]
        [Route("register-for-recuirter")]
        public BaseResponseBody<string> CreateRecuirterAccount([FromBody] RegisterRequest request)
        {
            try
            {
                string registerMess = _registerService.RegisterForRecruiter(request.Email, request.FullName, request.Username, request.Password, request.ConfirmPassword);
                return new BaseResponseBody<string>
                {
                    message = registerMess,
                    statusCode = HttpStatusCode.OK,
                };
            }
            catch (Exception ex)
            {
                return new BaseResponseBody<string>
                {
                    message = APIServer.Common.ApiErrorMessage.For(ex, HttpContext),
                    statusCode = HttpStatusCode.BadRequest,
                };
            }
        }
    }
}
