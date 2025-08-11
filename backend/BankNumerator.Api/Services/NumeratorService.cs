using BankNumerator.Api.Data;
using BankNumerator.Api.Models;
using BankNumerator.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BankNumerator.Api.Services
{
    public class NumeratorService : INumeratorService
    {
        private readonly BankNumeratorContext _ctx;

        public NumeratorService(BankNumeratorContext ctx)
        {
            _ctx = ctx;
        }

        public async Task ClearCountersAsync()
        {
            _ctx.Counters.RemoveRange(_ctx.Counters);
            await _ctx.SaveChangesAsync();
        }

      public async Task<object> GetNextAsync(string service, int userId)
{
    var svc = await _ctx.Services
        .AsNoTracking()
        .FirstOrDefaultAsync(s => s.Key == service);
    if (svc == null || !svc.IsActive)
        throw new InvalidOperationException("Service not found or inactive");

    await using var tx = await _ctx.Database.BeginTransactionAsync();

    var counter = await _ctx.Counters.FirstOrDefaultAsync(c => c.ServiceKey == service);
    if (counter == null)
    {
        counter = new ServiceCounter { ServiceKey = service, CurrentNumber = 0 };
        _ctx.Counters.Add(counter);
        await _ctx.SaveChangesAsync();
    }

    if (counter.CurrentNumber >= svc.MaxNumber)
        throw new InvalidOperationException("This service reached the maximum number.");

    counter.CurrentNumber++;
    _ctx.Counters.Update(counter);

    var ticket = new Ticket
    {
        Number       = counter.CurrentNumber,
        ServiceKey   = svc.Key,
        ServiceLabel = svc.Label,
        TakenAt      = DateTime.UtcNow,
        UserId       = userId
    };
    _ctx.Tickets.Add(ticket);
    await _ctx.SaveChangesAsync();

    // ---- agent seçimi + assignment (değişken olarak TUT) ----
    var assignedAgentId = await _ctx.AgentSkills
        .Where(sk => sk.ServiceKey == service)
        .Select(sk => sk.AgentId)
        .FirstOrDefaultAsync();

    if (assignedAgentId == 0)
        assignedAgentId = await _ctx.Agents.Select(a => a.Id).FirstOrDefaultAsync();

    TicketAssignment? assignment = null;
    if (assignedAgentId != 0)
    {
        assignment = new TicketAssignment
        {
            TicketId   = ticket.Id,
            AgentId    = assignedAgentId,
            AssignedAt = DateTime.UtcNow,
            Status     = "Pending"
        };
        _ctx.TicketAssignments.Add(assignment);
        await _ctx.SaveChangesAsync();
    }

    await tx.CommitAsync();

    var username = (await _ctx.Users.FindAsync(userId))?.Username ?? "";

    return new
    {
        number       = ticket.Number,
        serviceKey   = ticket.ServiceKey,
        serviceLabel = ticket.ServiceLabel,
        takenAt      = ticket.TakenAt,
        userId       = ticket.UserId,
        username,
        assignedAgentId,
        assignedAt       = assignment?.AssignedAt,
        assignmentStatus = assignment?.Status
    };
}


        public async Task<bool> CancelTicketAsync(string serviceKey, int number, int userId)
        {
            var ticket = await _ctx.Tickets
                .SingleOrDefaultAsync(t =>
                    t.ServiceKey == serviceKey &&
                    t.Number == number &&
                    t.UserId == userId);

            if (ticket == null)
                return false;

            var counter = await _ctx.Counters
                .SingleOrDefaultAsync(c => c.ServiceKey == serviceKey);
            if (counter != null && counter.CurrentNumber > 0)
            {
                counter.CurrentNumber--;
                _ctx.Counters.Update(counter);
            }

            _ctx.Tickets.Remove(ticket);
            await _ctx.SaveChangesAsync();

            return true;
        }
    }
}
