// Controllers/AgentTicketsController.cs
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using BankNumerator.Api.Data;
using BankNumerator.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BankNumerator.Api.Controllers
{
    [ApiController]
    [Route("api/agent/tickets")]
    [Authorize(Roles = "Agent")]
    public class AgentTicketsController : ControllerBase
    {
        private readonly BankNumeratorContext _ctx;

        public AgentTicketsController(BankNumeratorContext ctx)
        {
            _ctx = ctx;
        }

        // Token’dan AgentId’yi bulur
        private async Task<int?> GetCurrentAgentIdAsync()
        {
            var uid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(uid, out var userId))
                return null;
            var agent = await _ctx.Agents
                .AsNoTracking()
                .SingleOrDefaultAsync(a => a.UserId == userId);
            return agent?.Id;
        }

       // Controllers/AgentTicketsController.cs
[HttpGet]
public async Task<IActionResult> GetMyTickets()
{
    var agentId = await GetCurrentAgentIdAsync();
    if (agentId == null) 
        return Unauthorized();

    var list = await _ctx.TicketAssignments
        .Where(ta => ta.AgentId == agentId && ta.Status == "Pending")
        // Ticket ve User ile join
        .Join(_ctx.Tickets,
              ta => ta.TicketId,
              t  => t.Id,
              (ta, t) => new { ta, t })
        .Join(_ctx.Users,
              tt => tt.t.UserId,
              u  => u.Id,
              (tt, u) => new { tt.ta, tt.t, u })
        // Öncelik puanına göre azalan sıralama
        .OrderByDescending(x => x.u.PriorityScore)
        .ThenBy(x => x.ta.AssignedAt) // eşit puan varsa atandığı zamana göre
        .Select(x => new
        {
            ticketId = x.t.Id,
            number = x.t.Number,
            serviceKey = x.t.ServiceKey,
            serviceLabel = x.t.ServiceLabel,
            takenAt = x.t.TakenAt,
            assignedAt = x.ta.AssignedAt,
            status = x.ta.Status,
            priority = x.u.PriorityScore,   // yeni alan
            username = x.u.Username
        })
        .ToListAsync();

    return Ok(list);
}


        /// <summary> 2) Kabul et → Status = "Accepted" </summary>
        [HttpPost("{ticketId}/accept")]
        public async Task<IActionResult> Accept(int ticketId)
        {
            var agentId = await GetCurrentAgentIdAsync();
            if (agentId == null) return Unauthorized();

            var assignment = await _ctx.TicketAssignments
                .SingleOrDefaultAsync(t =>
                    t.TicketId == ticketId &&
                    t.AgentId  == agentId.Value);
            if (assignment == null)
                return NotFound("Assignment not found");

            assignment.Status = "Accepted";
            await _ctx.SaveChangesAsync();
            return NoContent();
        }

        /// <summary>
        /// 3) Reddet → mevcut Assignment silinir, fallback agent’a yeniden atama yapılır
        /// </summary>
        [HttpPost("{ticketId}/reject")]
        public async Task<IActionResult> Reject(int ticketId)
        {
            var agentId = await GetCurrentAgentIdAsync();
            if (agentId == null) return Unauthorized();

            // 1) Mevcut assignment’ı al
            var assignment = await _ctx.TicketAssignments
                .SingleOrDefaultAsync(t =>
                    t.TicketId == ticketId &&
                    t.AgentId  == agentId.Value);
            if (assignment == null)
                return NotFound("Assignment not found");

            // 2) Ticket’ın serviceKey’ini oku
            var ticket = await _ctx.Tickets
                .AsNoTracking()
                .SingleOrDefaultAsync(t => t.Id == ticketId);
            if (ticket == null)
                return NotFound("Ticket not found");

            // 3) Mevcut assignment’ı sil
            _ctx.TicketAssignments.Remove(assignment);
            await _ctx.SaveChangesAsync();

            // 4) Yeni atamayı yap
            //    Bu servise skill’i olan agent’ları bul
            var skilled = await _ctx.AgentSkills
                .Where(s => s.ServiceKey == ticket.ServiceKey)
                .Select(s => s.AgentId)
                .ToListAsync();

            int newAgentId = skilled.Any()
                ? skilled.First()
                : await _ctx.Agents.Select(a => a.Id).FirstAsync();

            var newAssignment = new TicketAssignment
            {
                TicketId   = ticketId,
                AgentId    = newAgentId,
                AssignedAt = DateTime.UtcNow,
                Status     = "Pending"
            };
            _ctx.TicketAssignments.Add(newAssignment);
            await _ctx.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// 4) Release → assignment’ı sil, ticket açık kalır (başka işlem yapılmaz)
        /// </summary>
        [HttpPost("{ticketId}/release")]
        public async Task<IActionResult> Release(int ticketId)
        {
            var agentId = await GetCurrentAgentIdAsync();
            if (agentId == null) return Unauthorized();

            var assignment = await _ctx.TicketAssignments
                .SingleOrDefaultAsync(t =>
                    t.TicketId == ticketId &&
                    t.AgentId  == agentId.Value);
            if (assignment == null)
                return NotFound("Assignment not found");

            _ctx.TicketAssignments.Remove(assignment);
            await _ctx.SaveChangesAsync();
            return NoContent();
        }
    }
}
