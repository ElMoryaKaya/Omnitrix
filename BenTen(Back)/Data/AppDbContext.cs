using Microsoft.EntityFrameworkCore;
using omnitrix.Models;

namespace omnitrix.Data
{
    public class AppDbContext : DbContext
    {
        protected readonly IConfiguration Configuration;

        public AppDbContext(IConfiguration configuration)
        {
            Configuration = configuration;
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        => modelBuilder.UseIdentityByDefaultColumns();

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseNpgsql(Configuration.GetConnectionString("bdd"));
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Bracelet> Bracelets { get; set; }
        public DbSet<GpsAlert> GpsAlerts { get; set; }
    }
}
