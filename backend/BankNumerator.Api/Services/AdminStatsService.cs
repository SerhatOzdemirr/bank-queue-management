using BankNumerator.Api.Data;
using BankNumerator.Api.Models;
using BankNumerator.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BankNumerator.Api.Services;

public sealed class AdminStatsService : IAdminStatsService
{
    private readonly BankNumeratorContext _ctx;
    public AdminStatsService(BankNumeratorContext ctx) => _ctx = ctx;

    public async Task<IReadOnlyList<ServiceCountItem>> GetTicketsByServiceAsync(
        string range = "7d",
        CancellationToken ct = default)
    {
        var startUtc = CalcStartUtc(range);

        // EF’in rahat çevirdiği şekil: anonim tipe projekte → ToListAsync → DTO’ya map
        var rows = await _ctx.Tickets
            .AsNoTracking()
            .Where(t => t.TakenAt >= startUtc)
            .GroupBy(t => new { t.ServiceKey, t.ServiceLabel })
            .Select(g => new { g.Key.ServiceLabel, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .ToListAsync(ct);

        return rows
            .Select(x => new ServiceCountItem(x.ServiceLabel, x.Count))
            .ToList();
    }

    private static DateTime CalcStartUtc(string range)
    {
        var todayUtc = DateTime.UtcNow.Date;
        return range switch
        {
            "today" => todayUtc,
            "30d"   => todayUtc.AddDays(-29),
            _       => todayUtc.AddDays(-6) // 7d (bugün dahil)
        };
    }
}
