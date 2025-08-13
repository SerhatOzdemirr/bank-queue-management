// Controllers/AdminAgentActivityController.cs
using BankNumerator.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BankNumerator.Api.Controllers;

[ApiController]
[Route("api/admin/stats")]
[Authorize(Roles = "Admin")]
public class AdminAgentActivityController : ControllerBase
{
    private readonly IAdminAgentActivityService _svc;
    public AdminAgentActivityController(IAdminAgentActivityService svc) => _svc = svc;

    // GET /api/admin/stats/agent-activity?range=7d&top=20
    [HttpGet("agent-activity")]
    public async Task<IActionResult> Get([FromQuery] string range = "7d", [FromQuery] int top = 20, CancellationToken ct = default)
        => Ok(await _svc.GetAgentActivityAsync(range, top, ct));
}
