namespace backend.Models
{
    public class Utilisateur
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string MotDePasse { get; set; }
        public string Prenom { get; set; }
        public string Nom { get; set; }
        public RoleUtilisateur Role { get; set; }
        // Relation : un utilisateur peut avoir plusieurs emprunts
        public ICollection<Emprunt> Emprunts { get; set; } = new List<Emprunt>();
    }
}
