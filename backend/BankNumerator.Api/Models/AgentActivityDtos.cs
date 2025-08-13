namespace BankNumerator.Api.Models;

public sealed record TicketBriefDto(
    int TicketId, int Number, string ServiceKey, string ServiceLabel,
    DateTime AssignedAt, string Status);

public sealed record AgentActivitySummaryDto(
    int AgentId, string AgentName,
    int Pending, int Accepted, int Rejected, int Total,
    List<TicketBriefDto> RecentTickets);
