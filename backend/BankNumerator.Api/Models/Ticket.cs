using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
  namespace BankNumerator.Api.Models
{
    public class Ticket
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int    Id           { get; set; }    // ← Şimdi PK ve identity

        public int      Number       { get; set; }
        public string   ServiceKey   { get; set; } = default!;
        public string   ServiceLabel { get; set; } = default!;
        public DateTime TakenAt      { get; set; }

        public int    UserId       { get; set; }
        public User   User         { get; set; } = null!;
    }
}
// Models/TicketDto.cs
namespace BankNumerator.Api.Models
{
 public class TicketDto
    {
        // Orijinal ticket bilgileri
        public int      Number            { get; set; }
        public string   ServiceKey        { get; set; } = default!;
        public string   ServiceLabel      { get; set; } = default!;
        public DateTime TakenAt           { get; set; }

        // Bilet sahibinin bilgisi
        public int      UserId            { get; set; }
        public string   Username          { get; set; } = default!;

        // Agent ataması bilgisi
        public int?     AssignedAgentId   { get; set; }
        public DateTime? AssignedAt       { get; set; }
        public string?  AssignmentStatus  { get; set; }
    }
}
