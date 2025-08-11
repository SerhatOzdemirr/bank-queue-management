using BankNumerator.Api.Models;

namespace BankNumerator.Api.Services.Interfaces
{
    public interface IServicesService
    {
        Task<IReadOnlyList<ServiceDto>> GetAllAsync(CancellationToken ct = default);
    }
}
