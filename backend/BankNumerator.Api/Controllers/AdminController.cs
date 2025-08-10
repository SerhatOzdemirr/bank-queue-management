using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BankNumerator.Api.Data;
using BankNumerator.Api.Models;
using Microsoft.AspNetCore.Authorization;
using System.Linq; // OrderByDescending için gerekli

namespace BankNumerator.Api.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly BankNumeratorContext _ctx;

        public AdminController(BankNumeratorContext ctx)
        {
            _ctx = ctx;
        }

       // GET /api/admin/services
    [HttpGet("services")]
    public async Task<IActionResult> GetServices()
    {
        var list = await _ctx.Services
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
            .ToListAsync();

        return Ok(list);
    }

    // POST /api/admin/services
    [HttpPost("services")]
    public async Task<IActionResult> AddService([FromBody] ServiceDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.ServiceKey) || string.IsNullOrWhiteSpace(dto.Label))
            return BadRequest("Key and Label are required");

        var entity = new ServiceItem
        {
            Key       = dto.ServiceKey,
            Label     = dto.Label,
            IsActive  = dto.IsActive,
            MaxNumber = dto.MaxNumber
        };
        _ctx.Services.Add(entity);
        await _ctx.SaveChangesAsync();

        dto.Id = entity.Id;
        dto.CurrentNumber = 0; // yeni servis
        return CreatedAtAction(nameof(GetServices), new { key = dto.ServiceKey }, dto);
    }

    // PUT /api/admin/services/{id}
    [HttpPut("services/{id}")]
    public async Task<IActionResult> UpdateService(int id, [FromBody] ServiceDto dto)
    {
        var service = await _ctx.Services.FindAsync(id);
        if (service == null) return NotFound();

        service.Key       = dto.ServiceKey;
        service.Label     = dto.Label;
        service.IsActive  = dto.IsActive;
        service.MaxNumber = dto.MaxNumber;
        await _ctx.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/admin/services/{id}
    [HttpDelete("services/{id}")]
    public async Task<IActionResult> DeleteService(int id)
    {
        var service = await _ctx.Services.FindAsync(id);
        if (service == null) return NotFound();
        _ctx.Services.Remove(service);
        await _ctx.SaveChangesAsync();
        return NoContent();
    }

        // GET /api/admin/tickets
        [HttpGet("tickets")]
        public async Task<IActionResult> GetAllTickets([FromQuery] string? serviceKey)
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
                .ToListAsync();

            return Ok(tickets);
        }

      // DELETE /api/admin/tickets/{serviceKey}/{number}
        [HttpDelete("tickets/{serviceKey}/{number:int}")]
        public async Task<IActionResult> CancelTicketByComposite(string serviceKey, int number)
        {
            serviceKey = serviceKey.Trim();

            var ticket = await _ctx.Tickets
                .Where(t => t.ServiceKey == serviceKey && t.Number == number)
                .OrderByDescending(t => t.Id)         
                .FirstOrDefaultAsync();

            if (ticket == null) return NotFound();

            await _ctx.TicketAssignments
                .Where(a => a.TicketId == ticket.Id)
                .ExecuteDeleteAsync();

            await _ctx.Tickets
                .Where(t => t.Id == ticket.Id)
                .ExecuteDeleteAsync();

            return NoContent();
        }

    }
}

