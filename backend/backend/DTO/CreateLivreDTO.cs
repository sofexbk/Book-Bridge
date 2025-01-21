using System.ComponentModel.DataAnnotations;

namespace backend.DTO
{
    public class CreateLivreDTO  // Nouveau DTO spécifique pour la création
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Le titre est requis")]
        public string Titre { get; set; }

        [Required(ErrorMessage = "L'auteur est requis")]
        public string Auteur { get; set; }

        [Required(ErrorMessage = "L'éditeur est requis")]
        public string Editeur { get; set; }

        [Required(ErrorMessage = "Le genre est requis")]
        public string Genre { get; set; }

        [Range(1000, 9999, ErrorMessage = "L'année de publication doit être valide")]
        public int AnneePublication { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Le nombre d'exemplaires doit être positif")]
        public int ExemplairesDisponibles { get; set; }

        public DateTime DateCreation { get; set; }
        public DateTime? DateMiseAJour { get; set; }
    }
}