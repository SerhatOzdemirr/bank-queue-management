using BankNumerator.Api.Data;
using BankNumerator.Api.Models;
using BankNumerator.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BankNumerator.Api.Services;

public sealed class AdminService : IAdminService
{
    private readonly BankNumeratorContext _ctx;

    public AdminService(BankNumeratorContext ctx) => _ctx = ctx;

    // SERVICES ----------------------------

    public async Task<IReadOnlyList<ServiceDto>> GetServicesAsync(CancellationToken ct = default)
    {
        var list = await _ctx.Services
            .AsNoTracking()
            .OrderByDescending(s => s.Priority)     // NEW: yüksek öncelik önce
            .ThenBy(s => s.Label)
            .Select(s => new ServiceDto
            {
                Id = s.Id,
                ServiceKey = s.Key,
                Label = s.Label,
                IsActive = s.IsActive,
                MaxNumber = s.MaxNumber,
                Priority = s.Priority,              // NEW
                CurrentNumber = _ctx.Counters
                    .Where(c => c.ServiceKey == s.Key)
                    .Select(c => c.CurrentNumber)
                    .FirstOrDefault()
            })
            .ToListAsync(ct);

        return list;
    }
  public async Task<ServiceDto> AddServiceAsync(ServiceDto dto, CancellationToken ct = default)
{
    if (string.IsNullOrWhiteSpace(dto.ServiceKey) || string.IsNullOrWhiteSpace(dto.Label))
        throw new ArgumentException("Key and Label are required");

    if (dto.Priority < 1 || dto.Priority > 5)
        throw new ArgumentOutOfRangeException(nameof(dto.Priority), "Priority must be 1..5");

    var entity = new ServiceItem
    {
        Key = dto.ServiceKey.Trim(),
        Label = dto.Label.Trim(),
        IsActive = dto.IsActive,
        MaxNumber = dto.MaxNumber,
        Priority = dto.Priority                 // NEW
    };

    _ctx.Services.Add(entity);
    await _ctx.SaveChangesAsync(ct);

    return new ServiceDto
    {
        Id = entity.Id,
        ServiceKey = entity.Key,
        Label = entity.Label,
        IsActive = entity.IsActive,
        MaxNumber = entity.MaxNumber,
        Priority = entity.Priority,             // NEW
        CurrentNumber = 0
    };
}

    public async Task UpdateServiceAsync(int id, ServiceDto dto, CancellationToken ct = default)
    {
        var service = await _ctx.Services.FindAsync([id], ct);
        if (service is null) throw new KeyNotFoundException("Service not found.");

        if (dto.Priority is < 1 or > 5)
            throw new ArgumentOutOfRangeException(nameof(dto.Priority), "Priority must be 1..5");

        service.Key = dto.ServiceKey?.Trim() ?? service.Key;
        service.Label = dto.Label?.Trim() ?? service.Label;
        service.IsActive = dto.IsActive;
        service.MaxNumber = dto.MaxNumber;
        service.Priority = dto.Priority;           // NEW

        await _ctx.SaveChangesAsync(ct);
    }    
public async Task DeleteServiceAsync(int id, CancellationToken ct = default)
    {
        var service = await _ctx.Services.FindAsync([id], ct);
        if (service is null) throw new KeyNotFoundException("Service not found.");

        _ctx.Services.Remove(service);
        await _ctx.SaveChangesAsync(ct);
    }

    // TICKETS -----------------------------

    public async Task<IReadOnlyList<TicketDto>> GetAllTicketsAsync(string? serviceKey, CancellationToken ct = default)
    {
        var query = _ctx.Tickets.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(serviceKey))
            query = query.Where(t => t.ServiceKey == serviceKey);

        var tickets = await query
            .OrderByDescending(t => t.TakenAt)
            .Select(t => new TicketDto
            {
                Number = t.Number,
                ServiceKey = t.ServiceKey,
                ServiceLabel = t.ServiceLabel,
                TakenAt = t.TakenAt,
                UserId = t.UserId,
                Username = t.User.Username
            })
            .ToListAsync(ct);

        return tickets;
    }

    public async Task CancelTicketByCompositeAsync(string serviceKey, int number, CancellationToken ct = default)
    {
        var skey = serviceKey.Trim();

        // En son oluşturulmuş eşleşen bileti hedefle
        var ticket = await _ctx.Tickets
            .Where(t => t.ServiceKey == skey && t.Number == number)
            .OrderByDescending(t => t.Id)
            .FirstOrDefaultAsync(ct);

        if (ticket is null) throw new KeyNotFoundException("Ticket not found.");

        // İlişkili assignment’ları sil (EF Core 8 ExecuteDelete)
        await _ctx.TicketAssignments
            .Where(a => a.TicketId == ticket.Id)
            .ExecuteDeleteAsync(ct);

        await _ctx.Tickets
            .Where(t => t.Id == ticket.Id)
            .ExecuteDeleteAsync(ct);
    }

    public async Task<IReadOnlyList<UserSummaryDto>> GetAllUsers(CancellationToken ct = default)
    {
        var userList = await _ctx.Users.AsNoTracking()
        .Select(u => new UserSummaryDto(u.Id, u.Username, u.Email, u.PriorityScore))
        .ToListAsync(ct);
        return userList;
    }
    public async Task UpdateUserPriorityAsync(int userId, int score, CancellationToken ct = default)
    {
        if (score < 1 || score > 5)
            throw new ArgumentOutOfRangeException(nameof(score), "Priority score must be between 1 and 5");

        var user = await _ctx.Users.FindAsync(new object[] { userId }, ct);
        if (user == null)
            throw new KeyNotFoundException("User not found");

        user.PriorityScore = score;
        await _ctx.SaveChangesAsync(ct);
    }
}
