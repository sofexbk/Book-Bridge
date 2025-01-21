namespace backend.DTO
{
    public class LivreDTO
    {
        public int Id { get; set; }
        public string Titre { get; set; }
        public string Auteur { get; set; }
        public string Editeur { get; set; }
        public string Genre { get; set; }
        public int AnneePublication { get; set; }
        public int ExemplairesDisponibles { get; set; }
        public string? ImageUrl { get; set; }  // Le chemin relatif ou l'URL de l'image
        public DateTime DateCreation { get; set; }
        public DateTime? DateMiseAJour { get; set; }
    }
}
