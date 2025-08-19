using System.Threading;
using System.Threading.Tasks;

namespace BankNumerator.Api.Contracts
{
    public interface IProfileService
    {
        Task<ProfileDto?> GetProfileAsync(int userId, CancellationToken ct = default);
        Task<bool> UpdateProfileAsync(int userId, UpdateProfileDto dto, CancellationToken ct = default);
        Task<ProfileStatisticsDto?> GetProfileStatisticsAsync(int userId, CancellationToken ct = default);
        Task<IEnumerable<TicketHistoryDto>?> GetTicketHistoryAsync(int userId, CancellationToken ct = default);

        Task<string?> UpdateAvatarAsync(int userId, IFormFile file, CancellationToken ct = default);
    }
}
