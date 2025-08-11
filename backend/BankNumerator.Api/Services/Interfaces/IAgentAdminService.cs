using BankNumerator.Api.Models;

namespace BankNumerator.Api.Services.Interfaces;

public interface IAgentAdminService
{
    Task<IReadOnlyList<AgentWithSkillsDto>> GetAllAsync(CancellationToken ct = default);
    Task<AgentWithSkillsDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<AgentWithSkillsDto> CreateAsync(CreateAgentWithSkillsDto dto, CancellationToken ct = default);
}
