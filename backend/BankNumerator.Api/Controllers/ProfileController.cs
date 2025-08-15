using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using BankNumerator.Api.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BankNumerator.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly IProfileService _profileService;

        public ProfileController(IProfileService profileService)
        {
            _profileService = profileService;
        }

        [HttpGet]
        public async Task<IActionResult> GetProfile(CancellationToken ct)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || string.IsNullOrWhiteSpace(userIdClaim.Value))
            {
                return Unauthorized("User ID not found in token");
            }

            if (!int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized("Invalid User ID format");
            }

            var profile = await _profileService.GetProfileAsync(userId, ct);

            if (profile == null)
                return NotFound("Profile not found");

            return Ok(profile);
        }
        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto, CancellationToken ct)
        {
            var idValue =
                User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("nameid");

            if (!int.TryParse(idValue, out var userId))
                return Unauthorized("Invalid User ID");

            var updated = await _profileService.UpdateProfileAsync(userId, dto, ct);

            return updated ? NoContent() : NotFound("Profile not found");
        }
    }
}
