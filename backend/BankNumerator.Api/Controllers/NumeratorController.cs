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
        // GET api/numerator/next?service={serviceKey}
   [HttpGet("next")]
public async Task<IActionResult> GetNext([FromQuery] string service)
{
    // 1) Kullanıcı kimliğini al
    var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (!int.TryParse(idStr, out var userId) || userId <= 0)
        return Unauthorized("Invalid user");

    // 2) Service kontrolü
    var svc = await _ctx.Services
        .AsNoTracking()
        .SingleOrDefaultAsync(s => s.Key == service);
    if (svc == null || !svc.IsActive)
        return BadRequest("Service not found or inactive");

    // 3) Sayaç güncelle
    var counter = await _ctx.Counters
        .SingleOrDefaultAsync(c => c.ServiceKey == service)
        ?? new ServiceCounter { ServiceKey = service, CurrentNumber = 0 };

    if (counter.CurrentNumber >= svc.MaxNumber)
        return BadRequest("This service reached the maximum number.");

    counter.CurrentNumber++;
    if (_ctx.Entry(counter).State == EntityState.Detached)
        _ctx.Counters.Add(counter);
    else
        _ctx.Counters.Update(counter);

    // 4) Ticket oluştur ve kaydet
    var ticket = new Ticket
    {
        Number       = counter.CurrentNumber,
        ServiceKey   = svc.Key,
        ServiceLabel = svc.Label,
        TakenAt      = DateTime.UtcNow,
        UserId       = userId
    };
    _ctx.Tickets.Add(ticket);
    await _ctx.SaveChangesAsync();    // ticket.Id ve Number tamam

    // 5) AgentSkill tablosundan uygun agent’ı seç
    var skilled = await _ctx.AgentSkills
        .Where(sk => sk.ServiceKey == service)
        .Select(sk => sk.AgentId)
        .ToListAsync();

    var assignedAgentId = skilled.Any()
        ? skilled.First()
        : await _ctx.Agents.Select(a => a.Id).FirstAsync();  // fallback

    // 6) TicketAssignment kaydı oluştur
    var assignment = new TicketAssignment
    {
        TicketId   = ticket.Id,
        AgentId    = assignedAgentId,
        AssignedAt = DateTime.UtcNow,
        Status     = "Pending"
    };
    _ctx.TicketAssignments.Add(assignment);
    await _ctx.SaveChangesAsync();

    // 7) Cevabı döndür (anon tip, mevcut DTO’yu değiştirmiyoruz)
    return Ok(new 
    {
        number            = ticket.Number,
        serviceKey        = ticket.ServiceKey,
        serviceLabel      = ticket.ServiceLabel,
        takenAt           = ticket.TakenAt,
        userId            = ticket.UserId,
        username          = (await _ctx.Users.FindAsync(userId))?.Username ?? "",
        assignedAgentId   = assignment.AgentId,
        assignedAt        = assignment.AssignedAt,
        assignmentStatus  = assignment.Status
    });
}


        [HttpDelete("{serviceKey}/{number}")]
        public async Task<IActionResult> CancelTicket(
            [FromRoute] string serviceKey,
            [FromRoute] int number)
        {
            // 1) Kimlik doğrulama
            var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idStr, out var userId) || userId <= 0)
                return Unauthorized("Invalid user");

            // 2) Bileti veritabanından getir (sadece kendi bileti)
            var ticket = await _ctx.Tickets
                .SingleOrDefaultAsync(t =>
                    t.ServiceKey == serviceKey
                    && t.Number     == number
                    && t.UserId     == userId);

            if (ticket == null)
                return NotFound("Ticket not found or not your ticket");

            // 3) Sayaçtan da azaltmak istersek
            var counter = await _ctx.Counters
                .SingleOrDefaultAsync(c => c.ServiceKey == serviceKey);
            if (counter != null && counter.CurrentNumber > 0)
            {
                counter.CurrentNumber--;
                _ctx.Counters.Update(counter);
            }

            // 4) Bileti sil
            _ctx.Tickets.Remove(ticket);
            await _ctx.SaveChangesAsync();

            return NoContent();
        }
    }
}
