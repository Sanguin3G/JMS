using APIServer.Common;
using APIServer.DTO.ResponseBody;
using APIServer.IServices;
using APIServer.Models;
using APIServer.Models.Entity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Net;
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

        [HttpPost]
        [Route("update-img-candidate/{id}")]
        public BaseResponseBody<string> UpdateImgCandidate(int id, [FromForm] ImageUploadForm upload)
        {
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
        public BaseResponseBody<string> UpdateImgRecuirter(int id, [FromForm] ImageUploadForm upload)
        {
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
        public BaseResponseBody<string> UpdateImgCV(int candidateId, int cvId, [FromForm] ImageUploadForm upload)
        {
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
        public BaseResponseBody<string> UpdateImgCompanyAvt(int recuirterId, int companyId, [FromForm] ImageUploadForm upload)
        {
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
        public BaseResponseBody<string> UpdateImgCompanyBgr(int recuirterId, int companyId, [FromForm] ImageUploadForm upload)
        {
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
