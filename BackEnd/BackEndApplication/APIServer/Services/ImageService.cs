using APIServer.IRepositories;
using APIServer.IServices;
using APIServer.Models.Entity;
using AutoMapper;

namespace APIServer.Services
{
    public class ImageService : IImageService
    {
        private readonly IMapper mapper;
        private readonly IConfiguration configuration;
        private readonly IRecuirterRepository recuirterRepository;
        private readonly IBaseRepository<Company> companyRepo;
        private readonly ICandidateRepository candidateRepo;
        private readonly ICurriculumVitaeRepository cvRepo;
        private readonly string host;
        private readonly IBaseRepository<Slider> sliderRepo;

        public ImageService(IMapper mapper, IConfiguration configuration,
            IRecuirterRepository recuirterRepository, IBaseRepository<Company> companyRepo,
            ICandidateRepository candidateRepo, ICurriculumVitaeRepository cvRepo,
            IBaseRepository<Slider> sliderRepo)
        {
            this.mapper = mapper;
            this.configuration = configuration;
            this.recuirterRepository = recuirterRepository;
            this.companyRepo = companyRepo;
            this.candidateRepo = candidateRepo;
            this.cvRepo = cvRepo;
            host = Environment.GetEnvironmentVariable("ASPNETCORE_URLS")?
                .Split(';', StringSplitOptions.RemoveEmptyEntries)
                .FirstOrDefault() ?? string.Empty;
            this.sliderRepo = sliderRepo;
        }

        public string updateImageAvtCompany(int companyId, int recuirterId, IFormFile file)
        {
            try
            {
                if (recuirterId <= 0 || companyId <= 0)
                    throw new Exception("Data not valid");
                var rec = recuirterRepository.GetById(recuirterId);
                var com = companyRepo.GetById(companyId);
                if (rec == null || com == null)
                    throw new Exception("Not found");
                if (!com.EmployeeInCompanies.Any(x => x.RecuirterId == recuirterId) && com.RecuirterId != recuirterId)
                {
                    throw new Exception("Permission denied");
                }
                if (com.AvatarURL != null)
                {
                    deleteOldImg(com.AvatarURL);
                }
                string uniqueFileName = BuildSafeImageFileName(file, "Company_avt");
                uploadImg(file, uniqueFileName);
                var imagePath = Path.Combine("\\images\\", uniqueFileName);
                com.AvatarURL = imagePath;
                if (companyRepo.Update(com) > 0)
                    return host + com.AvatarURL;
                else
                    return "Error";
            }
            catch
            {
                throw;
            }
        }

        public string updateImageBgrCompany(int companyId, int recuirterId, IFormFile file)
        {
            try
            {
                if (recuirterId <= 0 || companyId <= 0)
                    throw new Exception("Data not valid");
                var rec = recuirterRepository.GetById(recuirterId);
                var com = companyRepo.GetById(companyId);
                if (rec == null || com == null)
                    throw new Exception("Not found");
                if (!com.EmployeeInCompanies.Any(x => x.RecuirterId == recuirterId) && com.RecuirterId != recuirterId)
                {
                    throw new Exception("Permission denied");
                }
                if (com.BackGroundURL != null)
                {
                    deleteOldImg(com.BackGroundURL);
                }
                string uniqueFileName = BuildSafeImageFileName(file, "Company_bgr");
                uploadImg(file, uniqueFileName);
                var imagePath = Path.Combine("\\images\\", uniqueFileName);
                com.BackGroundURL = imagePath;
                if (companyRepo.Update(com) > 0)
                    return host + com.BackGroundURL;
                else
                    return "Error";
            }
            catch
            {
                throw;
            }
        }

        public string updateImageCandidate(int candidatId, IFormFile file)
        {
            try
            {
                if (candidatId <= 0)
                    throw new Exception("Data not valid");
                var can = candidateRepo.GetById(candidatId);
                if (can == null)
                    throw new Exception("Not found");
                if (can.Id != candidatId)
                {
                    throw new Exception("Permission denied");
                }
                if (can.AvatarURL != null)
                {
                    deleteOldImg(can.AvatarURL);
                }
                string uniqueFileName = BuildSafeImageFileName(file, "CV");
                uploadImg(file, uniqueFileName);
                var imagePath = Path.Combine("\\images\\", uniqueFileName);
                can.AvatarURL = imagePath;
                if (candidateRepo.Update(can) > 0)
                    return host + can.AvatarURL;
                else
                    return "Error";
            }
            catch
            {
                throw;
            }
        }

        public string updateImageCV(int candidateId, int cvId, IFormFile file)
        {
            try
            {
                if (cvId <= 0)
                    throw new Exception("Data not valid");
                var cv = cvRepo.GetById(cvId);
                if (cv == null)
                    throw new Exception("Not found");
                if (cv.CandidateId != candidateId)
                    throw new Exception("Permission denied");
                if (cv.AvatarURL != null)
                {
                    deleteOldImg(cv.AvatarURL);
                }
                string uniqueFileName = BuildSafeImageFileName(file, "CV");
                uploadImg(file, uniqueFileName);
                var imagePath = Path.Combine("\\images\\", uniqueFileName);
                cv.AvatarURL = imagePath;
                if (cvRepo.Update(cv) > 0)
                    return host + cv.AvatarURL;
                else
                    return "Error";
            }
            catch
            {
                throw;
            }
        }

        public string updateImageRecuirter(int recuirterId, IFormFile file)
        {
            try
            {
                if (recuirterId <= 0)
                    throw new Exception("Data not valid");
                var rec = recuirterRepository.GetById(recuirterId);
                if (rec == null)
                    throw new Exception("Not found");
                if (rec.AvatarURL != null)
                {
                    deleteOldImg(rec.AvatarURL);
                }
                string uniqueFileName = BuildSafeImageFileName(file, "Recuirter");
                uploadImg(file, uniqueFileName);
                var imagePath = Path.Combine("\\images\\", uniqueFileName);
                rec.AvatarURL = imagePath;
                if (recuirterRepository.Update(rec) > 1)
                    return rec.AvatarURL;
                else
                    return host + "Error";
            }
            catch
            {
                throw;
            }
        }

        private void uploadImg(IFormFile file, string fileName)
        {
            try
            {
                if (file == null)
                    throw new Exception("Image file is required");
                if (!IsImageFileSizeValid(file, 5))
                {
                    throw new Exception("Only allow img size under 5mb");
                }
                var absoluthPath = Directory.GetCurrentDirectory();
                var imageDirectory = Path.Combine(absoluthPath, "wwwroot", "images");
                Directory.CreateDirectory(imageDirectory);
                var imagePath = Path.Combine(imageDirectory, fileName);
                using (var stream = new FileStream(imagePath, FileMode.Create))
                {
                    file.CopyTo(stream);
                }
            }
            catch
            {
                throw;
            }
        }

        private bool IsImageFileExtension(string fileExtension)
        {
            string[] allowedExtensions = { ".jpg", ".jpeg", ".png" };
            return allowedExtensions.Contains(fileExtension);
        }

        private string BuildSafeImageFileName(IFormFile file, string prefix)
        {
            if (file == null)
                throw new Exception("Image file is required");

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!IsImageFileExtension(extension))
                throw new Exception("Only allow img file");

            return $"{Guid.NewGuid():N}_{prefix}{extension}";
        }

        private bool IsImageFileSizeValid(IFormFile file, int maxSizeInMB)
        {
            if (file == null || file.Length == 0)
            {
                return false;
            }

            long maximumBytes = maxSizeInMB * 1024L * 1024L;
            return file.Length <= maximumBytes;
        }

        private void deleteOldImg(string? url)
        {
            var dir = Directory.GetCurrentDirectory();
            var path = dir + "\\wwwroot\\" + url;
            if (File.Exists(path))
                File.Delete(path);
            else
            {
                Console.WriteLine("Path not exist: " + path);
            }
        }

        public string addImgSlider(IFormFile file, Slider slider)
        {
            string uniqueFileName = BuildSafeImageFileName(file, "slider");

            try
            {
                if (!IsImageFileSizeValid(file, 25))
                {
                    throw new Exception("Only allow img size under 25mb");
                }
                var absoluthPath = Directory.GetCurrentDirectory();
                var sliderDirectory = Path.Combine(absoluthPath, "wwwroot", "slider");
                Directory.CreateDirectory(sliderDirectory);
                var folderPath = Path.Combine(sliderDirectory, uniqueFileName);
                using (var stream = new FileStream(folderPath, FileMode.Create))
                {
                    file.CopyTo(stream);
                }
            }
            catch
            {
                throw;
            }

            var imagePath = Path.Combine("\\slider\\", uniqueFileName);
            slider.URL = imagePath;
            var rs = sliderRepo.Create(slider);
            if (rs > 0)
                return host + slider.URL;
            else
                return "Error";
        }

        public int deleteImgSlider(int id)
        {
            if (id <= 0)
                throw new Exception("Data not valid");
            var slider = sliderRepo.GetById(id);
            if (slider == null)
                throw new Exception("Not found");
            try
            {
                deleteOldImg(slider.URL);
                return sliderRepo.Delete(slider.Id);
            }
            catch
            {
                throw;
            }
        }

        public List<Slider> getAllSlider()
        {
            var rs = sliderRepo.GetAll();
            foreach (var item in rs)
            {
                item.URL = host + item.URL;
            }
            return rs;
        }
    }
}
