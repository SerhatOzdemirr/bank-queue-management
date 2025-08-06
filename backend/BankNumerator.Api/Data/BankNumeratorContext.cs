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
        public DbSet<Agent> Agents { get; set; } = null!;
        public DbSet<AgentSkill> AgentSkills { get; set; } = null!;
        public DbSet<TicketAssignment> TicketAssignments { get; set; } = null!;
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
            modelBuilder.Entity<User>()
                .Property(u => u.PriorityScore)
                .HasDefaultValue(0);
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


            modelBuilder.Entity<Agent>(builder =>
            {
                builder.ToTable("Agents");
                builder.HasKey(a => a.Id);
                builder.Property(a => a.Id)
                    .UseIdentityByDefaultColumn();  
                builder.Property(a => a.UserId).IsRequired();
                builder.HasOne(a => a.User)
                       .WithMany()
                       .HasForeignKey(a => a.UserId)
                       .OnDelete(DeleteBehavior.Cascade);
            });

            // --- AgentSkill composite key ---
            modelBuilder.Entity<AgentSkill>(builder =>
            {
                builder.ToTable("AgentSkills");
                builder.HasKey(s => new { s.AgentId, s.ServiceKey });
                builder.Property(s => s.ServiceKey).HasMaxLength(100).IsRequired();
                builder.HasOne(s => s.Agent)
                       .WithMany(a => a.Skills)
                       .HasForeignKey(s => s.AgentId)
                       .OnDelete(DeleteBehavior.Cascade);
            });

            // --- TicketAssignment composite key and relations ---
            modelBuilder.Entity<TicketAssignment>(builder =>
            {
                builder.ToTable("TicketAssignments");
                builder.HasKey(ta => new { ta.TicketId, ta.AgentId });
                builder.Property(ta => ta.AssignedAt).IsRequired();
                builder.Property(ta => ta.Status).HasMaxLength(20).HasDefaultValue("Pending");
                builder.HasOne(ta => ta.Ticket)
                       .WithMany()  
                       .HasForeignKey(ta => ta.TicketId)
                       .OnDelete(DeleteBehavior.Cascade);
                builder.HasOne(ta => ta.Agent)
                       .WithMany(a => a.Assignments)
                       .HasForeignKey(ta => ta.AgentId)
                       .OnDelete(DeleteBehavior.Cascade);
            });

        }
    }
}
