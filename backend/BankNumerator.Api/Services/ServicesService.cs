using BankNumerator.Api.Data;
using BankNumerator.Api.Models;
using BankNumerator.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BankNumerator.Api.Services
{
    public sealed class ServicesService : IServicesService
    {
        private readonly BankNumeratorContext _ctx;

        public ServicesService(BankNumeratorContext ctx) => _ctx = ctx;

      public async Task<IReadOnlyList<ServiceDto>> GetAllAsync(CancellationToken ct = default)
{
    var query =
        from s in _ctx.Services.AsNoTracking()
        where s.IsActive
        join c in _ctx.Counters.AsNoTracking()
            on s.Key equals c.ServiceKey into gj
        select new ServiceDto
        {
            Id           = s.Id,
            ServiceKey   = s.Key,
            Label        = s.Label,
            IsActive     = s.IsActive,
            MaxNumber    = s.MaxNumber,
            CurrentNumber = gj.Max(x => (int?)x.CurrentNumber) ?? 0
        };

    return await query.ToListAsync(ct);
}

    }
}
