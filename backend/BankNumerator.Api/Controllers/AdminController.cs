using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BankNumerator.Api.Services.Interfaces;
using BankNumerator.Api.Models;

namespace BankNumerator.Api.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _svc;

        public AdminController(IAdminService svc) => _svc = svc;

        // GET /api/admin/services
        [HttpGet("services")]
        public async Task<IActionResult> GetServices(CancellationToken ct)
            => Ok(await _svc.GetServicesAsync(ct));

        // POST /api/admin/services
        [HttpPost("services")]
        public async Task<IActionResult> AddService([FromBody] ServiceDto dto, CancellationToken ct)
        {
            try
            {
                var created = await _svc.AddServiceAsync(dto, ct);
                // CreatedAtAction yerine list endpointine referans verdin; aynı davranışı koruyorum.
                return CreatedAtAction(nameof(GetServices), new { key = created.ServiceKey }, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            // catch (InvalidOperationException ex) { return BadRequest(ex.Message); }
        }

        // PUT /api/admin/services/{id}
        [HttpPut("services/{id:int}")]
        public async Task<IActionResult> UpdateService(int id, [FromBody] ServiceDto dto, CancellationToken ct)
        {
            try
            {
                await _svc.UpdateServiceAsync(id, dto, ct);
                return NoContent();
            }
            catch (KeyNotFoundException) { return NotFound(); }
        }

        // DELETE /api/admin/services/{id}
        [HttpDelete("services/{id:int}")]
        public async Task<IActionResult> DeleteService(int id, CancellationToken ct)
        {
            try
            {
                await _svc.DeleteServiceAsync(id, ct);
                return NoContent();
            }
            catch (KeyNotFoundException) { return NotFound(); }
        }

        // GET /api/admin/tickets
        [HttpGet("tickets")]
        public async Task<IActionResult> GetAllTickets([FromQuery] string? serviceKey, CancellationToken ct)
            => Ok(await _svc.GetAllTicketsAsync(serviceKey, ct));

        // DELETE /api/admin/tickets/{serviceKey}/{number}
        [HttpDelete("tickets/{serviceKey}/{number:int}")]
        public async Task<IActionResult> CancelTicketByComposite(string serviceKey, int number, CancellationToken ct)
        {
            try
            {
                await _svc.CancelTicketByCompositeAsync(serviceKey, number, ct);
                return NoContent();
            }
            catch (KeyNotFoundException) { return NotFound(); }
        }
    }
}
