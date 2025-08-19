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

        private int GetCurrentUserId()
        {
            var uid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(uid, out var userId) ? userId : 0;
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
        // GET /profile/statistics
        [HttpGet("statistics")]
        public async Task<IActionResult> GetProfileStatistics(CancellationToken ct = default)
        {
            var dto = await _profileService.GetProfileStatisticsAsync(GetCurrentUserId(), ct);
            if (dto == null) return Unauthorized();
            return Ok(dto);
        }

        // GET /profile/ticket-history
        [HttpGet("ticket-history")]
        public async Task<IActionResult> GetTicketHistory(CancellationToken ct = default)
        {
            var history = await _profileService.GetTicketHistoryAsync(GetCurrentUserId(), ct);
            if (history == null) return Unauthorized();
            return Ok(history);
        }
        
        [HttpPost("avatar")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(2 * 1024 * 1024)] // 2MB
        public async Task<IActionResult> UploadAvatar([FromForm] IFormFile avatar, CancellationToken ct)
        {
            if (avatar == null) return BadRequest("No file");

            var url = await _profileService.UpdateAvatarAsync(GetCurrentUserId(), avatar, ct);
            if (url == null) return BadRequest("Upload failed");

            var absolute = $"{Request.Scheme}://{Request.Host}{url}";
            return Ok(new { url = absolute, relativeUrl = url });
        }
    }
}
