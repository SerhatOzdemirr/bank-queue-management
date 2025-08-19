using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using BankNumerator.Api.Contracts;
using BankNumerator.Api.Data;
using BankNumerator.Api.Models;
using Microsoft.AspNetCore.Mvc;
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
                user.AvatarUrl
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

        public async Task<string?> UpdateAvatarAsync(int userId, IFormFile file, CancellationToken ct = default)
        {
            if (file == null || file.Length == 0) return null;

            var allowed = new[] { "image/jpeg", "image/png", "image/webp" };
            if (!allowed.Contains(file.ContentType))
            {
                throw new InvalidOperationException("Unsupport image type");
            }
            // 2MB limit
            if (file.Length > 2 * 1024 * 1024)
            {
                throw new InvalidOperationException("File too large");
            }

            var user = await _ctx.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);
            if (user == null) return null;

            var ext = Path.GetExtension(file.FileName);
            if (string.IsNullOrWhiteSpace(ext))
            {
                ext = file.ContentType switch
                {
                    "image/jpeg" => ".jpg",
                    "image/png" => ".png",
                    "image/webp" => ".webp",
                    _ => ".bin"
                };
            }

            var uploads = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "avatars");
            Directory.CreateDirectory(uploads);

            var safeExt = Regex.Replace(ext.ToLowerInvariant(), @"[^a-z0-9\.]", "");
            var fileName = $"{userId}_{DateTime.UtcNow:yyyyMMddHHmmssfff}{safeExt}";
            var fullPath = Path.Combine(uploads, fileName);

            if (!string.IsNullOrWhiteSpace(user.AvatarUrl) &&
            user.AvatarUrl.StartsWith("/avatars/", StringComparison.OrdinalIgnoreCase))
            {
                var old = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot",
                    user.AvatarUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
                if (System.IO.File.Exists(old)) System.IO.File.Delete(old);
            }

            await using (var fs = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(fs, ct);
            }

            user.AvatarUrl = $"/avatars/{fileName}";
            await _ctx.SaveChangesAsync(ct);

            return user.AvatarUrl; 
                    
            }
    }
}
