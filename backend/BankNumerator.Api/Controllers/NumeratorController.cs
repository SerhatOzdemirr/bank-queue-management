// Controllers/NumeratorController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BankNumerator.Api.Data;
using BankNumerator.Api.Models;
using System.Threading.Tasks;
using System.Security.Claims;
namespace BankNumerator.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NumeratorController : ControllerBase
    {
        private readonly BankNumeratorContext _ctx;
        private readonly ILogger<NumeratorController> _logger;
        public NumeratorController(BankNumeratorContext ctx, ILogger<NumeratorController> logger)
        {
            _ctx = ctx;
            _logger = logger;
        }

        // For playwright test clear counters
        [HttpPost("clear")]
        public async Task<IActionResult> ClearCounters()
        {
            _ctx.Counters.RemoveRange(_ctx.Counters);
            await _ctx.SaveChangesAsync();
            return NoContent();
        }
        // GET api/numerator/next?service={serviceKey}
       [HttpGet("next")]
        public async Task<IActionResult> GetNext([FromQuery] string service)
        {
            foreach (var c in User.Claims)
                _logger.LogInformation("CLAIM ▶ {Type} = {Value}", c.Type, c.Value);
            var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idStr, out var userId) || userId <= 0)
                return Unauthorized("Invalid user");
            var svc = await _ctx.Services
                .AsNoTracking()
                .SingleOrDefaultAsync(s => s.Key == service);
            if (svc == null || !svc.IsActive)
                return BadRequest("Service not found or inactive");
            var counter = await _ctx.Counters
                .SingleOrDefaultAsync(c => c.ServiceKey == service)
                ?? new ServiceCounter { ServiceKey = service, CurrentNumber = 0 };
            // Limit Control
            if (counter.CurrentNumber >= svc.MaxNumber)
                return BadRequest("This service reached the maximum number.");
            counter.CurrentNumber++;
            if (_ctx.Entry(counter).State == EntityState.Detached)
                _ctx.Counters.Add(counter);
            else
                _ctx.Counters.Update(counter);
            // Create ticket
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

            var dto = new TicketDto
            {
                Number       = ticket.Number,
                ServiceKey   = ticket.ServiceKey,
                ServiceLabel = ticket.ServiceLabel,
                TakenAt      = ticket.TakenAt,
                UserId       = ticket.UserId,
                Username     = (await _ctx.Users.FindAsync(userId))?.Username ?? ""
            };
            return Ok(dto);
        }
    }
}
