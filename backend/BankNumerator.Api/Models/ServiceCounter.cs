using System.ComponentModel.DataAnnotations;

namespace BankNumerator.Api.Models
{
    public class ServiceCounter
    {
        [Key]
        [MaxLength(100)]
        public string ServiceKey { get; set; } = null!;

        public int CurrentNumber { get; set; }
    }
}
