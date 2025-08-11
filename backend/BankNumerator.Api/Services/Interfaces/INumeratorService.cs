using BankNumerator.Api.Models;

namespace BankNumerator.Api.Services.Interfaces
{
    public interface INumeratorService
    {
        Task ClearCountersAsync();
        Task<object> GetNextAsync(string service, int userId);
        Task<bool> CancelTicketAsync(string serviceKey, int number, int userId);
    }
}
