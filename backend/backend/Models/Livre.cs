using System.Text.Json.Serialization;

namespace backend.Models
{
    public class Livre
    {
        public int Id { get; set; }
        public string Titre { get; set; }
        public string Auteur { get; set; }
        public string Editeur { get; set; }
        public string Genre { get; set; }
        public int AnneePublication { get; set; }
        public int ExemplairesDisponibles { get; set; }
        public DateTime DateCreation { get; set; }
        public DateTime? DateMiseAJour { get; set; }
        public string? ImageUrl { get; set; } // Make this nullable
        // Relation : un livre peut être emprunté plusieurs fois
        [JsonIgnore]
        public ICollection<Emprunt> Emprunts { get; set; } = new List<Emprunt>();
    }
}
