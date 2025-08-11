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
        // Projection + AsNoTracking + tek round-trip
        var list = await _ctx.Services
            .AsNoTracking()
            .Select(s => new ServiceDto
            {
                Id            = s.Id,
                ServiceKey    = s.Key,
                Label         = s.Label,
                IsActive      = s.IsActive,
                MaxNumber     = s.MaxNumber,
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

        // Key tekillik kontrolü (varsa ekleyebilirsin)
        // if (await _ctx.Services.AnyAsync(s => s.Key == dto.ServiceKey, ct))
        //     throw new InvalidOperationException("Service key already exists.");

        var entity = new ServiceItem
        {
            Key       = dto.ServiceKey.Trim(),
            Label     = dto.Label.Trim(),
            IsActive  = dto.IsActive,
            MaxNumber = dto.MaxNumber
        };

        _ctx.Services.Add(entity);
        await _ctx.SaveChangesAsync(ct);

        // Yeni servis → CurrentNumber = 0
        return new ServiceDto
        {
            Id            = entity.Id,
            ServiceKey    = entity.Key,
            Label         = entity.Label,
            IsActive      = entity.IsActive,
            MaxNumber     = entity.MaxNumber,
            CurrentNumber = 0
        };
    }

    public async Task UpdateServiceAsync(int id, ServiceDto dto, CancellationToken ct = default)
    {
        var service = await _ctx.Services.FindAsync([id], ct);
        if (service is null) throw new KeyNotFoundException("Service not found.");

        service.Key       = dto.ServiceKey?.Trim() ?? service.Key;
        service.Label     = dto.Label?.Trim() ?? service.Label;
        service.IsActive  = dto.IsActive;
        service.MaxNumber = dto.MaxNumber;

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
                Number       = t.Number,
                ServiceKey   = t.ServiceKey,
                ServiceLabel = t.ServiceLabel,
                TakenAt      = t.TakenAt,
                UserId       = t.UserId,
                Username     = t.User.Username
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
}
