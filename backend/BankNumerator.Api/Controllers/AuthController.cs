using Microsoft.AspNetCore.Mvc;
using BankNumerator.Api.Services.Interfaces;
using BankNumerator.Api.Models;
using Microsoft.AspNetCore.Authorization;

namespace BankNumerator.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _svc;

        public AuthController(IAuthService svc)
        {
            _svc = svc;
        }

        [HttpPost("signup")]
        public async Task<IActionResult> Signup([FromBody] UserDto dto, CancellationToken ct)
        {
            try
            {
                var result = await _svc.SignupAsync(dto, ct);
                return Ok(result);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (InvalidOperationException ex) { return BadRequest(ex.Message); }
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("signup-admin")]
        public async Task<IActionResult> SignupAdmin([FromBody] UserDto dto, CancellationToken ct)
        {
            try
            {
                var result = await _svc.SignupAdminAsync(dto, ct);
                return Ok(result);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (InvalidOperationException ex) { return BadRequest(ex.Message); }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto, CancellationToken ct)
        {
            try
            {
                var token = await _svc.LoginAsync(dto, ct);
                return Ok(new { token });
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }
        }
    }
}
