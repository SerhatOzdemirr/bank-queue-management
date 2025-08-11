using BankNumerator.Api.Models;

namespace BankNumerator.Api.Services.Interfaces;

public interface IAgentTicketsService
{
    Task<int?> GetCurrentAgentIdAsync(int userId);
    Task<IEnumerable<object>> GetMyTicketsAsync(int agentId);
    Task AcceptAsync(int agentId, int ticketId);
    Task RejectAsync(int agentId, int ticketId);
    Task ReleaseAsync(int agentId, int ticketId);
    Task RouteAsync(int currentAgentId, int ticketId, int toAgentId);
    Task<IEnumerable<object>> GetRouteCandidatesAsync(int agentId, string serviceKey);
}
