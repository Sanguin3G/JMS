using APIServer.Models.Entity;
using System.ComponentModel.DataAnnotations;

namespace APIServer.DTO.EntityDTO
{
    public class CompanyDTO
    {
        public int CompanyId { get; set; }
        [StringLength(200)]
        public string? CompanyName { get; set; }
        [StringLength(100)]
        public string? Email { get; set; }
        [StringLength(10)]
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? Description { get; set; }
        public string? DateCreatedDisplay { get; set; }
        public string? Tax { get; set; }
        public int? YearOfEstablishment { get; set; }
        public string? WebURL { get; set; }
        public string? CategoryName { get; set; }
        public List<EmployeeDTO>? RecuirtersInCompany { get; set; }
        public List<JobDTO>? JDs { get; set; }
        public string? BackGroundURL { get; set; }
        public string? AvatarURL { get; set; }
        public string? RecuirterFounder { get; set; }
        public string? Size { get; set; }
        public bool IsDelete { get; set; }
    }
}
