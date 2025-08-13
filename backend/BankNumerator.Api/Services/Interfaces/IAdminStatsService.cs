using BankNumerator.Api.Models;

namespace BankNumerator.Api.Services.Interfaces;

public interface IAdminStatsService
{
    Task<IReadOnlyList<ServiceCountItem>> GetTicketsByServiceAsync(
        string range = "7d",
        CancellationToken ct = default);
}
