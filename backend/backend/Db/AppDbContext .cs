namespace backend.Db
{
    using backend.Models;
    using Microsoft.EntityFrameworkCore;

    public class AppDbContext : DbContext
    {
        public DbSet<Livre> Livres { get; set; }
        public DbSet<Utilisateur> Utilisateurs { get; set; }
        public DbSet<Emprunt> Emprunts { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Utilisateur>().HasIndex(u => u.Email).IsUnique();
            // Relation Emprunt -> Utilisateur
            modelBuilder.Entity<Emprunt>()
                .HasOne(e => e.Utilisateur)
                .WithMany(u => u.Emprunts)
                .HasForeignKey(e => e.UtilisateurId)
                .OnDelete(DeleteBehavior.Cascade);

            // Relation Emprunt -> Livre
            modelBuilder.Entity<Emprunt>()
                .HasOne(e => e.Livre)
                .WithMany(l => l.Emprunts)
                .HasForeignKey(e => e.LivreId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

}
