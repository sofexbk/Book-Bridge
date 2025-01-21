using backend.Db;
using backend.DTO;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmpruntController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EmpruntController(AppDbContext context)
        {
            _context = context;
        }

        // Emprunter un livre
        [HttpPost("emprunt")]
        [Authorize(Roles = "Lecteur")]
        public async Task<IActionResult> EmprunterLivre([FromBody] EmpruntRequest request)
        {
            var livre = await _context.Livres.FindAsync(request.LivreId);
            var utilisateur = await _context.Utilisateurs.FindAsync(request.UtilisateurId);

            if (livre == null || utilisateur == null)
            {
                return BadRequest(new { Message = "Livre ou utilisateur non trouvé." });
            }

            if (livre.ExemplairesDisponibles <= 0)
            {
                return BadRequest(new { Message = "Aucun exemplaire disponible." });
            }

            var emprunt = new Emprunt
            {
                LivreId = request.LivreId,
                UtilisateurId = request.UtilisateurId,
                DateEmprunt = DateTime.UtcNow,
                DateRetourPrevue = DateTime.UtcNow.AddDays(14),//date d'emprunt par défaut, il faut pas dépasser 14 jours
                EstRetourne = false
            };

            livre.ExemplairesDisponibles -= 1; // Réduire le nombre d'exemplaires disponibles
            _context.Emprunts.Add(emprunt);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Livre emprunté avec succès." });
        }

        // Obtenir les emprunts d'un utilisateur
        [HttpGet("emprunts/{utilisateurId}")]
        [Authorize(Roles = "Lecteur")]
        public async Task<IActionResult> GetEmprunts(int utilisateurId)
        {
            var emprunts = await _context.Emprunts
                .Where(e => e.UtilisateurId == utilisateurId && !e.EstRetourne)
                .Include(e => e.Livre)
                .ToListAsync();

            return Ok(emprunts);
        }

        [HttpGet("livres/empruntes")]
        [Authorize(Roles = "Bibliothecaire")]
        public async Task<IActionResult> GetLivresEmpruntes()
        {
            // Récupérer tous les livres actuellement empruntés
            var livresEmpruntes = await _context.Emprunts
                .Where(e => !e.EstRetourne) // Filtrer les emprunts qui ne sont pas retournés
                .Include(e => e.Livre) // Inclure les informations sur les livres
                .ToListAsync();

            var livres = livresEmpruntes.Select(e => e.Livre).Distinct().ToList(); // Récupérer seulement les livres sans duplication

            return Ok(livres);
        }

        [HttpGet("emprunts/utilisateur/{utilisateurId}")]
        [Authorize(Roles = "Bibliothecaire")]
        public async Task<IActionResult> GetEmpruntsParUtilisateur(int utilisateurId)
        {
            var empruntsUtilisateur = await _context.Emprunts
                .Where(e => e.UtilisateurId == utilisateurId && !e.EstRetourne)
                .Include(e => e.Livre)
                .Include(e => e.Utilisateur)
                .ToListAsync();

            var empruntsDTO = empruntsUtilisateur.Select(e => new EmpruntDTO
            {
                Id = e.Id,
                LivreId = e.LivreId,
                TitreLivre = e.Livre.Titre,
                UtilisateurId = e.UtilisateurId,
                NomUtilisateur = e.Utilisateur.Prenom + " " + e.Utilisateur.Nom,
                DateEmprunt = e.DateEmprunt,
                DateRetourPrevue = e.DateRetourPrevue,
                EstRetourne = e.EstRetourne
            }).ToList();

            return Ok(empruntsDTO);
        }
        [HttpGet("emprunts")]
        [Authorize(Roles = "Bibliothecaire")] // Seuls les bibliothécaires peuvent accéder à cette méthode
        public async Task<IActionResult> GetAllEmprunts()
        {
            try
            {
                // Récupérer tous les emprunts avec les informations sur les livres et les utilisateurs
                var emprunts = await _context.Emprunts
                    .Include(e => e.Livre) // Inclure les informations sur le livre
                    .Include(e => e.Utilisateur) // Inclure les informations sur l'utilisateur
                    .Select(e => new EmpruntDTO
                    {
                        Id = e.Id,
                        LivreId = e.LivreId,
                        TitreLivre = e.Livre.Titre,
                        UtilisateurId = e.UtilisateurId,
                        NomUtilisateur = e.Utilisateur.Prenom + " " + e.Utilisateur.Nom,
                        DateEmprunt = e.DateEmprunt,
                        DateRetourPrevue = e.DateRetourPrevue,
                        DateRetourEffective = e.DateRetourEffective,
                        EstRetourne = e.EstRetourne
                    })
                    .ToListAsync();

                return Ok(emprunts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Une erreur est survenue lors de la récupération des emprunts.", Error = ex.Message });
            }
        }

        // Retourner un livre
        [HttpPut("emprunt/retour/{id}")]
        [Authorize(Roles = "Lecteur")]
        public async Task<IActionResult> RetournerLivre(int id)
        {
            var emprunt = await _context.Emprunts.FindAsync(id);

            if (emprunt == null)
            {
                return NotFound(new { Message = "Emprunt non trouvé." });
            }

            emprunt.DateRetourEffective = DateTime.UtcNow;
            emprunt.EstRetourne = true;

            var livre = await _context.Livres.FindAsync(emprunt.LivreId);
            livre.ExemplairesDisponibles += 1; // Ajouter l'exemplaire au stock

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Livre retourné avec succès." });
        }
    }
}
public class EmpruntRequest
{
    public int LivreId { get; set; }
    public int UtilisateurId { get; set; }
}

