using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BankNumerator.Api.Models
{
    public class TicketAssignment
    {
        [Key, Column(Order = 0)]
        public int TicketId { get; set; }

        [Key, Column(Order = 1)]
        public int AgentId { get; set; }

        [ForeignKey(nameof(TicketId))]
        public Ticket Ticket { get; set; } = null!;

        [ForeignKey(nameof(AgentId))]
        public Agent Agent { get; set; } = null!;

        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(20)]
        public string Status { get; set; } = "Pending";
    }
}
