using BankNumerator.Api.Models;

namespace BankNumerator.Api.Services.Interfaces;

public interface IAdminAgentActivityService
{
    Task<IReadOnlyList<AgentActivitySummaryDto>> GetAgentActivityAsync(
        string range = "7d", int topPerAgent = 20, CancellationToken ct = default);
}