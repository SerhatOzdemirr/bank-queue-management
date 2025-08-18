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
        public async Task<ProfileStatisticsDto?> GetProfileStatisticsAsync(int userId, CancellationToken ct = default)
        {
            var assignments = await _ctx.TicketAssignments
                .Where(ta => ta.Ticket.UserId == userId)
                .Include(ta => ta.Ticket)
                .ToListAsync(ct);
            var total = assignments.Count;
            var approved = assignments.Count(t => t.Status == "Accepted");
            var rejected = assignments.Count(t => t.Status == "Rejected");
            var pending = assignments.Count(t => t.Status == "Pending");

            var history = assignments
                .OrderByDescending(a => a.Ticket.TakenAt)
                .Select(a => new TicketHistoryDto(
                    a.Ticket.ServiceLabel,
                    a.Ticket.Number,
                    a.Status,
                    a.Ticket.TakenAt
                ))
                .Take(10)
                .ToList();
            return new ProfileStatisticsDto(total, approved, rejected, pending, history);
        }
        public async Task<IEnumerable<TicketHistoryDto>?> GetTicketHistoryAsync(int userId, CancellationToken ct = default)
        {
            var assignments = await _ctx.TicketAssignments
                .Where(ta => ta.Ticket.UserId == userId)
                .Include(ta => ta.Ticket)
                .OrderByDescending(ta => ta.Ticket.TakenAt)
                .Take(10)
                .ToListAsync(ct);

            return assignments.Select(a => new TicketHistoryDto(
                a.Ticket.ServiceLabel,
                a.Ticket.Number,
                a.Status,
                a.Ticket.TakenAt
            ));
        }

    }
}
