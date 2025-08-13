using BankNumerator.Api.Data;
using BankNumerator.Api.Models;
using BankNumerator.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BankNumerator.Api.Services;

public sealed class AdminAgentActivityService : IAdminAgentActivityService
{
    private readonly BankNumeratorContext _ctx;
    public AdminAgentActivityService(BankNumeratorContext ctx) => _ctx = ctx;

    public async Task<IReadOnlyList<AgentActivitySummaryDto>> GetAgentActivityAsync(
        string range = "7d", int topPerAgent = 20, CancellationToken ct = default)
    {
        var startUtc = CalcStartUtc(range);

        var rows = await (from a in _ctx.TicketAssignments.AsNoTracking()
                          where a.AssignedAt >= startUtc
                          join ag in _ctx.Agents.AsNoTracking() on a.AgentId equals ag.Id
                          join u in _ctx.Users.AsNoTracking() on ag.UserId equals u.Id
                          join t in _ctx.Tickets.AsNoTracking() on a.TicketId equals t.Id
                          select new
                          {
                              a.AgentId,
                              AgentName = u.Username,
                              a.Status,
                              a.AssignedAt,
                              TicketId = t.Id,
                              t.Number,
                              t.ServiceKey,
                              t.ServiceLabel
                          })
                         .ToListAsync(ct);

        var grouped = rows
            .GroupBy(r => new { r.AgentId, r.AgentName })
            .Select(g =>
            {
                var pending  = g.Count(x => x.Status == "Pending");
                var accepted = g.Count(x => x.Status == "Accepted");
                var rejected = g.Count(x => x.Status == "Rejected");
                var total    = g.Count();

                var recent = g.OrderByDescending(x => x.AssignedAt)
                              .Take(topPerAgent)
                              .Select(x => new TicketBriefDto(
                                  x.TicketId, x.Number, x.ServiceKey, x.ServiceLabel,
                                  x.AssignedAt, x.Status))
                              .ToList();

                return new AgentActivitySummaryDto(
                    g.Key.AgentId, g.Key.AgentName,
                    pending, accepted, rejected, total, recent);
            })
            .OrderByDescending(x => x.Total)
            .ToList();

        return grouped;
    }

    private static DateTime CalcStartUtc(string range)
    {
        var todayUtc = DateTime.UtcNow.Date;
        return range switch
        {
            "today" => todayUtc,
            "30d"   => todayUtc.AddDays(-29),
            _       => todayUtc.AddDays(-6), // 7d
        };
    }
}