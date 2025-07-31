// Data/BankNumeratorContext.cs
using Microsoft.EntityFrameworkCore;
using BankNumerator.Api.Models;

namespace BankNumerator.Api.Data
{
    public class BankNumeratorContext : DbContext
    {
        public BankNumeratorContext(DbContextOptions<BankNumeratorContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<ServiceItem> Services { get; set; } = null!;
        public DbSet<ServiceCounter> Counters { get; set; } = null!;
        public DbSet<Ticket> Tickets { get; set; } = null!;
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Email alanı benzersiz olsun
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
            // Role sütunu için varsayılan değer
            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasDefaultValue(User.UserRole.Default);

            // ServiceItem seed data
            modelBuilder.Entity<ServiceItem>().ToTable("Services");
            modelBuilder.Entity<ServiceItem>()
                .Property(s => s.MaxNumber)
                .HasDefaultValue(100);
            modelBuilder.Entity<ServiceItem>().HasData(
                new ServiceItem { Id = 1, Key = "withdrawal", Label = "Cash Withdrawal", IsActive = true },
                new ServiceItem { Id = 2, Key = "deposit", Label = "Cash Deposit", IsActive = true },
                new ServiceItem { Id = 3, Key = "account", Label = "Open Account", IsActive = true },
                new ServiceItem { Id = 4, Key = "card", Label = "Credit Card", IsActive = true },
                new ServiceItem { Id = 5, Key = "loan", Label = "Loan Application", IsActive = true },
                new ServiceItem { Id = 6, Key = "transfer", Label = "Money Transfer", IsActive = true },
                new ServiceItem { Id = 7, Key = "exchange", Label = "Currency Exchange", IsActive = true },
                new ServiceItem { Id = 8, Key = "support", Label = "Customer Support", IsActive = true }
            );

            // ServiceCounter table
            modelBuilder.Entity<ServiceCounter>()
                .ToTable("Counters")
                .HasKey(c => c.ServiceKey);

            modelBuilder.Entity<Ticket>(builder =>
    {
        // Tablo adı
        builder.ToTable("Tickets");

        // 1) Id sütununu PK ve identity yap
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id)
               .UseIdentityByDefaultColumn(); // PostgreSQL için identity

        // 2) Diğer alanlar
        builder.Property(t => t.Number)
               .IsRequired();

        builder.Property(t => t.ServiceKey)
               .HasMaxLength(100)
               .IsRequired();

        builder.Property(t => t.ServiceLabel)
               .IsRequired();

        builder.Property(t => t.TakenAt)
               .IsRequired();

        builder.Property(t => t.UserId)
               .IsRequired();

        // 3) User ilişkisi (FK)
        builder.HasOne(t => t.User)
               .WithMany()                   // eğer User’ın Ticket koleksiyonu yoksa
               .HasForeignKey(t => t.UserId)
               .OnDelete(DeleteBehavior.Cascade);
    });

        }
    }
}
