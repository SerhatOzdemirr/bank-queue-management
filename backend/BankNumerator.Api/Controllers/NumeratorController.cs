using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BankNumerator.Api.Services.Interfaces;
using System.Security.Claims;

namespace BankNumerator.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NumeratorController : ControllerBase
    {
        private readonly INumeratorService _numeratorService;

        public NumeratorController(INumeratorService numeratorService)
        {
            _numeratorService = numeratorService;
        }

        [HttpPost("clear")]
        public async Task<IActionResult> ClearCounters()
        {
            await _numeratorService.ClearCountersAsync();
            return NoContent();
        }

        [HttpGet("next")]
        public async Task<IActionResult> GetNext([FromQuery] string service)
        {
            var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idStr, out var userId) || userId <= 0)
                return Unauthorized("Invalid user");

            try
            {
                var result = await _numeratorService.GetNextAsync(service, userId);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{serviceKey}/{number}")]
        public async Task<IActionResult> CancelTicket([FromRoute] string serviceKey, [FromRoute] int number)
        {
            var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idStr, out var userId) || userId <= 0)
                return Unauthorized("Invalid user");

            var ok = await _numeratorService.CancelTicketAsync(serviceKey, number, userId);
            return ok ? NoContent() : NotFound("Ticket not found or not your ticket");
        }
    }
}
