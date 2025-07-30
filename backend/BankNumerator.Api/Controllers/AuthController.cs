// Controllers/AuthController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BankNumerator.Api.Data;
using BankNumerator.Api.Models;
using Microsoft.AspNetCore.Authorization;

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
            // 1. Alan kontrolü
            if (string.IsNullOrWhiteSpace(dto.Username) ||
                string.IsNullOrWhiteSpace(dto.Email) ||
                string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest("All fields are required.");
            }

            // 2. Email formatı
            try { _ = new System.Net.Mail.MailAddress(dto.Email); }
            catch { return BadRequest("Invalid email address."); }

            var emailLower     = dto.Email.Trim().ToLower();
            var usernameTrimmed = dto.Username.Trim();

            // 3–4. Benzersiz kontrol
            if (await _ctx.Users.AnyAsync(u => u.Email == emailLower))
                return BadRequest("Email already in use.");
            if (await _ctx.Users.AnyAsync(u => u.Username == usernameTrimmed))
                return BadRequest("Username already in use.");

            // 5. Kullanıcı oluştur
            using var hmac = new HMACSHA512();
            var user = new User
            {
                Username     = usernameTrimmed,
                Email        = emailLower,
                PasswordHash = hmac.Key,
                PasswordSalt = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password)),
                Role         = Models.User.UserRole.Default  // ← Default rolü atandı
            };

            _ctx.Users.Add(user);
            await _ctx.SaveChangesAsync();

            return Ok(new { user.Id, user.Username, user.Email, role = user.Role.ToString() });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("signup-admin")]
        public async Task<IActionResult> SignupAdmin([FromBody] UserDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Username) ||
                string.IsNullOrWhiteSpace(dto.Email) ||
                string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest("All fields are required.");

            try { _ = new System.Net.Mail.MailAddress(dto.Email); }
            catch { return BadRequest("Invalid email address."); }

            var email = dto.Email.Trim().ToLower();
            var username = dto.Username.Trim();

            if (await _ctx.Users.AnyAsync(u => u.Email == email))
                return BadRequest("Email already in use.");
            if (await _ctx.Users.AnyAsync(u => u.Username == username))
                return BadRequest("Username already in use.");

            using var hmac = new HMACSHA512();
            var user = new User
            {
                Username     = username,
                Email        = email,
                PasswordHash = hmac.Key,
                PasswordSalt = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password)),
                Role         = Models.User.UserRole.Admin
            };

            _ctx.Users.Add(user);
            await _ctx.SaveChangesAsync();
            return Ok(new { user.Id, user.Username, user.Email, role = user.Role.ToString() });
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) ||
                string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest("All fields are required.");
            }

            var emailLower = dto.Email.Trim().ToLower();
            var user = await _ctx.Users.SingleOrDefaultAsync(u => u.Email == emailLower);
            if (user == null) return Unauthorized("User not found.");

            using var hmac = new HMACSHA512(user.PasswordHash);
            var computed = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password));
            if (!computed.SequenceEqual(user.PasswordSalt))
                return Unauthorized("Incorrect password.");

            // Token’a rol claim’i ekleyelim
            var token = CreateToken(user);
            return Ok(new { token });
        }

        private string CreateToken(User user)
        {
            var jwt = _config.GetSection("JwtSettings");
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role.ToString())  // ← Role claim
            };

            var creds = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!)),
                SecurityAlgorithms.HmacSha512Signature);

            var tokenDesc = new SecurityTokenDescriptor
            {
                Subject             = new ClaimsIdentity(claims),
                Expires             = DateTime.UtcNow.AddMinutes(double.Parse(jwt["DurationInMinutes"]!)),
                Issuer              = jwt["Issuer"],
                Audience            = jwt["Audience"],
                SigningCredentials  = creds
            };

            var handler = new JwtSecurityTokenHandler();
            var secToken = handler.CreateToken(tokenDesc);
            return handler.WriteToken(secToken);
        }
    }

    public record UserDto(string Username, string Email, string Password);
    public record LoginDto(string Email, string Password);
}
