using BankNumerator.Api.Models;
using BankNumerator.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BankNumerator.Api.Controllers
{
    [ApiController]
    [Route("api/admin/agents")]
    [Authorize(Roles = "Admin")]
    public class AdminAgentsController : ControllerBase
    {
        private readonly IAgentAdminService _service;

        public AdminAgentsController(IAgentAdminService service) => _service = service;

        // GET /api/admin/agents
        [HttpGet]
        public async Task<IActionResult> GetAllAgents(CancellationToken ct)
        {
            var list = await _service.GetAllAsync(ct);
            return Ok(list);
        }

        // GET /api/admin/agents/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetAgentById(int id, CancellationToken ct)
        {
            var dto = await _service.GetByIdAsync(id, ct);
            return dto is null ? NotFound() : Ok(dto);
        }

        // POST /api/admin/agents
        [HttpPost]
        public async Task<IActionResult> CreateAgentWithSkills([FromBody] CreateAgentWithSkillsDto dto, CancellationToken ct)
        {
            try
            {
                var created = await _service.CreateAsync(dto, ct);
                return CreatedAtAction(nameof(GetAgentById), new { id = created.AgentId }, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
