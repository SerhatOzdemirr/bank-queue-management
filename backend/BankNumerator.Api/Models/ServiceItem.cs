// Models/ServiceItem.cs
using System.Text.Json.Serialization;
namespace BankNumerator.Api.Models
{
    public class ServiceItem
    {
        public int Id { get; set; }
        public string Key { get; set; } = default!;
        public string Label { get; set; } = default!;
        public bool IsActive { get; set; } = true;

        public int Priority { get; set; } = 3;
        public int MaxNumber { get; set; } = 100;
    }

    public class ServiceDto
    {
        public int Id { get; set; }
        [JsonPropertyName("serviceKey")]
        public string ServiceKey { get; set; } = null!;
        public string Label { get; set; } = null!;
        public bool IsActive { get; set; }
        public int MaxNumber { get; set; }
        [JsonPropertyName("currentNumber")]
        public int CurrentNumber { get; set; }
        public int Priority { get; set; }
    }
}
