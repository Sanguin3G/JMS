using APIServer.Common;
using APIServer.DTO;
using APIServer.DTO.EntityDTO;
using APIServer.DTO.ResponseBody;
using APIServer.Features.Matching;
using APIServer.Features.Matching.Contracts;
using APIServer.IRepositories;
using APIServer.IServices;
using APIServer.Models;
using APIServer.Models.Entity;
using APIServer.Repositories;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Globalization;
using X.PagedList;

namespace APIServer.Services
{
    public class RecuirterService : IRecuirterService
    {
        private readonly IRecuirterRepository _recRepository;
        private readonly IConfiguration _configuration;
        private readonly ICVMatchingRepository _cVMatchingRepository;
        private readonly ICurriculumVitaeRepository _cVRepository;
        private readonly IMapper _mapper;
        private readonly IJobRepository _jobContext;
        private readonly IMatchEvaluationService _matchEvaluationService;

        public RecuirterService(IRecuirterRepository userRepository, IConfiguration configuration, ICVMatchingRepository cVMatchingRepository, ICurriculumVitaeRepository cVRepository, IMapper mapper, IJobRepository jobContext, IMatchEvaluationService matchEvaluationService)
        {
            _recRepository = userRepository;
            _configuration = configuration;
            _cVMatchingRepository = cVMatchingRepository;
            _cVRepository = cVRepository;
            _mapper = mapper;
            _jobContext = jobContext;
            _matchEvaluationService = matchEvaluationService;
        }

        public int Create(Recuirter data)
        {
            throw new NotImplementedException();
        }

        public int CreateRecuirterAccount(Recuirter? account)
        {
            if (account == null)
                throw new ArgumentNullException("account not exist");
            if (Validation.checkStringIsEmpty(
                account.FullName, account.UserName,
                account.Password, account.Email))
            {
                throw new ArgumentNullException("account not completed yet");
            }
            if (!checkEmail(account.Email))
            {
                throw new ArgumentNullException("Email not accepted");
            }
            if (_recRepository.checkExistUserNameEmail(account.UserName, account.Email))
            {
                throw new Exception("Username or email already in use");
            }
            var age = Validation.CalculateAge(account.DOB);
            if (account.DOB >= DateTime.Now || age < 18 || age > 100)
            {
                throw new Exception("Date of birth is not accepted");
            }
            account.CreatedDate = DateTime.Now;
            account.LastUpdate = DateTime.Now;
            account.IsDelete = false;
            account.IsActive = true;
            account.CreatedBy = null;
            //account.role = Role.User;
            return _recRepository.Create(account);
        }

        public int Delete(Recuirter data)
        {
            throw new NotImplementedException();
        }

        public string generateToken(Recuirter? recuirter)
        {
            var claims = new[] {
                        new Claim(JwtRegisteredClaimNames.Sub, _configuration["Jwt:Subject"]),
                        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                        new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(CultureInfo.InvariantCulture)),
                        new Claim("UserId", recuirter.Id.ToString()),
                        new Claim("DisplayName", recuirter.FullName),
                        new Claim("UserName", recuirter.UserName),
                        new Claim("Email", recuirter.Email),
                        new Claim(ClaimTypes.Role, GlobalStrings.ROLE_RECUIRTER),
                    };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var signIn = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                _configuration["Jwt:Issuer"],
                _configuration["Jwt:Audience"],
                claims,
                expires: DateTime.Now.AddMinutes(double.Parse(_configuration["Jwt:expiredMins"])),
                //expires: DateTime.Now.AddSeconds(20),
                signingCredentials: signIn);

            var accessToken = new JwtSecurityTokenHandler().WriteToken(token);
            return accessToken;
        }

        public List<Recuirter> getAll()
        {
            return _recRepository.GetAll();
        }

        public Recuirter getById(int? id)
        {
            if (id == null) throw new ArgumentNullException("error");
            var rs = _recRepository.GetById((int)id);
            if (rs == null)
                throw new NullReferenceException("error");
            return rs;
        }

        public Recuirter Login(string? username, string? password)
        {
            if (Validation.checkStringIsEmpty(username, password))
            {
                throw new ArgumentNullException("username or password empty");
            }
            var user = _recRepository.Login(username, password);
            if (user == null)
                throw new SecurityTokenException(GlobalStrings.LOGIN_ERROR);
            return user;
        }

        public int Update(Recuirter data)
        {
            return _recRepository.Update(data);
        }

        private bool checkEmail(string? email)
        {
            string pattern = @"^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$";
            return Regex.IsMatch(email, pattern);
        }

        public List<Recuirter> getAllById(int id)
        {
            throw new NotImplementedException();
        }

        public int CreateById(Recuirter data, int id)
        {
            throw new NotImplementedException();
        }

        public Recuirter? GetById(int id)
        {
            throw new NotImplementedException();
        }

        public string GetResult(string prompt)
        {
            throw new NotImplementedException();
        }

        public List<CVMatching> GetCVAppliedHistory(int recruiterId, int? jobDescription, DateTime? fromDate, DateTime? toDate)
        {
            List<CVMatching> cVApplies = _cVMatchingRepository.GetAllByRecruiterIdAndJobDescriptionIdAndFromDataAndToDate(recruiterId, jobDescription, fromDate, toDate);
            return cVApplies;
        }

        public PagingResponseBody<List<CVMatchingDTO>> GetCVPaging(int? page, List<CVMatchingDTO> listData)
        {
            if (!listData.Any())
            {
                return new PagingResponseBody<List<CVMatchingDTO>>
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
            return new PagingResponseBody<List<CVMatchingDTO>>
            {
                currentPage = (int)page,
                message = GlobalStrings.SUCCESSFULLY,
                data = data,
                ObjectLength = k,
                statusCode = System.Net.HttpStatusCode.OK,
                TotalPage = totalPage,
            };
        }

        public CVMatching GetCVMatchingDetail(int recruiterId, int jobDescriptionId, int CVMatchingId)
        {
            CVMatching cVApply = _cVMatchingRepository.GetByRecruiterIdAndCVAppliedId(recruiterId, jobDescriptionId, CVMatchingId);
            return cVApply;
        }

        public async Task<List<CVMatching>> GetCVFromMatchingJD(int recruiterId, int jobDescriptionId)
        {
            try
            {
                var JDList = _jobContext.getAllByRecuirterId(recruiterId);
                List<CVMatching> matchedList = new List<CVMatching>();
                JobDescription jd = _jobContext.GetById(jobDescriptionId);
                if (JDList.Any(x => x.JobId == jd.JobId && !x.IsDelete))
                {
                    if (jd != null)
                    {
                        List<CurriculumVitae> curriculumVitaes = _cVRepository.GetAllByCategoryId(jd.CategoryId);
                        for (int i = 0; i < curriculumVitaes.Count; i++)
                        {
                            CurriculumVitae cv = _cVRepository.GetById(curriculumVitaes[i].Id);
                            try
                            {
                                CVMatching cvAfterMatching = await MatchingCV(cv.Id, jobDescriptionId, cv, jd);
                                if (cvAfterMatching != null)
                                {
                                    matchedList.Add(cvAfterMatching);
                                }
                            }
                            catch (NullReferenceException)
                            {
                                continue;
                            }
                            catch (ArgumentNullException)
                            {
                                continue;
                            }
                        }
                        matchedList = matchedList.OrderByDescending(cv => cv.PercentMatching).ToList();
                    }
                    return matchedList;
                }
                return matchedList;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<CVMatching> MatchingCV(int CVid, int jobDescriptionId, CurriculumVitae cv, JobDescription jd)
        {
            try
            {
                using (var context = new JMSDBContext())
                {
                    List<CVMatching> cVApplyList = context.CVMatchings.Include(c => c.Candidate).Include(p => p.Level)
                    .Include(j => j.JobDescription).ThenInclude(c => c.Company)
                    .Include(j => j.JobDescription).ThenInclude(c => c.Category)
                    .Include(j => j.JobDescription).ThenInclude(c => c.Recuirter)
                    .Include(j => j.JobDescription).ThenInclude(e => e.EmploymentType).Where(x => x.CurriculumVitaeId == CVid && x.JobDescriptionId == jobDescriptionId).ToList();
                    var CVAppliedByCVIdList = _mapper.Map<List<CVMatchingDTO>>(cVApplyList);
                    if (cv != null && jd != null)
                    {
                        var curriculumVitae = _mapper.Map<CurriculumVitaeDTO>(cv);
                        CVMatching CVApplied = new CVMatching();

                        if (cVApplyList.Any(x => x.CurriculumVitaeId == curriculumVitae.Id && x.JobDescriptionId == jobDescriptionId && x.LastUpdateDate == cv.LastUpdateDate && x.IsApplied == true && x.IsMatched == true && x.IsReject == false))
                        {
                            return null;
                        }
                        if (cVApplyList.Any(x => x.CurriculumVitaeId == curriculumVitae.Id && x.JobDescriptionId == jobDescriptionId && x.LastUpdateDate == cv.LastUpdateDate && x.IsMatched == true && x.IsReject == false))
                        {
                            return null;
                        }
                        if (cVApplyList.Any(x => x.CurriculumVitaeId == curriculumVitae.Id && x.JobDescriptionId == jobDescriptionId && x.LastUpdateDate == cv.LastUpdateDate && x.IsMatched == true && x.IsApplied == false && x.IsReject == true))
                        {
                            return null;
                        }
                        CVApplied.JobDescriptionId = jobDescriptionId;
                        CVApplied.CandidateId = curriculumVitae.CandidateId;
                        CVApplied.CareerGoal = curriculumVitae.CareerGoal;
                        CVApplied.Phone = curriculumVitae.Phone;
                        CVApplied.DisplayName = curriculumVitae.DisplayName;
                        CVApplied.GenderId = curriculumVitae.GenderId;
                        CVApplied.CategoryName = curriculumVitae.CategoryName;
                        CVApplied.EmploymentTypeId = cv.EmploymentTypeId;
                        CVApplied.DisplayEmail = curriculumVitae.DisplayEmail;
                        CVApplied.DOB = Convert.ToDateTime(curriculumVitae.DOB);
                        CVApplied.Address = curriculumVitae.Address;
                        CVApplied.Education = JsonConvert.SerializeObject(curriculumVitae.Educations);
                        CVApplied.JobExperience = JsonConvert.SerializeObject(curriculumVitae.JobExperiences);
                        CVApplied.Skill = JsonConvert.SerializeObject(curriculumVitae.Skills);
                        CVApplied.Project = JsonConvert.SerializeObject(curriculumVitae.Projects);
                        CVApplied.Certificate = JsonConvert.SerializeObject(curriculumVitae.Certificates);
                        CVApplied.Award = JsonConvert.SerializeObject(curriculumVitae.Awards);
                        CVApplied.ApplyDate = DateTime.Now;
                        CVApplied.CreatedDate = cv.CreatedDate;
                        CVApplied.LastUpdateDate = cv.LastUpdateDate;
                        CVApplied.Theme = curriculumVitae.Theme;
                        CVApplied.LevelId = cv.LevelId;
                        CVApplied.Font = curriculumVitae.Font;

                        PreserveAvatarSnapshot(cv.AvatarURL, CVApplied);

                        var matchEvaluation = await _matchEvaluationService.EvaluateAsync(jd, cv);
                        MatchEvaluationPersistence.Apply(CVApplied, matchEvaluation);
                        CVApplied.CurriculumVitaeId = curriculumVitae.Id;
                        CVApplied.IsMatched = true;
                        CVApplied.IsApplied = false;
                        CVApplied.IsSelected = false;
                        CVApplied.IsReject = false;
                        context.CVMatchings.Add(CVApplied);
                        context.SaveChanges();
                        await Task.Delay(12000);
                        return CVApplied;

                    }
                    else throw new Exception("cv or jd does not exist");
                }
            }
            catch (DirectoryNotFoundException ex)
            {
                throw ex;
            }
            catch (FileNotFoundException ex)
            {
                throw ex;
            }
            catch (IOException ex)
            {
                throw ex;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public string getEstimateDate(int jobId, DateTime dateRequirment)
        {
            int second = 15;
            JobDescription jobDescriptions = _jobContext.GetById(jobId);
            if (jobDescriptions != null)
            {
                List<CurriculumVitae> curriculumVitaes = _cVRepository.GetAllByCategoryId(jobDescriptions.CategoryId);
                if (curriculumVitaes != null)
                {
                    second = second * curriculumVitaes.Count;
                    if (dateRequirment > DateTime.Now.AddSeconds(second))
                    {
                        return dateRequirment.AddSeconds(-second).ToString();

                    }
                    else
                    {
                        return $"Date Requirement have to be started at {DateTime.Now.AddSeconds(second + 60)} or later";
                    }
                }
                return "Now the system doesn't have any CV that can match with your JD. Try again later.";
            }
            return "Your JD does not exist";
        }

        public List<CVMatching> GetCVSelected(int recruiterId, int jobDescriptionId)
        {
            List<CVMatching> CVSelected = _cVMatchingRepository.GetAllByIsSelected(recruiterId, jobDescriptionId);
            return CVSelected;
        }

        public List<CVMatching> GetAllCVMatched(int recruiterId, int jobDescriptionId)
        {
            List<CVMatching> CVMatched = _cVMatchingRepository.GetAllByIsMatchedByNumberRequirement(recruiterId, jobDescriptionId);
            return CVMatched;
        }

        public List<CVMatching> GetCVMatchedByNumberRequirement(int recruiterId, int jobDescriptionId)
        {
            List<CVMatching> CVMatched = _cVMatchingRepository.GetAllByIsMatchedByNumberRequirement(recruiterId, jobDescriptionId);
            using (var context = new JMSDBContext())
            {
                JobDescription? jobDescription = context.JobDescriptions.FirstOrDefault(x => x.RecuirterId == recruiterId && x.JobId == jobDescriptionId);
                if (jobDescription != null)
                {
                    var appliedCount = context.CVMatchings.Where(x => x.JobDescriptionId == jobDescriptionId && x.IsReject == false).Count(x => x.IsApplied);
                    if (jobDescription.MatchingNumberRequirement <= appliedCount || jobDescription.MatchingNumberRequirement == null)
                        return CVMatched.Take(appliedCount).ToList();
                    else return CVMatched.Take((int)jobDescription.MatchingNumberRequirement).ToList();
                }
                else
                    throw new Exception("JD not found");
            }
        }

        public List<CVMatching> GetCVApplied(int recruiterId, int jobDescriptionId)
        {
            List<CVMatching> CVApplied = _cVMatchingRepository.GetAllByIsApplied(recruiterId, jobDescriptionId);
            return CVApplied;
        }

        public int UpdateCVSelectedStatus(int recruiterId, int jobDescriptionId, int CVMatchingId)
        {
            return _cVMatchingRepository.UpdateSelectedStatus(recruiterId, jobDescriptionId, CVMatchingId);
        }

        public int UpdateCVRejectedStatus(int recruiterId, int jobDescriptionId, int CVMatchingId)
        {
            return _cVMatchingRepository.UpdateRejectedStatus(recruiterId, jobDescriptionId, CVMatchingId);
        }

        public RecuirterDTO GetRecruiterInformation(int recruiterId)
        {
            var recruiter = _recRepository.GetById(recruiterId)
                ?? throw new KeyNotFoundException("Recruiter not found.");
            return _mapper.Map<RecuirterDTO>(recruiter);
        }

        private bool IsInputValid(string? fullname)
        {
            if (fullname != null)
            {
                string fullnamePattern = @"^[\p{L} ]{8,35}$";
                return Regex.IsMatch(fullname, fullnamePattern);
            }
            return false;
        }

        public int UpdateProfile(int recruiterId, string fullName, string phoneNumber, DateTime DOB, int genderId, string description)

        {
            if (!IsInputValid(fullName)) throw new Exception("Full name have no special character and number, and at least 8 - 35 characters");
            return _recRepository.UpdateProfile(recruiterId, fullName, phoneNumber, DOB, genderId, description);
        }

        public List<JobDescription> getAllExpiredJD(int? recruiterId)
        {
            return _jobContext.getAllExpiredJD(recruiterId);
        }

        public int UpdatePassword(int recruiterId, string oldPassword, string newPassword, string confirmPassword)
        {
            Recuirter recruiter = _recRepository.GetById(recruiterId);
            if (VerifyPassword(oldPassword, recruiter.Password))
            {
                if (newPassword.Length < 8 || newPassword.Length > 20) return -1;
                if (newPassword.Equals(confirmPassword))
                    return _recRepository.UpdatePassword(recruiterId, newPassword);
                else return -2;
            }
            return 0;
        }

        public bool VerifyPassword(string password, string hashedPassword)
        {
            return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
        }

        private static void PreserveAvatarSnapshot(string? avatarUrl, CVMatching matching)
        {
            if (string.IsNullOrWhiteSpace(avatarUrl))
            {
                return;
            }

            // Development seed data uses curated remote URLs. Only copy a local
            // upload when it actually resolves inside wwwroot; never treat a URL
            // query string as a filesystem path.
            matching.AvatarURL = avatarUrl;
            if (Uri.TryCreate(avatarUrl, UriKind.Absolute, out _))
            {
                return;
            }

            var relativePath = avatarUrl.Replace('\\', '/').TrimStart('/');
            var sourcePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", relativePath);
            if (!File.Exists(sourcePath))
            {
                return;
            }

            var fileName = Path.GetFileName(relativePath);
            var destinationDirectory = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images_clone");
            Directory.CreateDirectory(destinationDirectory);
            File.Copy(sourcePath, Path.Combine(destinationDirectory, fileName), overwrite: true);
            matching.AvatarURL = "/images_clone/" + fileName;
        }
    }
}
