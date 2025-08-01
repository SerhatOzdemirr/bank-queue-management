// Models/ServiceItem.cs
namespace BankNumerator.Api.Models
{
    public class ServiceItem
    {
        public int    Id        { get; set; }
        public string Key       { get; set; } = default!;
        public string Label     { get; set; } = default!;
        public bool   IsActive  { get; set; } = true;

        public int    MaxNumber { get; set; } = 100;
    }

     public class ServiceDto
    {
        public int Id { get; set; }
        public string ServiceKey { get; set; } = null!;
        public string Label { get; set; } = null!;
        public bool IsActive { get; set; }
        public int MaxNumber { get; set; }
        public int CurrentNumber { get; set; }
    }
}
