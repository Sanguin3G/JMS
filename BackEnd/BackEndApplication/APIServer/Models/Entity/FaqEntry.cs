using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace APIServer.Models.Entity;

public sealed class FaqEntry
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required, StringLength(200)]
    public string Question { get; set; } = string.Empty;

    [Required, StringLength(4000)]
    public string Answer { get; set; } = string.Empty;

    [StringLength(200)]
    public string? QuestionEn { get; set; }

    [StringLength(4000)]
    public string? AnswerEn { get; set; }

    [StringLength(500)]
    public string? Keywords { get; set; }

    [StringLength(80)]
    public string Category { get; set; } = "JMS basics";

    public bool IsPublished { get; set; } = true;
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
