using APIServer.IRepositories;
using APIServer.Models;
using APIServer.Models.Entity;
using Microsoft.EntityFrameworkCore;

namespace APIServer.Repositories
{
    public class CVMatchingRepository : ICVMatchingRepository
    {
        private readonly JMSDBContext _context;

        public CVMatchingRepository(JMSDBContext context)
        {
            _context = context;
        }

        public int Create(CVMatching data)
        {
            _context.Add(data);
            return _context.SaveChanges();
        }

        public int CreateById(CVMatching data, int? id)
        {
            throw new NotImplementedException();
        }

        public int Delete(int id)
        {
            throw new NotImplementedException();
        }

        public List<CVMatching> GetAll()
        {
            throw new NotImplementedException();
        }

        public List<CVMatching> GetAllByCandidateIdAndFromDataAndToDate(int candidateId, DateTime? fromDate, DateTime? toDate)
        {
            List<CVMatching> cVApplies = GetAllById(candidateId);
            if (fromDate != null) cVApplies = cVApplies.Where(x => x.ApplyDate >= fromDate).ToList();
            if (toDate != null) cVApplies = cVApplies.Where(x => x.ApplyDate <= toDate).ToList();

            return cVApplies;
        }

        public List<CVMatching> GetAllById(int id)
        {
            List<CVMatching> cVApplies = _context.CVMatchings.Include(c => c.Candidate).Include(p => p.Level)
                .Include(j => j.JobDescription).ThenInclude(c => c.Company)
                .Include(j => j.JobDescription).ThenInclude(c => c.Category)
                .Include(j => j.JobDescription).ThenInclude(e => e.EmploymentType)
                .Where(x => x.CandidateId == id).ToList();
            return cVApplies;
        }

        public List<CVMatching> GetAllByIsApplied(int candidateId)
        {
            List<CVMatching> cVApplies = _context.CVMatchings.Include(c => c.Candidate)
                .Include(p => p.Level).Include(g => g.Gender)
                .Include(j => j.JobDescription).ThenInclude(c => c.Company)
                .Include(j => j.JobDescription).ThenInclude(c => c.Category)
                .Include(j => j.JobDescription).ThenInclude(e => e.EmploymentType)
                .Where(x => x.CandidateId == candidateId && x.IsApplied).OrderByDescending(x => x.ApplyDate).ToList();
            return cVApplies;
        }

        public List<CVMatching> GetAllByIsApplied(int recruiterId, int jobDescriptionId)
        {
            List<CVMatching> cVMatchings = _context.CVMatchings.Include(c => c.Candidate)
                            .Include(p => p.Level).Include(g => g.Gender)
                            .Include(j => j.JobDescription).ThenInclude(c => c.Company)
                            .Include(j => j.JobDescription).ThenInclude(c => c.Category)
                            .Include(j => j.JobDescription).ThenInclude(c => c.Recuirter)
                            .Include(j => j.JobDescription).ThenInclude(e => e.EmploymentType)
                            .Where(x => x.JobDescription.RecuirterId == recruiterId && x.JobDescriptionId == jobDescriptionId && x.IsApplied && x.IsReject == false).OrderByDescending(x => x.PercentMatching).ToList();
            return cVMatchings;
        }

        public List<CVMatching> GetAllByIsMatchedLeft(int recruiterId, int jobDescriptionId)
        {
            List<CVMatching> cVMatchings = _context.CVMatchings.Include(c => c.Candidate)
                            .Include(p => p.Level).Include(g => g.Gender)
                            .Include(j => j.JobDescription).ThenInclude(c => c.Company)
                            .Include(j => j.JobDescription).ThenInclude(c => c.Category)
                            .Include(j => j.JobDescription).ThenInclude(c => c.Recuirter)
                            .Include(j => j.JobDescription).ThenInclude(e => e.EmploymentType)
                            .Where(x => x.JobDescription.RecuirterId == recruiterId && x.JobDescriptionId == jobDescriptionId && x.IsMatched && x.IsReject == false && x.IsApplied).OrderByDescending(x => x.PercentMatching).ToList();
            List<CVMatching> cVMatchings2 = _context.CVMatchings.Include(c => c.Candidate)
                            .Include(p => p.Level).Include(g => g.Gender)
                            .Include(j => j.JobDescription).ThenInclude(c => c.Company)
                            .Include(j => j.JobDescription).ThenInclude(c => c.Category)
                            .Include(j => j.JobDescription).ThenInclude(c => c.Recuirter)
                            .Include(j => j.JobDescription).ThenInclude(e => e.EmploymentType)
                            .Where(x => x.JobDescription.RecuirterId == recruiterId && x.JobDescriptionId == jobDescriptionId && x.IsMatched && x.IsReject == false && !x.IsApplied).OrderByDescending(x => x.PercentMatching).ToList();
            var rs = cVMatchings.Concat(cVMatchings2).ToList();
            return rs;
        }

        public List<CVMatching> GetAllByIsMatchedByNumberRequirement(int recruiterId, int jobDescriptionId)
        {
            List<CVMatching> cVMatchings = _context.CVMatchings.Include(c => c.Candidate)
                .Include(p => p.Level).Include(g => g.Gender)
                .Include(j => j.JobDescription).ThenInclude(c => c.Company)
                .Include(j => j.JobDescription).ThenInclude(c => c.Category)
                .Include(j => j.JobDescription).ThenInclude(c => c.Recuirter)
                .Include(j => j.JobDescription).ThenInclude(e => e.EmploymentType)
                .Where(x => x.JobDescription.RecuirterId == recruiterId && x.JobDescriptionId == jobDescriptionId && x.IsMatched && x.IsReject == false && x.IsMatched).OrderByDescending(x => x.IsApplied).ThenByDescending(x => x.PercentMatching).ToList();
            return cVMatchings;
        }

        public List<CVMatching> GetAllByIsSelected(int recruiterId, int jobDescriptionId)
        {
            List<CVMatching> cVMatchings = _context.CVMatchings.Include(c => c.Candidate)
                .Include(p => p.Level).Include(g => g.Gender)
                .Include(j => j.JobDescription).ThenInclude(c => c.Company)
                .Include(j => j.JobDescription).ThenInclude(c => c.Category)
                .Include(j => j.JobDescription).ThenInclude(c => c.Recuirter)
                .Include(j => j.JobDescription).ThenInclude(e => e.EmploymentType)
                .Where(x => x.JobDescription.RecuirterId == recruiterId && x.JobDescriptionId == jobDescriptionId && x.IsSelected && x.IsReject == false).OrderByDescending(x => x.PercentMatching).ToList();
            return cVMatchings;
        }

        public List<CVMatching> GetAllByRecruiterIdAndJobDescriptionIdAndFromDataAndToDate(int recruiterId, int? jobDescriptionId, DateTime? fromDate, DateTime? toDate)
        {
            List<CVMatching> cVApplies = _context.CVMatchings.Include(c => c.Candidate).Include(p => p.Level)
                .Include(j => j.JobDescription).ThenInclude(c => c.Company)
                .Include(j => j.JobDescription).ThenInclude(c => c.Category)
                .Include(j => j.JobDescription).ThenInclude(c => c.Recuirter)
                .Include(j => j.JobDescription).ThenInclude(e => e.EmploymentType)
                .Where(x => x.JobDescription.RecuirterId == recruiterId).ToList();
            if (jobDescriptionId != null) cVApplies = cVApplies.Where(x => x.JobDescriptionId == jobDescriptionId).ToList();
            if (fromDate != null) cVApplies = cVApplies.Where(x => x.ApplyDate >= fromDate).ToList();
            if (toDate != null) cVApplies = cVApplies.Where(x => x.ApplyDate <= toDate).ToList();
            return cVApplies;
        }

        public CVMatching GetByCandidateIdAndCVAppliedId(int candidateId, int CVAppliedId)
        {
            CVMatching cVApply = _context.CVMatchings.Include(c => c.Candidate)
                .Include(p => p.Level).Include(g => g.Gender)
                .Include(j => j.JobDescription).ThenInclude(c => c.Company)
                .Include(j => j.JobDescription).ThenInclude(c => c.Category)
                .Include(j => j.JobDescription).ThenInclude(e => e.EmploymentType).FirstOrDefault(x => x.CandidateId == candidateId && x.Id == CVAppliedId && x.IsApplied == true);
            return cVApply;
        }

        public List<CVMatching> GetByCVIdAndJobDescriptionId(int CVId, int jobDescriptionId)
        {
            List<CVMatching> cVApplyList = _context.CVMatchings.Include(c => c.Candidate)
                .Include(p => p.Level).Include(g => g.Gender)
                .Include(j => j.JobDescription).ThenInclude(c => c.Company)
                .Include(j => j.JobDescription).ThenInclude(c => c.Category)
                .Include(j => j.JobDescription).ThenInclude(c => c.Recuirter)
                .Include(j => j.JobDescription).ThenInclude(e => e.EmploymentType).Where(x => x.CurriculumVitaeId == CVId && x.JobDescriptionId == jobDescriptionId && x.IsReject == false).ToList();
            return cVApplyList != null ? cVApplyList : null;
        }

        public bool HasApplication(int candidateId, int jobDescriptionId) =>
            _context.CVMatchings.Any(x => x.CandidateId == candidateId
                && x.JobDescriptionId == jobDescriptionId && x.IsApplied);

        public CVMatching GetById(int id)
        {
            throw new NotImplementedException();
        }

        public CVMatching GetByRecruiterIdAndCVAppliedId(int recruiterId, int jobDescriptionId, int CVMatchingId)
        {
            CVMatching cVApply = _context.CVMatchings.Include(c => c.Candidate)
                .Include(p => p.Level).Include(g => g.Gender)
                .Include(j => j.JobDescription).ThenInclude(c => c.Company)
                .Include(j => j.JobDescription).ThenInclude(c => c.Category)
                .Include(j => j.JobDescription).ThenInclude(c => c.Recuirter)
                .Include(j => j.JobDescription).ThenInclude(e => e.EmploymentType).FirstOrDefault(x => x.JobDescription.RecuirterId == recruiterId && x.Id == CVMatchingId && x.JobDescriptionId == jobDescriptionId && x.IsReject == false);
            return cVApply;
        }

        public int Update(CVMatching data)
        {
            _context.Update(data);
            return _context.SaveChanges();
        }

        public int UpdateSelectedStatus(int recruiterId, int jobDescriptionId, int CVMatchingId)
        {
            CVMatching cVApply = _context.CVMatchings.Include(c => c.Candidate)
                .Include(p => p.Level).Include(g => g.Gender)
                .Include(j => j.JobDescription).ThenInclude(c => c.Company)
                .Include(j => j.JobDescription).ThenInclude(c => c.Category)
                .Include(j => j.JobDescription).ThenInclude(c => c.Recuirter)
                .Include(j => j.JobDescription).ThenInclude(e => e.EmploymentType)
                .FirstOrDefault(x => x.JobDescription.RecuirterId == recruiterId && x.Id == CVMatchingId && x.JobDescriptionId == jobDescriptionId && x.IsReject == false);
            if (cVApply != null)
            {
                if (cVApply.IsSelected) cVApply.IsSelected = false;
                else cVApply.IsSelected = true;
                return _context.SaveChanges();
            }
            return 0;
        }
        public int UpdateRejectedStatus(int recruiterId, int jobDescriptionId, int CVMatchingId)
        {
            CVMatching cVApply = _context.CVMatchings.Include(c => c.Candidate)
                .Include(p => p.Level).Include(g => g.Gender)
                .Include(j => j.JobDescription).ThenInclude(c => c.Company)
                .Include(j => j.JobDescription).ThenInclude(c => c.Category)
                .Include(j => j.JobDescription).ThenInclude(c => c.Recuirter)
                .Include(j => j.JobDescription).ThenInclude(e => e.EmploymentType)
                .FirstOrDefault(x => x.JobDescription.RecuirterId == recruiterId && x.Id == CVMatchingId && x.JobDescriptionId == jobDescriptionId && x.IsReject == false);
            if (cVApply != null)
            {
                cVApply.IsReject = true;
                cVApply.IsSelected = false;
                return _context.SaveChanges();
            }
            return 0;
        }
    }
}
