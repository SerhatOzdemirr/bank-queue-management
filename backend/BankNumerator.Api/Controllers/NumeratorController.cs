using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BankNumerator.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NumeratorController : ControllerBase
    {
        private static readonly Dictionary<string,int> Counters = new();



    public static void ClearCounters() => Counters.Clear();

        [HttpGet("next")]
        public IActionResult GetNext([FromQuery] string service)
        {
            if (!Counters.ContainsKey(service)) Counters[service] = 0;
            Counters[service]++;
            return Ok(new { number = Counters[service] });
        }
    }
}
