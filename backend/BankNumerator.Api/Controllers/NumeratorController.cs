// Controllers/NumeratorController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BankNumerator.Api.Data;
using BankNumerator.Api.Models;
using System.Threading.Tasks;

namespace BankNumerator.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NumeratorController : ControllerBase
    {
        private readonly BankNumeratorContext _ctx;

        public NumeratorController(BankNumeratorContext ctx)
        {
            _ctx = ctx;
        }

        // Test için: tüm counters tablosunu temizler
        [HttpPost("clear")]
        public async Task<IActionResult> ClearCounters()
        {
            _ctx.Counters.RemoveRange(_ctx.Counters);
            await _ctx.SaveChangesAsync();
            return NoContent();
        }

       [HttpGet("next")]
        public async Task<IActionResult> GetNext([FromQuery] string service)
        {
            var svc = await _ctx.Services
                .Where(s => s.Key == service && s.IsActive)
                .FirstOrDefaultAsync();

            if (svc == null) return NotFound("Service not found");

            var counter = await _ctx.Counters.FindAsync(service);
            if (counter == null)
            {
                counter = new ServiceCounter { ServiceKey = service, CurrentNumber = 1 };
                _ctx.Counters.Add(counter);
            }
            else
            {
                counter.CurrentNumber++;
                _ctx.Counters.Update(counter);
            }

            var ticket = new Ticket
            {
                Number = counter.CurrentNumber,
                ServiceKey = svc.Key,
                ServiceLabel = svc.Label,
                TakenAt = DateTime.UtcNow
            };
            _ctx.Tickets.Add(ticket);
            await _ctx.SaveChangesAsync();
            return Ok(ticket);
        }

    }
}
