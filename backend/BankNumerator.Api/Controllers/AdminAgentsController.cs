// Controllers/AdminAgentsController.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using BankNumerator.Api.Data;
using BankNumerator.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BankNumerator.Api.Controllers
{
    [ApiController]
    [Route("api/admin/agents")]
    [Authorize(Roles = "Admin")]
    public class AdminAgentsController : ControllerBase
    {
        private readonly BankNumeratorContext _ctx;

        public AdminAgentsController(BankNumeratorContext ctx)
            => _ctx = ctx;

        // GET /api/admin/agents
        [HttpGet]
        public async Task<IActionResult> GetAllAgents()
        {
            var list = await _ctx.Agents
                .Include(a => a.User)
                .Include(a => a.Skills)
                .Select(a => new AgentWithSkillsDto(
                    a.Id,
                    a.User.Username,
                    a.User.Email,
                    a.Skills.Select(s => s.ServiceKey).ToList()
                ))
                .ToListAsync();

            return Ok(list);
        }

        // GET /api/admin/agents/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAgentById(int id)
        {
            var agent = await _ctx.Agents
                .Include(a => a.User)
                .Include(a => a.Skills)
                .SingleOrDefaultAsync(a => a.Id == id);

            if (agent == null) return NotFound();

            return Ok(new AgentWithSkillsDto(
                agent.Id,
                agent.User.Username,
                agent.User.Email,
                agent.Skills.Select(s => s.ServiceKey).ToList()
            ));
        }

        // POST /api/admin/agents
        [HttpPost]
        public async Task<IActionResult> CreateAgentWithSkills([FromBody] CreateAgentWithSkillsDto dto)
        {
            // 1) Alan kontrolü
            if (string.IsNullOrWhiteSpace(dto.Username) ||
                string.IsNullOrWhiteSpace(dto.Email) ||
                string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest("Username, Email and Password are required.");
            }

            // 2) Email formatı
            try { _ = new System.Net.Mail.MailAddress(dto.Email); }
            catch { return BadRequest("Invalid email address."); }

            var email = dto.Email.Trim().ToLower();
            var username = dto.Username.Trim();

            // 3) Uniqueness
            if (await _ctx.Users.AnyAsync(u => u.Email == email))
                return BadRequest("Email already in use.");
            if (await _ctx.Users.AnyAsync(u => u.Username == username))
                return BadRequest("Username already in use.");

            // 4) User oluştur
            using var hmac = new HMACSHA512();
            var user = new User
            {
                Username     = username,
                Email        = email,
                PasswordHash = hmac.Key,
                PasswordSalt = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password)),
                Role         = Models.User.UserRole.Agent
            };
            _ctx.Users.Add(user);
            await _ctx.SaveChangesAsync();

            // 5) Agent tablosuna kaydet
            var agent = new Agent { UserId = user.Id };
            _ctx.Agents.Add(agent);
            await _ctx.SaveChangesAsync();

            // 6) Mevcut servis anahtarlarını çek
            var validKeys = await _ctx.Services
                .Select(s => s.Key)
                .ToListAsync();

            // 7) DTO’daki servisleri skill olarak ekle
            foreach (var key in dto.ServiceKeys.Distinct())
            {
                if (validKeys.Contains(key))
                {
                    _ctx.AgentSkills.Add(new AgentSkill
                    {
                        AgentId    = agent.Id,
                        ServiceKey = key
                    });
                }
            }
            await _ctx.SaveChangesAsync();

            // 8) Created cevabı
            var result = new AgentWithSkillsDto(
                agent.Id,
                user.Username,
                user.Email,
                dto.ServiceKeys.Where(k => validKeys.Contains(k)).ToList()
            );
            return CreatedAtAction(nameof(GetAgentById), new { id = agent.Id }, result);
        }
    }

    // --------------------------------------------------
    // DTO’lar

    public record CreateAgentWithSkillsDto(
        string Username,
        string Email,
        string Password,
        List<string> ServiceKeys
    );

    public record AgentWithSkillsDto(
        int    AgentId,
        string Username,
        string Email,
        List<string> ServiceKeys
    );
}
