namespace BankNumerator.Api.Models
{
    public class ServiceItem
    {
        public int Id { get; set; }
        public string Key { get; set; } = default!;
        public string Label { get; set; } = default!;
        public bool IsActive { get; set; } = true;
    }
        // dto
        public record ServiceDto(string Key, string Label);
}
