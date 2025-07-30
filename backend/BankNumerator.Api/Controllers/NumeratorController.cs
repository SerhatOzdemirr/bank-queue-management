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
                // Sayaç işlemi
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

                // ServiceLabel almak için ServiceItem’a bak
                var svc = await _ctx.Services
                    .AsNoTracking()
                    .SingleOrDefaultAsync(s => s.Key == service);
                if (svc == null || !svc.IsActive)
                    return BadRequest("Servis bulunamadı veya aktif değil");

                // Yeni Ticket oluştur ve ekle
                var ticket = new Ticket
                {
                    Number       = counter.CurrentNumber,
                    ServiceKey   = svc.Key,
                    ServiceLabel = svc.Label,
                    TakenAt      = DateTime.UtcNow
                };
                _ctx.Tickets.Add(ticket);

                // Tüm değişiklikleri kaydet
                await _ctx.SaveChangesAsync();

                // DTO ile geri dön
                var dto = new TicketDto
                {
                    Number       = ticket.Number,
                    ServiceKey   = ticket.ServiceKey,
                    ServiceLabel = ticket.ServiceLabel,
                    TakenAt      = ticket.TakenAt
                };
                return Ok(dto);
            }

    }
}
