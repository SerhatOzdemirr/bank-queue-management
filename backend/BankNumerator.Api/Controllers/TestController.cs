// Controllers/TestController.cs
using Microsoft.AspNetCore.Mvc;
using BankNumerator.Api.Data;
using System.Threading.Tasks;

namespace BankNumerator.Api.Controllers
{
#if DEBUG
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly BankNumeratorContext _ctx;

        public TestController(BankNumeratorContext ctx)
        {
            _ctx = ctx;
        }

        [HttpPost("reset")]
        public async Task<IActionResult> ResetQueue()
        {
            // Tüm servis sayaçlarını temizle
            _ctx.Counters.RemoveRange(_ctx.Counters);
            await _ctx.SaveChangesAsync();
            return Ok(new { reset = true });
        }
    }
#endif
}
