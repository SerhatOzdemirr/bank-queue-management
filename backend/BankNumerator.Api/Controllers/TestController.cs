using Microsoft.AspNetCore.Mvc;

namespace BankNumerator.Api.Controllers
{
#if DEBUG
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        [HttpPost("reset")]
        public IActionResult ResetQueue()
        {
            NumeratorController.ClearCounters();
            return Ok(new { reset = true });
        }
    }
#endif
}
