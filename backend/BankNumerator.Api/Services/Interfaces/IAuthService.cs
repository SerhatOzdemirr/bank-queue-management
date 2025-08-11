using BankNumerator.Api.Models;

namespace BankNumerator.Api.Services.Interfaces;

public interface IAuthService
{
    Task<object> SignupAsync(UserDto dto, CancellationToken ct = default);
    Task<object> SignupAdminAsync(UserDto dto, CancellationToken ct = default);
    Task<string> LoginAsync(LoginDto dto, CancellationToken ct = default);
}
