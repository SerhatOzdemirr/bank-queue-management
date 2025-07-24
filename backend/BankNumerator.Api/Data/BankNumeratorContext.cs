using Microsoft.EntityFrameworkCore;
using BankNumerator.Api.Models;

namespace BankNumerator.Api.Data
{
    public class BankNumeratorContext : DbContext
    {
        public BankNumeratorContext(DbContextOptions<BankNumeratorContext> options)
            : base(options) { }

        public DbSet<User> Users { get; set; }
    }
}
