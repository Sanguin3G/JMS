using System.ComponentModel.DataAnnotations;
namespace APIServer.DTO.EntityDTO;
public sealed class RegisterRequest
{
    [Required, EmailAddress, StringLength(100)] public string Email { get; set; } = "";
    [Required, StringLength(35, MinimumLength = 8)] public string FullName { get; set; } = "";
    [Required, StringLength(35, MinimumLength = 6)] public string Username { get; set; } = "";
    [Required, StringLength(35, MinimumLength = 8)] public string Password { get; set; } = "";
    [Required, Compare(nameof(Password))] public string ConfirmPassword { get; set; } = "";
}
public sealed class ChangePasswordRequest
{
    [Required, StringLength(72)] public string OldPassword { get; set; } = "";
    [Required, StringLength(20, MinimumLength = 8)] public string NewPassword { get; set; } = "";
    [Required, Compare(nameof(NewPassword))] public string ConfirmPassword { get; set; } = "";
}
