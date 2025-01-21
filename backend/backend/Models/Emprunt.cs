using System.Text.Json.Serialization;

namespace backend.Models
{
    public class Emprunt
    {
        public int Id { get; set; }

        // Relation avec Livre
        public int LivreId { get; set; } // FK explicite

        // Relation avec Utilisateur
        public int UtilisateurId { get; set; } // FK explicite
        public Utilisateur Utilisateur { get; set; } // Navigation

        public DateTime DateEmprunt { get; set; }
        public DateTime DateRetourPrevue { get; set; }
        public DateTime? DateRetourEffective { get; set; }
        public bool EstRetourne { get; set; }
        [JsonIgnore]
        public Livre Livre { get; set; }
    }

}
