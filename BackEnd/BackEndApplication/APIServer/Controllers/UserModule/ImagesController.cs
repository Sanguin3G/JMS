using APIServer.Common;
using APIServer.DTO.ResponseBody;
using APIServer.IServices;
using APIServer.Models;
using APIServer.Models.Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Net;
using System.Security.Claims;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace APIServer.Controllers.UserModule
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImagesController : ControllerBase
    {
        private readonly IImageService imageService;

        public ImagesController(IImageService imageService)
        {
            this.imageService = imageService;
        }

        private bool IsCurrentUser(int id)
        {
            return int.TryParse(User.FindFirstValue("UserId"), out var currentUserId)
                && currentUserId == id;
        }

        [HttpPost]
        [Route("update-img-candidate/{id}")]
        [Authorize(Roles = GlobalStrings.ROLE_CANDIDATE)]
        public BaseResponseBody<string> UpdateImgCandidate(int id, [FromForm] ImageUploadForm upload)
        {
            if (!IsCurrentUser(id))
            {
                Response.StatusCode = StatusCodes.Status403Forbidden;
                return new BaseResponseBody<string>
                {
                    message = "You can only update your own avatar.",
                    statusCode = HttpStatusCode.Forbidden,
                };
            }

            try
            {
                return new BaseResponseBody<string>
                {
                    data = imageService.updateImageCandidate(id, upload.File),
                    message = GlobalStrings.SUCCESSFULLY_SAVED,
                    statusCode = HttpStatusCode.OK
                };
            }
            catch (Exception ex)
            {
                return new BaseResponseBody<string>
                {
                    message = ex.Message,
                    statusCode = HttpStatusCode.BadRequest
                };
            }
        }

        [HttpPost]
        [Route("update-img-recuirter/{id}")]
        [Authorize(Roles = GlobalStrings.ROLE_RECUIRTER)]
        public BaseResponseBody<string> UpdateImgRecuirter(int id, [FromForm] ImageUploadForm upload)
        {
            if (!IsCurrentUser(id))
            {
                Response.StatusCode = StatusCodes.Status403Forbidden;
                return new BaseResponseBody<string>
                {
                    message = "You can only update your own avatar.",
                    statusCode = HttpStatusCode.Forbidden,
                };
            }

            try
            {
                return new BaseResponseBody<string>
                {
                    data = imageService.updateImageRecuirter(id, upload.File),
                    message = GlobalStrings.SUCCESSFULLY_SAVED,
                    statusCode = HttpStatusCode.OK
                };
            }
            catch (Exception ex)
            {
                return new BaseResponseBody<string>
                {
                    message = ex.Message,
                    statusCode = HttpStatusCode.BadRequest
                };
            }
        }

        [HttpPost]
        [Route("update-img-cv/{candidateId}/{cvId}")]
        [Authorize(Roles = GlobalStrings.ROLE_CANDIDATE)]
        public BaseResponseBody<string> UpdateImgCV(int candidateId, int cvId, [FromForm] ImageUploadForm upload)
        {
            if (!IsCurrentUser(candidateId))
            {
                Response.StatusCode = StatusCodes.Status403Forbidden;
                return new BaseResponseBody<string>
                {
                    message = "You can only update your own CV image.",
                    statusCode = HttpStatusCode.Forbidden,
                };
            }

            try
            {
                return new BaseResponseBody<string>
                {
                    data = imageService.updateImageCV(candidateId, cvId, upload.File),
                    message = GlobalStrings.SUCCESSFULLY_SAVED,
                    statusCode = HttpStatusCode.OK
                };
            }
            catch (Exception ex)
            {
                return new BaseResponseBody<string>
                {
                    message = ex.Message,
                    statusCode = HttpStatusCode.BadRequest
                };
            }
        }

        [HttpPost]
        [Route("update-img-avt-company/{recuirterId}/{companyId}")]
        [Authorize(Roles = GlobalStrings.ROLE_RECUIRTER)]
        public BaseResponseBody<string> UpdateImgCompanyAvt(int recuirterId, int companyId, [FromForm] ImageUploadForm upload)
        {
            if (!IsCurrentUser(recuirterId))
            {
                Response.StatusCode = StatusCodes.Status403Forbidden;
                return new BaseResponseBody<string>
                {
                    message = "You can only update a company you manage.",
                    statusCode = HttpStatusCode.Forbidden,
                };
            }

            try
            {
                return new BaseResponseBody<string>
                {
                    data = imageService.updateImageAvtCompany(companyId, recuirterId, upload.File),
                    message = GlobalStrings.SUCCESSFULLY_SAVED,
                    statusCode = HttpStatusCode.OK
                };
            }
            catch (Exception ex)
            {
                return new BaseResponseBody<string>
                {
                    message = ex.Message,
                    statusCode = HttpStatusCode.BadRequest
                };
            }
        }

        [HttpPost]
        [Route("update-img-bgr-company/{recuirterId}/{companyId}")]
        [Authorize(Roles = GlobalStrings.ROLE_RECUIRTER)]
        public BaseResponseBody<string> UpdateImgCompanyBgr(int recuirterId, int companyId, [FromForm] ImageUploadForm upload)
        {
            if (!IsCurrentUser(recuirterId))
            {
                Response.StatusCode = StatusCodes.Status403Forbidden;
                return new BaseResponseBody<string>
                {
                    message = "You can only update a company you manage.",
                    statusCode = HttpStatusCode.Forbidden,
                };
            }

            try
            {
                return new BaseResponseBody<string>
                {
                    data = imageService.updateImageBgrCompany(companyId, recuirterId, upload.File),
                    message = GlobalStrings.SUCCESSFULLY_SAVED,
                    statusCode = HttpStatusCode.OK
                };
            }
            catch (Exception ex)
            {
                return new BaseResponseBody<string>
                {
                    message = ex.Message,
                    statusCode = HttpStatusCode.BadRequest
                };
            }
        }

        [HttpGet]
        [Route("all-slider")]
        public BaseResponseBody<List<Slider>> getAllSlider()
        {
            return new BaseResponseBody<List<Slider>>
            {
                message = GlobalStrings.SUCCESSFULLY,
                statusCode = HttpStatusCode.OK,
                data = imageService.getAllSlider(),
            };
        }

        [HttpPost]
        [Route("new-slider")]
        [Authorize(Roles = GlobalStrings.ROLE_ADMIN)]
        public BaseResponseBody<string> createNewSlider([FromForm] SliderUploadForm upload)
        {
            try
            {
                return new BaseResponseBody<string>
                {
                    data = imageService.addImgSlider(upload.File, upload),
                    message = GlobalStrings.SUCCESSFULLY_SAVED,
                    statusCode = HttpStatusCode.OK,
                };
            }
            catch (Exception ex)
            {
                return new BaseResponseBody<string>
                {
                    message = ex.Message,
                    statusCode = HttpStatusCode.BadRequest,
                    data = ex.InnerException.Message
                };
            }
        }

        [HttpPost]
        [Route("delete-slider")]
        [Authorize(Roles = GlobalStrings.ROLE_ADMIN)]
        public BaseResponseBody<int> deleteSlider(int id)
        {
            try
            {
                return new BaseResponseBody<int>
                {
                    message = GlobalStrings.SUCCESSFULLY_SAVED,
                    statusCode = HttpStatusCode.OK,
                    data = imageService.deleteImgSlider(id),
                };
            }
            catch (Exception ex)
            {
                return new BaseResponseBody<int>
                {
                    message = ex.Message,
                    statusCode = HttpStatusCode.BadRequest,
                    data = -1
                };
            }
        }
    }

    public sealed class ImageUploadForm
    {
        public IFormFile File { get; set; } = null!;
    }

    public sealed class SliderUploadForm : Slider
    {
        public IFormFile File { get; set; } = null!;
    }
}
