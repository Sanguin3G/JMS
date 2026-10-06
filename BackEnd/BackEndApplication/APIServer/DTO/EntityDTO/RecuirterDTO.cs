using APIServer.Models.Entity;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace APIServer.DTO.EntityDTO
{
    public class RecuirterDTO
    {
        public int Id { get; set; }
        [StringLength(100)]
        public string FullName { get; set; }
        [StringLength(100)]
        public string UserName { get; set; }
        [StringLength(100)]
        public string Email { get; set; }
        public string? GenderTitle { get; set; }
        [StringLength(10)]
        public string PhoneNumber { get; set; }
        public string? DOB_Display { get; set; }
        public string? CreatedDateDisplay { get; set; }
        public string? LastUpdateDisplay { get; set; }
        public string? Description { get; set; }
        public int? CreatedBy { get; set; }
        public int? RoleTitle { get; set; }
        public string? AvatarURL { get; set; }
        public int? CompanyId { get; set; }
        public string? CompanyName { get; set; }
        public bool IsActive { get; set; }
        public bool IsDelete { get; set; }
    }
}
