using BankNumerator.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BankNumerator.Api.Controllers;

[ApiController]
[Route("api/admin/stats")]
[Authorize(Roles = "Admin")]
public class AdminStatsController : ControllerBase
{
    private readonly IAdminStatsService _stats;
    public AdminStatsController(IAdminStatsService stats) => _stats = stats;

    // GET /api/admin/stats/tickets-by-service?range=7d
    [HttpGet("tickets-by-service")]
    public async Task<IActionResult> GetTicketsByService([FromQuery] string range = "7d", CancellationToken ct = default)
        => Ok(await _stats.GetTicketsByServiceAsync(range, ct));
}
