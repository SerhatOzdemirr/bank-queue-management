using System.Net.Mail;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using BankNumerator.Api.Data;
using BankNumerator.Api.Models;
using BankNumerator.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

namespace BankNumerator.Api.Services;

public sealed class AuthService : IAuthService
{
    private readonly BankNumeratorContext _ctx;
    private readonly IConfiguration _config;

    public AuthService(BankNumeratorContext ctx, IConfiguration config)
    {
        _ctx = ctx;
        _config = config;
    }

    public async Task<object> SignupAsync(UserDto dto, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            throw new ArgumentException("All fields are required.");
        try { _ = new MailAddress(dto.Email); } catch { throw new ArgumentException("Invalid email address."); }

        var email = dto.Email.Trim().ToLowerInvariant();
        var username = dto.Username.Trim();

        if (await _ctx.Users.AnyAsync(u => u.Email == email, ct))
            throw new InvalidOperationException("Email already in use.");
        if (await _ctx.Users.AnyAsync(u => u.Username == username, ct))
            throw new InvalidOperationException("Username already in use.");

        using var hmac = new HMACSHA512();
        var user = new User
        {
            Username = username,
            Email = email,
            PasswordSalt = hmac.Key, // salt burada key oluyor
            PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password)), // hash
            Role = User.UserRole.Default
        };
        _ctx.Users.Add(user);
        await _ctx.SaveChangesAsync(ct);

        return new { user.Id, user.Username, user.Email, role = user.Role.ToString() };
    }

    public async Task<object> SignupAdminAsync(UserDto dto, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            throw new ArgumentException("All fields are required.");
        try { _ = new MailAddress(dto.Email); } catch { throw new ArgumentException("Invalid email address."); }

        var email = dto.Email.Trim().ToLowerInvariant();
        var username = dto.Username.Trim();

        if (await _ctx.Users.AnyAsync(u => u.Email == email, ct))
            throw new InvalidOperationException("Email already in use.");
        if (await _ctx.Users.AnyAsync(u => u.Username == username, ct))
            throw new InvalidOperationException("Username already in use.");

        using var hmac = new HMACSHA512();
        var user = new User
        {
            Username = username,
            Email = email,
            PasswordSalt = hmac.Key,
            PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password)),
            Role = User.UserRole.Admin
        };
        _ctx.Users.Add(user);
        await _ctx.SaveChangesAsync(ct);

        return new { user.Id, user.Username, user.Email, role = user.Role.ToString() };
    }

    public async Task<string> LoginAsync(LoginDto dto, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            throw new ArgumentException("All fields are required.");

        var email = dto.Email.Trim().ToLowerInvariant();
        var user = await _ctx.Users.SingleOrDefaultAsync(u => u.Email == email, ct);
        if (user == null) throw new UnauthorizedAccessException("User not found.");

       using var hmac = new HMACSHA512(user.PasswordSalt);
        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password));
        if (!computedHash.SequenceEqual(user.PasswordHash))
        throw new UnauthorizedAccessException("Incorrect password.");

        return CreateToken(user);
    }

    private string CreateToken(User user)
    {
        var jwt = _config.GetSection("JwtSettings");
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

        var expiresMinutes = double.Parse(jwt["DurationInMinutes"] ?? "60");
        var tokenDesc = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(expiresMinutes),
            Issuer = jwt["Issuer"],
            Audience = jwt["Audience"],
            SigningCredentials = creds
        };

        var handler = new JwtSecurityTokenHandler();
        var token = handler.CreateToken(tokenDesc);
        return handler.WriteToken(token);
    }
}
