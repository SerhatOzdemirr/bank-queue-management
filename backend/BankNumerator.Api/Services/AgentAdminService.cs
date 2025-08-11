using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;
using BankNumerator.Api.Data;
using BankNumerator.Api.Models;
using BankNumerator.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;


namespace BankNumerator.Api.Services;

public sealed class AgentAdminService : IAgentAdminService
{
    private readonly BankNumeratorContext _ctx;

    public AgentAdminService(BankNumeratorContext ctx) => _ctx = ctx;

    public async Task<IReadOnlyList<AgentWithSkillsDto>> GetAllAsync(CancellationToken ct = default)
    {
        // Read-only sorgu → AsNoTracking
        return await _ctx.Agents
            .AsNoTracking()
            .Include(a => a.User)
            .Include(a => a.Skills)
            .Select(a => new AgentWithSkillsDto(
                a.Id,
                a.User.Username,
                a.User.Email,
                a.Skills.Select(s => s.ServiceKey).ToList()
            ))
            .ToListAsync(ct);
    }

    public async Task<AgentWithSkillsDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var agent = await _ctx.Agents
            .AsNoTracking()
            .Include(a => a.User)
            .Include(a => a.Skills)
            .SingleOrDefaultAsync(a => a.Id == id, ct);

        return agent is null
            ? null
            : new AgentWithSkillsDto(
                agent.Id,
                agent.User.Username,
                agent.User.Email,
                agent.Skills.Select(s => s.ServiceKey).ToList()
              );
    }

    public async Task<AgentWithSkillsDto> CreateAsync(CreateAgentWithSkillsDto dto, CancellationToken ct = default)
    {
        // 1) Alan doğrulamaları
        if (string.IsNullOrWhiteSpace(dto.Username) ||
            string.IsNullOrWhiteSpace(dto.Email) ||
            string.IsNullOrWhiteSpace(dto.Password))
        {
            throw new ArgumentException("Username, Email and Password are required.");
        }

        // 2) Email formatı
        try { _ = new MailAddress(dto.Email); }
        catch { throw new ArgumentException("Invalid email address."); }

        var email    = dto.Email.Trim().ToLowerInvariant();
        var username = dto.Username.Trim();

        // 3) Uniqueness
        if (await _ctx.Users.AnyAsync(u => u.Email == email, ct))
            throw new InvalidOperationException("Email already in use.");
        if (await _ctx.Users.AnyAsync(u => u.Username == username, ct))
            throw new InvalidOperationException("Username already in use.");

        // 4) Transaction: user + agent + skills tek ACID işlem
        await using var tx = await _ctx.Database.BeginTransactionAsync(ct);

        // Password hashing: HMAC key = salt, ComputeHash = hash
        using var hmac = new HMACSHA512();
        var user = new User
        {
            Username     = username,
            Email        = email,
            PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password)),
            PasswordSalt = hmac.Key,
            Role         = User.UserRole.Agent
        };

        _ctx.Users.Add(user);
        await _ctx.SaveChangesAsync(ct);

        var agent = new Agent { UserId = user.Id };
        _ctx.Agents.Add(agent);
        await _ctx.SaveChangesAsync(ct);

        // 5) Geçerli servis anahtarları
        var validKeys = await _ctx.Services
            .AsNoTracking()
            .Select(s => s.Key)
            .ToListAsync(ct);

        // 6) Skill insertleri (Distinct + sadece geçerli key’ler)
        var keysToInsert = dto.ServiceKeys?
            .Distinct()
            .Where(validKeys.Contains)
            .Select(k => new AgentSkill { AgentId = agent.Id, ServiceKey = k })
            .ToList() ?? new List<AgentSkill>();

        if (keysToInsert.Count > 0)
        {
            _ctx.AgentSkills.AddRange(keysToInsert);
            await _ctx.SaveChangesAsync(ct);
        }

        await tx.CommitAsync(ct);

        return new AgentWithSkillsDto(
            agent.Id,
            user.Username,
            user.Email,
            keysToInsert.Select(x => x.ServiceKey).ToList()
        );
    }
}
