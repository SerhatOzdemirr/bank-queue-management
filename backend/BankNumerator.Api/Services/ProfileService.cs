using System.Threading;
using System.Threading.Tasks;
using BankNumerator.Api.Contracts;
using BankNumerator.Api.Data;
using BankNumerator.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BankNumerator.Api.Services
{
    public class ProfileService : IProfileService
    {
        private readonly BankNumeratorContext _ctx;

        public ProfileService(BankNumeratorContext ctx)
        {
            _ctx = ctx;
        }

        public async Task<ProfileDto?> GetProfileAsync(int userId, CancellationToken ct = default)
        {
            var user = await _ctx.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId, ct);

            if (user == null)
                return null;

            return new ProfileDto(
                user.Id,
                user.Username,
                user.Email,
                user.PriorityScore,
                user.Role.ToString(),
                null // add later
            );
        }
      public async Task<bool> UpdateProfileAsync(int userId, UpdateProfileDto dto, CancellationToken ct = default)
        {
            var user = await _ctx.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);
            if (user == null) return false;

            user.Username = dto.Username;
            user.Email = dto.Email;

            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                using var hmac = new System.Security.Cryptography.HMACSHA512();
                user.PasswordSalt = hmac.Key;
                user.PasswordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(dto.Password));
            }

            await _ctx.SaveChangesAsync(ct);
            return true;
        }

    }
}
