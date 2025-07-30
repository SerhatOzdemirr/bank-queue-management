namespace BankNumerator.Api.Models
{
    public class Ticket
    {
        public int Number { get; set; }
        public required string ServiceKey { get; set; }
        public required string ServiceLabel { get; set; }
        public DateTime TakenAt { get; set; }
    }
}
