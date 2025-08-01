using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BankNumerator.Api.Data;   
using BankNumerator.Api.Models;    

namespace BankNumerator.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServicesController : ControllerBase
    {
        private readonly BankNumeratorContext _db;
        public ServicesController(BankNumeratorContext db) => _db = db;

        [HttpGet]
        public async Task<ActionResult<List<ServiceDto>>> GetAll()
        {
            var list = await _db.Services
                .Where(s => s.IsActive)
                .Select(s => new ServiceDto
                {
                    Id            = s.Id,
                    ServiceKey    = s.Key,
                    Label         = s.Label,
                    IsActive      = s.IsActive,
                    MaxNumber     = s.MaxNumber,
                    CurrentNumber = _db.Counters
                        .Where(c => c.ServiceKey == s.Key)
                        .Select(c => c.CurrentNumber)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(list);
        }
    }
}
