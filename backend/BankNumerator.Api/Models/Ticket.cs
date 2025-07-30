namespace BankNumerator.Api.Models
{
    public class Ticket
    {
        public int Number { get; set; }
        public required string ServiceKey { get; set; }
        public required string ServiceLabel { get; set; }
        public DateTime TakenAt { get; set; }
    }

     public class TicketDto
    {
        public string ServiceKey   { get; set; } = default!;
        public string ServiceLabel { get; set; } = default!;
        public int    Number       { get; set; }
        public DateTime TakenAt    { get; set; }
        // eğer status gerekirse: public string Status { get; set; }
    }
}
