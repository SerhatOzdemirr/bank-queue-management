using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BankNumerator.Api.Data;
using BankNumerator.Api.Models;

namespace BankNumerator.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly BankNumeratorContext _ctx;
        private readonly IConfiguration _config;

        public AuthController(BankNumeratorContext ctx, IConfiguration config)
        {
            _ctx = ctx;
            _config = config;
        }

        [HttpPost("signup")]
        public async Task<IActionResult> Signup([FromBody] UserDto dto)
        {
            if (await _ctx.Users.AnyAsync(u => u.Email == dto.Email.ToLower()))
                return BadRequest("This email has already been used by another user.");

            using var hmac = new HMACSHA512();
            var user = new User {
                Username = dto.Username,
                Email = dto.Email.ToLower(),
                PasswordHash = hmac.Key,
                PasswordSalt = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password))
            };

            _ctx.Users.Add(user);
            await _ctx.SaveChangesAsync();

            return Ok(new { user.Id, user.Username, user.Email });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _ctx.Users.SingleOrDefaultAsync(u => u.Email == dto.Email.ToLower());
            if (user == null) return Unauthorized("User not found. Please sign up first.");

            using var hmac = new HMACSHA512(user.PasswordHash);
            var computed = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password));
            if (!computed.SequenceEqual(user.PasswordSalt))
                return Unauthorized("User not found. Please sign up first.");

            var token = CreateToken(user);
            return Ok(new { token });
        }

        private string CreateToken(User user)
        {
            var jwt = _config.GetSection("JwtSettings");
            var claims = new[]{
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username)
            };
            var creds = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!)),
                SecurityAlgorithms.HmacSha512Signature);

            var tokenDesc = new SecurityTokenDescriptor {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(double.Parse(jwt["DurationInMinutes"]!)),
                Issuer = jwt["Issuer"],
                Audience = jwt["Audience"],
                SigningCredentials = creds
            };
            var handler = new JwtSecurityTokenHandler();
            var secToken = handler.CreateToken(tokenDesc);
            return handler.WriteToken(secToken);
        }
    }

    public record UserDto(string Username, string Email, string Password);
    public record LoginDto(string Email, string Password);
}
