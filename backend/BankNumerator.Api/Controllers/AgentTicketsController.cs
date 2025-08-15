using System.Security.Claims;
using BankNumerator.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BankNumerator.Api.Controllers
{
    [ApiController]
    [Route("api/agent/tickets")]
    [Authorize(Roles = "Agent")]
    public class AgentTicketsController : ControllerBase
    {
        private readonly IAgentTicketsService _svc;

        public AgentTicketsController(IAgentTicketsService svc)
        {
            _svc = svc;
        }

        private int GetCurrentUserId()
        {
            var uid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(uid, out var userId) ? userId : 0;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyTickets()
        {
            var agentId = await _svc.GetCurrentAgentIdAsync(GetCurrentUserId());
            if (agentId == null) return Unauthorized();
            return Ok(await _svc.GetMyTicketsAsync(agentId.Value));
        }

        [HttpPost("{ticketId}/accept")]
        public async Task<IActionResult> Accept(int ticketId)
        {
            var agentId = await _svc.GetCurrentAgentIdAsync(GetCurrentUserId());
            if (agentId == null) return Unauthorized();
            await _svc.AcceptAsync(agentId.Value, ticketId);
            return NoContent();
        }

       [HttpPost("{ticketId}/reject")]
public async Task<IActionResult> Reject(int ticketId)
{
    var agentId = await _svc.GetCurrentAgentIdAsync(GetCurrentUserId());
    if (agentId == null) return Unauthorized();

    try
    {
        await _svc.RejectAsync(agentId.Value, ticketId);
        return NoContent();
    }
    catch (KeyNotFoundException ex)
    {
        return NotFound(new { message = ex.Message });
    }
    catch (InvalidOperationException ex)
    {
        return BadRequest(new { message = ex.Message });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = "Unexpected error", detail = ex.Message });
    }
}


        [HttpPost("{ticketId}/release")]
        public async Task<IActionResult> Release(int ticketId)
        {
            var agentId = await _svc.GetCurrentAgentIdAsync(GetCurrentUserId());
            if (agentId == null) return Unauthorized();
            await _svc.ReleaseAsync(agentId.Value, ticketId);
            return NoContent();
        }

        [HttpPost("{ticketId}/route/{toAgentId}")]
        public async Task<IActionResult> Route(int ticketId, int toAgentId)
        {
            var agentId = await _svc.GetCurrentAgentIdAsync(GetCurrentUserId());
            if (agentId == null) return Unauthorized();
            await _svc.RouteAsync(agentId.Value, ticketId, toAgentId);
            return NoContent();
        }

        [HttpGet("route-candidates/{serviceKey}")]
        public async Task<IActionResult> GetRouteCandidates(string serviceKey)
        {
            var agentId = await _svc.GetCurrentAgentIdAsync(GetCurrentUserId());
            if (agentId == null) return Unauthorized();
            return Ok(await _svc.GetRouteCandidatesAsync(agentId.Value, serviceKey));
        }
    }
}
