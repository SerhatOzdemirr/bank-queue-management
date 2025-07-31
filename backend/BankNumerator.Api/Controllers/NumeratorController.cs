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

        // Test için: tüm counters tablosunu temizler
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
            // 1) Log all incoming claims
            foreach (var c in User.Claims)
            {
                _logger.LogInformation("CLAIM ▶ {Type} = {Value}", c.Type, c.Value);
            }

            // 2) Read and parse NameIdentifier
            var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            _logger.LogInformation("Parsed nameid: {IdStr}", idStr);
            if (!int.TryParse(idStr, out var userId) || userId <= 0)
            {
                _logger.LogWarning("Invalid or missing userId: {IdStr}", idStr);
                return Unauthorized("Invalid user");
            }
            _logger.LogInformation("Authenticated userId = {UserId}", userId);

            // 3) Counter logic
            var counter = await _ctx.Counters
                .SingleOrDefaultAsync(c => c.ServiceKey == service);
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

            // 4) Ensure service is active
            var svc = await _ctx.Services
                .AsNoTracking()
                .SingleOrDefaultAsync(s => s.Key == service);
            if (svc == null || !svc.IsActive)
                return BadRequest("Service not found or inactive");

            // 5) Create and add new Ticket
            var ticket = new Ticket
            {
                Number       = counter.CurrentNumber,
                ServiceKey   = svc.Key,
                ServiceLabel = svc.Label,
                TakenAt      = DateTime.UtcNow,
                UserId       = userId
            };
            _ctx.Tickets.Add(ticket);

            // 6) Save changes
            await _ctx.SaveChangesAsync();

            // 7) Return DTO
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
