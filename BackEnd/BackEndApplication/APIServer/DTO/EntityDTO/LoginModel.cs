using System.ComponentModel.DataAnnotations;

namespace APIServer.DTO.EntityDTO
{
    public class LoginModel
    {
        [Required, StringLength(100, MinimumLength = 3)]
        public string? username { get; set; }

        [Required, StringLength(200, MinimumLength = 6)]
        public string? password { get; set; }
    }
}
