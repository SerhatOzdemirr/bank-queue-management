namespace BankNumerator.Api.Models;

public record CreateAgentWithSkillsDto(
    string Username,
    string Email,
    string Password,
    List<string> ServiceKeys
);

public record AgentWithSkillsDto(
    int    AgentId,
    string Username,
    string Email,
    List<string> ServiceKeys
);
