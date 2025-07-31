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
            var list = await _ctx.Services.ToListAsync();
            return Ok(list);
        }

        // POST /api/admin/services
        [HttpPost("services")]
        public async Task<IActionResult> AddService([FromBody] ServiceItem service)
        {
            if (string.IsNullOrWhiteSpace(service.Key) || string.IsNullOrWhiteSpace(service.Label))
            {
                return BadRequest("Key and Label are required");
            }
            _ctx.Services.Add(service);
            await _ctx.SaveChangesAsync();
            return CreatedAtAction(nameof(GetServices), new { key = service.Key }, service);
        }

        // PUT /api/admin/service/{id}
        [HttpPut("services/{id}")]
        public async Task<IActionResult> UpdateService(int id, [FromBody] ServiceItem updated)
        {
            var service = await _ctx.Services.FindAsync(id);
            if (service == null) return NotFound();

            service.Label = updated.Label;
            service.IsActive = updated.IsActive;
            service.Key       = updated.Key;
            service.MaxNumber = updated.MaxNumber;

            await _ctx.SaveChangesAsync();
            return NoContent();
        }

        // DELETE /api/admin/service/{id}
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
        [HttpDelete("tickets/{serviceKey}/{number}")]
        public async Task<IActionResult> CancelTicket(string serviceKey, int number)
        {
            var ticket = await _ctx.Tickets
                .SingleOrDefaultAsync(t => t.ServiceKey == serviceKey && t.Number == number);

            if (ticket == null)
                return NotFound();

            _ctx.Tickets.Remove(ticket);
            await _ctx.SaveChangesAsync();

            return NoContent();
        }
    }
}

