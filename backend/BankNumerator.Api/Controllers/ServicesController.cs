using Microsoft.AspNetCore.Mvc;
using BankNumerator.Api.Services.Interfaces;

namespace BankNumerator.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServicesController : ControllerBase
    {
        private readonly IServicesService _svc;

        public ServicesController(IServicesService svc) => _svc = svc;

        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken ct)
            => Ok(await _svc.GetAllAsync(ct));
    }
}
