namespace APIServer.DTO.EntityDTO
{
    public class CandidateDTO
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public bool IsMale { get; set; } = true;
        public string? PhoneNumber { get; set; }
        public DateTime DOB { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime LastUpdateDate { get; set; } = DateTime.Now;
        public bool IsActive { get; set; } = true;
        public bool IsDelete { get; set; } = false;
        public string? AvatarURL { get; set; }
    }
}
