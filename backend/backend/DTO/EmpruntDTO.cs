namespace backend.DTO
{
    public class EmpruntDTO
    {
        public int Id { get; set; }
        public int LivreId { get; set; }
        public string TitreLivre { get; set; } // Only include relevant book info
        public int UtilisateurId { get; set; }
        public string NomUtilisateur { get; set; } // Only include relevant user info
        public DateTime DateEmprunt { get; set; }
        public DateTime DateRetourPrevue { get; set; }
        public DateTime? DateRetourEffective { get; set; }
        public bool EstRetourne { get; set; }
    }

}
