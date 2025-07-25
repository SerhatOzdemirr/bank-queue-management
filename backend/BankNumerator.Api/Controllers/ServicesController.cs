using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BankNumerator.Api.Data;     // BankQueueContext burada
using BankNumerator.Api.Models;    

namespace BankNumerator.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServicesController : ControllerBase
    {
        private readonly BankNumeratorContext _ctx;
        public ServicesController(BankNumeratorContext ctx)
        {
            _ctx = ctx;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ServiceDto>>> GetAll()
        {
            var list = await _ctx.Services
                .Where(s => s.IsActive)
                .Select(s => new ServiceDto(s.Key, s.Label))
                .ToListAsync();

            return Ok(list);
        }
    }

    public record ServiceDto(string Key, string Label);
}
