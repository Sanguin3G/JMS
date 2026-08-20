using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace APIServer.Models.Entity;

public sealed class AiProviderProfile
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required, StringLength(50)]
    public string Provider { get; set; } = "gemini";

    [Required, StringLength(100)]
    public string DisplayName { get; set; } = "Gemini development profile";

    [Required, StringLength(100)]
    public string ModelId { get; set; } = "gemini-3.5-flash-lite";

    [Required, StringLength(20)]
    public string ReasoningLevel { get; set; } = "minimal";

    [Required]
    public string EncryptedApiKey { get; set; } = string.Empty;

    public bool IsEnabled { get; set; } = true;
    public bool IsDefaultForMatching { get; set; }
    public bool IsEnabledForAssistant { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
