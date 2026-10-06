using APIServer.Infrastructure;
using APIServer.Common;
using APIServer.DTO.EntityDTO;
using APIServer.DTO.ResponseBody;
using APIServer.Features.Matching;
using APIServer.Features.Matching.Contracts;
using APIServer.IRepositories;
using APIServer.IServices;
using APIServer.Models.Entity;
using AutoMapper;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using System.Globalization;
using X.PagedList;

namespace APIServer.Services
{
    public class CandidateService : ICandidateService
    {
        private readonly ICurriculumVitaeRepository _context;
        private readonly ICVMatchingRepository _CVMatchingRepository;
        private readonly IJobRepository _JobContext;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;
        private readonly ICandidateRepository _candidateRepository;
        private readonly IMatchEvaluationService _matchEvaluationService;
        private readonly LocalImageStorage _imageStorage;

        public CandidateService(ICurriculumVitaeRepository context, ICVMatchingRepository CVMatchingRepository, IMapper mapper, IConfiguration configuration, ICandidateRepository candidateRepository, IJobRepository JobContext, IMatchEvaluationService matchEvaluationService, LocalImageStorage imageStorage)
        {
            _context = context;
            _CVMatchingRepository = CVMatchingRepository;
            _mapper = mapper;
            _configuration = configuration;
            _candidateRepository = candidateRepository;
            _JobContext = JobContext;
            _matchEvaluationService = matchEvaluationService;
            _imageStorage = imageStorage;
        }
        public int Create(Candidate data)
        {
            throw new NotImplementedException();
        }

        public int CreateById(Candidate data, int id)
        {
            throw new NotImplementedException();
        }

        public int Delete(Candidate data)
        {
            throw new NotImplementedException();
        }

        public List<Candidate> getAll()
        {
            throw new NotImplementedException();
        }

        public List<Candidate> getAllById(int id)
        {
            throw new NotImplementedException();
        }

        public Candidate? GetById(int id)
        {
            throw new NotImplementedException();
        }

        public int Update(Candidate data)
        {
            throw new NotImplementedException();
        }
        public CurriculumVitae? GetCVById(int id)
        {
            var rs = _context.GetById(id);
            if (rs == null)
                throw new Exception("CV not exist");
            return rs;
        }

        public List<CurriculumVitae> getAllCVByCandidateId(int candidateId)
        {
            var rs = _context.GetAllById(candidateId);
            if (rs == null)
                throw new Exception("CV not exist");
            return rs;
        }

        public async Task<int> ApplyJob(int candidateId, int CVid, int jobDescriptionId)
        {
            try
            {
                if (candidateId < 1 || CVid < 1 || jobDescriptionId < 1)
                    throw new Exception("Data not valid");
                List<CurriculumVitae> curriculumVitaes = getAllCVByCandidateId(candidateId);
                List<CVMatching> cVMatchings = _CVMatchingRepository.GetByCVIdAndJobDescriptionId(CVid, jobDescriptionId);
                CurriculumVitae? cv1 = GetCVById(CVid);
                var curriculumVitae = _mapper.Map<CurriculumVitaeDTO>(cv1);
                JobDescription jobDescription = _JobContext.GetById(jobDescriptionId);
                if (jobDescription == null)
                    throw new Exception("JD not found");
                if (jobDescription.ExpiredDate <= DateTime.Now)
                    throw new Exception("This job is no longer accepting applications");
                if (cv1 != null)
                {
                    if (curriculumVitaes.Any(cv => cv.Id == cv1.Id))
                    {
                        CVMatching CVApplied = new CVMatching();

                        if (_CVMatchingRepository.HasApplication(candidateId, jobDescriptionId))
                        {
                            return -1;
                        }

                        var existingMatch = cVMatchings.FirstOrDefault(x => x.CandidateId == candidateId && x.LastUpdateDate == cv1.LastUpdateDate && x.IsMatched && !x.IsApplied && x.IsReject == false);
                        if (existingMatch != null)
                        {
                            CVApplied = existingMatch;
                            CVApplied.IsApplied = true;
                            CVApplied.IsReject = false;
                            CVApplied.ApplyDate = DateTime.Now;
                            return _CVMatchingRepository.Update(CVApplied);
                        }
                        else
                        {
                            CVApplied.JobDescriptionId = jobDescriptionId;
                            CVApplied.CandidateId = candidateId;
                            CVApplied.CareerGoal = curriculumVitae.CareerGoal;
                            CVApplied.Phone = curriculumVitae.Phone;
                            CVApplied.DisplayName = curriculumVitae.DisplayName;
                            CVApplied.GenderId = curriculumVitae.GenderId;
                            CVApplied.CategoryName = curriculumVitae.CategoryName;
                            CVApplied.EmploymentTypeId = cv1.EmploymentTypeId;
                            CVApplied.DisplayEmail = curriculumVitae.DisplayEmail;
                            CVApplied.DOB = cv1.DOB;
                            CVApplied.Address = curriculumVitae.Address;
                            CVApplied.Education = JsonConvert.SerializeObject(curriculumVitae.Educations);
                            CVApplied.JobExperience = JsonConvert.SerializeObject(curriculumVitae.JobExperiences);
                            CVApplied.Skill = JsonConvert.SerializeObject(curriculumVitae.Skills);
                            CVApplied.Project = JsonConvert.SerializeObject(curriculumVitae.Projects);
                            CVApplied.Certificate = JsonConvert.SerializeObject(curriculumVitae.Certificates);
                            CVApplied.Award = JsonConvert.SerializeObject(curriculumVitae.Awards);
                            CVApplied.ApplyDate = DateTime.Now;
                            CVApplied.CreatedDate = cv1.CreatedDate;
                            CVApplied.LastUpdateDate = cv1.LastUpdateDate;
                            CVApplied.CurriculumVitaeId = curriculumVitae.Id;
                            CVApplied.Theme = curriculumVitae.Theme;
                            CVApplied.LevelId = cv1.LevelId;
                            CVApplied.Font = curriculumVitae.Font;
                            CVApplied.IsMatched = true;
                            CVApplied.IsApplied = true;
                            CVApplied.IsSelected = false;
                            CVApplied.IsReject = false;

                            //clone avt img to another folder
                            PreserveAvatarSnapshot(cv1.AvatarURL, CVApplied);
                            var matchEvaluation = await _matchEvaluationService.EvaluateAsync(jobDescription, cv1);
                            MatchEvaluationPersistence.Apply(CVApplied, matchEvaluation);

                            return _CVMatchingRepository.Create(CVApplied);
                        }

                    }
                    else throw new Exception("Your CV not exist");
                }
                else throw new Exception("Your CV not exist");
            }
            catch(OverflowException ex)
            {
                throw ex;
            }
            catch(DirectoryNotFoundException ex)
            {
                Console.WriteLine("Directory not found: " + ex.Message);
                throw ex;
            }
            catch(FileNotFoundException ex)
            {
                Console.WriteLine("File not found: " + ex.Message);
                throw ex;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return 0;
            }

        }

        public List<CVMatching> GetCVAppliedHistory(int candaidateId, DateTime? fromDate, DateTime? toDate)
        {
            List<CVMatching> cVApplies = _CVMatchingRepository.GetAllByCandidateIdAndFromDataAndToDate(candaidateId, fromDate, toDate);
            return cVApplies;
        }

        public PagingResponseBody<List<CVMatchingDTO>> GetCVAppliedHistoryPaging(int? page, List<CVMatchingDTO> listData)
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

        public CVMatching GetCVAppliedDetail(int candidateId, int CVAppliedId)
        {
            CVMatching cVApplied = _CVMatchingRepository.GetByCandidateIdAndCVAppliedId(candidateId, CVAppliedId);
            return cVApplied;
        }

        public string LoginCandidate(string? username, string? password)
        {
            if (Validation.checkStringIsEmpty(username, password))
            {
                throw new ArgumentNullException("Data not valid");
            }
            var can = _candidateRepository.LoginCandidate(username, password);
            if (can == null)
            {
                throw new Exception("Not found");
            }
            return generateToken(can);
        }

        public string generateToken(Candidate candidate)
        {
            var claims = new[] {
                        new Claim(JwtRegisteredClaimNames.Sub, _configuration["Jwt:Subject"]),
                        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                        new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(CultureInfo.InvariantCulture)),
                        new Claim("UserId", candidate.Id.ToString()),
                        new Claim("DisplayName", candidate.FullName),
                        new Claim("UserName", candidate.UserName),
                        new Claim("Email", candidate.Email),
                        new Claim(ClaimTypes.Role, GlobalStrings.ROLE_CANDIDATE),
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

        public List<CVMatching> GetCVApplied(int candaidateId)
        {
            List<CVMatching> cVApplied = _CVMatchingRepository.GetAllByIsApplied(candaidateId);
            return cVApplied;
        }

        public CandidateDTO GetCandidateInformation(int candidateId)
        {
            var candidate = _candidateRepository.GetById(candidateId)
                ?? throw new KeyNotFoundException("Candidate not found.");
            var result = _mapper.Map<CandidateDTO>(candidate);
            return result;
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

        public int UpdateProfile(int candidateId, string fullName, string phone, DateTime DOB, int genderId)
        {
            if (!IsInputValid(fullName)) throw new Exception("Full name have no special character and number, and at least 8 - 35 characters");
            return _candidateRepository.UpdateProfile(candidateId, fullName, phone, DOB, genderId);
        }

        public int UpdatePassword(int candidateId, string oldPassword, string newPassword, string confirmPassword)
        {
            Candidate candidate = _candidateRepository.GetById(candidateId);
            if(VerifyPassword(oldPassword, candidate.Password))
            {
                if (newPassword.Length < 8 || newPassword.Length > 20) return -1;
                if (newPassword.Equals(confirmPassword))
                    return _candidateRepository.UpdatePassword(candidateId, newPassword);
                else return -2;
            }
            return 0;
        }
        public bool VerifyPassword(string password, string hashedPassword)
        {
            return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
        }

        private void PreserveAvatarSnapshot(string? avatarUrl, CVMatching matching)
        {
            matching.AvatarURL = _imageStorage.Snapshot(avatarUrl);
        }
    }
}
