// Models/User.cs
namespace BankNumerator.Api.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public byte[] PasswordHash { get; set; } = null!;
        public byte[] PasswordSalt { get; set; } = null!;
        public UserRole Role { get; set; } = UserRole.Default;

        public int PriorityScore { get; set; }

        public enum UserRole
        {
            Default = 0,
            Admin = 1,
            Agent = 2
        }
    }
}
public record UserDto(string Username, string Email, string Password);
public record LoginDto(string Email, string Password);

