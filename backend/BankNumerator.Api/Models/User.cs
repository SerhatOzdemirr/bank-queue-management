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
public record UserDto(
    string Username,
    string Email,
    string Password
);
public record LoginDto(
    string Email,
    string Password
);

public sealed record UserSummaryDto(
    int Id,
    string Username,
    string Email,
    int PriorityScore ,
    string Role 
);
public sealed record UpdatePriorityDto(
    int Score
);
public sealed record ProfileDto(
    int Id,
    string Username,
    string Email,
    int PriorityScore,
    string Role,
    string? AvatarUrl
);

public sealed record UpdateProfileDto(
    string Username,
    string Email,
    string? Password
);

public sealed record ProfileStatisticsDto(
    int TotalTickets,
    int Approved,
    int Rejected,
    int Pending,
    IEnumerable<TicketHistoryDto> History
);

public sealed record TicketHistoryDto(
    string Service,
    int Number,
    string Status,
    DateTime TakenAt
);