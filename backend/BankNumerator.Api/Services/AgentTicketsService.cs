using BankNumerator.Api.Data;
using BankNumerator.Api.Models;
using BankNumerator.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BankNumerator.Api.Services;

public class AgentTicketsService : IAgentTicketsService
{
    private readonly BankNumeratorContext _ctx;

    public AgentTicketsService(BankNumeratorContext ctx)
    {
        _ctx = ctx;
    }

    public async Task<int?> GetCurrentAgentIdAsync(int userId)
    {
        var agent = await _ctx.Agents
            .AsNoTracking()
            .SingleOrDefaultAsync(a => a.UserId == userId);
        return agent?.Id;
    }

    public async Task<IEnumerable<object>> GetMyTicketsAsync(int agentId)
    {
        return await _ctx.TicketAssignments
            .Where(ta => ta.AgentId == agentId && ta.Status == "Pending")
            .Join(_ctx.Tickets,
                  ta => ta.TicketId,
                  t => t.Id,
                  (ta, t) => new { ta, t })
            .Join(_ctx.Users,
                  tt => tt.t.UserId,
                  u => u.Id,
                  (tt, u) => new { tt.ta, tt.t, u })
            .OrderByDescending(x => x.u.PriorityScore)
            .ThenBy(x => x.ta.AssignedAt)
            .Select(x => new
            {
                ticketId = x.t.Id,
                number = x.t.Number,
                serviceKey = x.t.ServiceKey,
                serviceLabel = x.t.ServiceLabel,
                takenAt = x.t.TakenAt,
                assignedAt = x.ta.AssignedAt,
                status = x.ta.Status,
                priority = x.u.PriorityScore,
                username = x.u.Username
            })
            .ToListAsync();
    }

    public async Task AcceptAsync(int agentId, int ticketId)
    {
        var assignment = await _ctx.TicketAssignments
            .SingleOrDefaultAsync(t => t.TicketId == ticketId && t.AgentId == agentId);
        if (assignment == null) throw new KeyNotFoundException();
        assignment.Status = "Accepted";

        
        var ticket = await _ctx.Tickets
            .AsNoTracking()
            .SingleOrDefaultAsync(t => t.Id == ticketId);
        if (ticket == null) throw new KeyNotFoundException();

        var serviceKey = ticket.ServiceKey;
        var counter = await _ctx.Counters
            .SingleOrDefaultAsync(c => c.ServiceKey == serviceKey);
        if (counter != null && counter.CurrentNumber > 0)
        {
            counter.CurrentNumber--;
            _ctx.Counters.Update(counter);
        }
        await _ctx.SaveChangesAsync();
    }

    public async Task RejectAsync(int agentId, int ticketId)
    {
        var assignment = await _ctx.TicketAssignments
            .SingleOrDefaultAsync(t => t.TicketId == ticketId && t.AgentId == agentId);
        if (assignment == null) throw new KeyNotFoundException();

        var ticket = await _ctx.Tickets
            .AsNoTracking()
            .SingleOrDefaultAsync(t => t.Id == ticketId);
        if (ticket == null) throw new KeyNotFoundException();

        _ctx.TicketAssignments.Remove(assignment);
        await _ctx.SaveChangesAsync();

        var skilled = await _ctx.AgentSkills
            .Where(s => s.ServiceKey == ticket.ServiceKey)
            .Select(s => s.AgentId)
            .ToListAsync();

        int newAgentId = skilled.Any()
            ? skilled.First()
            : await _ctx.Agents.Select(a => a.Id).FirstAsync();

        var newAssignment = new TicketAssignment
        {
            TicketId = ticketId,
            AgentId = newAgentId,
            AssignedAt = DateTime.UtcNow,
            Status = "Pending"
        };
        _ctx.TicketAssignments.Add(newAssignment);

        var serviceKey = ticket.ServiceKey;
        var counter = await _ctx.Counters
            .SingleOrDefaultAsync(c => c.ServiceKey == serviceKey);
        if (counter != null && counter.CurrentNumber > 0)
        {
            counter.CurrentNumber--;
            _ctx.Counters.Update(counter);
        }
        await _ctx.SaveChangesAsync();
    }

    public async Task ReleaseAsync(int agentId, int ticketId)
    {
        var assignment = await _ctx.TicketAssignments
            .SingleOrDefaultAsync(t => t.TicketId == ticketId && t.AgentId == agentId);
        if (assignment == null) throw new KeyNotFoundException();

        var ticket = await _ctx.Tickets
            .SingleOrDefaultAsync(t => t.Id == ticketId);
        if (ticket == null) throw new KeyNotFoundException();

        var serviceKey = ticket.ServiceKey;

        _ctx.TicketAssignments.Remove(assignment);
        _ctx.Tickets.Remove(ticket);

        var counter = await _ctx.Counters
            .SingleOrDefaultAsync(c => c.ServiceKey == serviceKey);
        if (counter != null && counter.CurrentNumber > 0)
        {
            counter.CurrentNumber--;
            _ctx.Counters.Update(counter);
        }
        await _ctx.SaveChangesAsync();
    }

    public async Task RouteAsync(int currentAgentId, int ticketId, int toAgentId)
    {
        if (toAgentId == currentAgentId)
            throw new InvalidOperationException("Cannot route to yourself");

        var assignment = await _ctx.TicketAssignments
            .SingleOrDefaultAsync(t => t.TicketId == ticketId && t.AgentId == currentAgentId);
        if (assignment == null) throw new KeyNotFoundException();

        var ticket = await _ctx.Tickets
            .AsNoTracking()
            .SingleOrDefaultAsync(t => t.Id == ticketId);
        if (ticket == null) throw new KeyNotFoundException();

        var hasSkill = await _ctx.AgentSkills
            .AnyAsync(s => s.AgentId == toAgentId && s.ServiceKey == ticket.ServiceKey);
        if (!hasSkill)
            throw new InvalidOperationException("Agent does not have the required skill");

        _ctx.TicketAssignments.Remove(assignment);
        var newAssignment = new TicketAssignment
        {
            TicketId = ticketId,
            AgentId = toAgentId,
            AssignedAt = DateTime.UtcNow,
            Status = "Pending"
        };
        _ctx.TicketAssignments.Add(newAssignment);
        await _ctx.SaveChangesAsync();
    }

    public async Task<IEnumerable<object>> GetRouteCandidatesAsync(int agentId, string serviceKey)
    {
        return await _ctx.AgentSkills
            .Where(s => s.ServiceKey == serviceKey)
            .Join(_ctx.Agents,
                s => s.AgentId,
                a => a.Id,
                (s, a) => new { a.Id, a.UserId })
            .Join(_ctx.Users,
                x => x.UserId,
                u => u.Id,
                (x, u) => new { AgentId = x.Id, Username = u.Username })
            .Distinct()
            .ToListAsync();
    }
}
