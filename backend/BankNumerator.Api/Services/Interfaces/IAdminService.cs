using BankNumerator.Api.Models;

namespace BankNumerator.Api.Services.Interfaces;

public interface IAdminService
{
    Task<IReadOnlyList<ServiceDto>> GetServicesAsync(CancellationToken ct = default);
    Task<ServiceDto> AddServiceAsync(ServiceDto dto, CancellationToken ct = default);
    Task UpdateServiceAsync(int id, ServiceDto dto, CancellationToken ct = default);
    Task DeleteServiceAsync(int id, CancellationToken ct = default);

    Task<IReadOnlyList<TicketDto>> GetAllTicketsAsync(string? serviceKey, CancellationToken ct = default);
    Task CancelTicketByCompositeAsync(string serviceKey, int number, CancellationToken ct = default);
}
