using backend.Db;
using backend.DTO;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LivreController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<LivreController> _logger;
        private readonly string _imagePath;

        public LivreController(AppDbContext context, ILogger<LivreController> logger)
        {
            _context = context;
            _logger = logger;
            _imagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
        }

        // Récupérer la liste de tous les livres (accessible par tous les utilisateurs)
        [HttpGet]
        public async Task<IActionResult> GetLivres()
        {
            var livres = await _context.Livres
                .Select(l => new LivreDTO
                {
                    Id = l.Id,
                    Titre = l.Titre,
                    Auteur = l.Auteur,
                    Editeur = l.Editeur,
                    Genre = l.Genre,
                    AnneePublication = l.AnneePublication,
                    ExemplairesDisponibles = l.ExemplairesDisponibles,
                    DateCreation = l.DateCreation,
                    DateMiseAJour = l.DateMiseAJour,
                    ImageUrl = l.ImageUrl
                })
                .ToListAsync();

            return Ok(livres);
        }

        // Récupérer un livre par son ID (accessible par tous les utilisateurs)
        [HttpGet("{id}")]
        public async Task<IActionResult> GetLivre(int id)
        {
            var livre = await _context.Livres
                .Where(l => l.Id == id)
                .Select(l => new LivreDTO
                {
                    Id = l.Id,
                    Titre = l.Titre,
                    Auteur = l.Auteur,
                    Editeur = l.Editeur,
                    Genre = l.Genre,
                    AnneePublication = l.AnneePublication,
                    ExemplairesDisponibles = l.ExemplairesDisponibles,
                    DateCreation = l.DateCreation,
                    DateMiseAJour = l.DateMiseAJour,
                    ImageUrl = l.ImageUrl
                })
                .FirstOrDefaultAsync();

            if (livre == null)
            {
                return NotFound("Livre non trouvé.");
            }

            return Ok(livre);
        }

        [Authorize(Roles = "Bibliothecaire")]
        [HttpPost]
        public async Task<IActionResult> AjouterLivre([FromForm] LivreDTO livreDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    foreach (var key in ModelState.Keys)
                    {
                        var errors = ModelState[key].Errors;
                        foreach (var error in errors)
                        {
                            System.Console.WriteLine($"Validation failed for {key}: {error.ErrorMessage}");
                        }
                    }
                    return BadRequest(new ValidationProblemDetails(ModelState));
                }


                // Récupérer le fichier image depuis la requête
                var imageFile = Request.Form.Files.GetFile("ImageUrl");
                string? imageUrl = null;

                if (imageFile != null && imageFile.Length > 0)
                {
                    // Validate image format
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
                    var extension = Path.GetExtension(imageFile.FileName).ToLowerInvariant();
                    if (!allowedExtensions.Contains(extension))
                    {
                        ModelState.AddModelError("ImageUrl", "Format d'image non supporté. Utilisez JPG ou PNG");
                        return BadRequest(new ValidationProblemDetails(ModelState));
                    }

                    imageUrl = await UploadImageAsync(imageFile);
                    if (imageUrl == null)
                    {
                        return StatusCode(500, new { message = "Échec du téléchargement de l'image" });
                    }
                }

                var livre = new Livre
                {
                    Titre = livreDto.Titre,
                    Auteur = livreDto.Auteur,
                    Editeur = livreDto.Editeur,
                    Genre = livreDto.Genre,
                    AnneePublication = livreDto.AnneePublication,
                    ExemplairesDisponibles = livreDto.ExemplairesDisponibles,
                    ImageUrl = imageUrl,
                    DateCreation = DateTime.UtcNow
                };

                _context.Livres.Add(livre);
                await _context.SaveChangesAsync();

                livreDto.Id = livre.Id;
                livreDto.ImageUrl = livre.ImageUrl;
                livreDto.DateCreation = livre.DateCreation;

                return CreatedAtAction(nameof(GetLivre), new { id = livre.Id }, livreDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'ajout d'un livre");
                return StatusCode(500, new { message = "Une erreur est survenue lors de l'ajout du livre" });
            }
        }

        private async Task<string> UploadImageAsync(IFormFile image)
        {
            try
            {
                if (!Directory.Exists(_imagePath))
                {
                    Directory.CreateDirectory(_imagePath);
                }

                var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(image.FileName)}";
                var filePath = Path.Combine(_imagePath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                return $"/images/{fileName}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors du téléchargement de l'image.");
                return null;
            }
        }

        [Authorize(Roles = "Bibliothecaire")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLivre(int id, [FromForm] LivreDTO updatedLivreDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Données invalides. Erreurs : {@ModelStateErrors}", ModelState.Values.SelectMany(v => v.Errors));
                    return BadRequest("Données invalides.");
                }

                var livre = await _context.Livres.FindAsync(id);
                if (livre == null)
                {
                    _logger.LogWarning("Livre non trouvé avec l'ID : {Id}", id);
                    return NotFound("Livre non trouvé.");
                }

                // Récupérer le fichier image depuis la requête
                var imageFile = Request.Form.Files.GetFile("ImageUrl");
                string? newImageUrl = null;

                if (imageFile != null && imageFile.Length > 0)
                {
                    // Validate image format
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
                    var extension = Path.GetExtension(imageFile.FileName).ToLowerInvariant();
                    if (!allowedExtensions.Contains(extension))
                    {
                        ModelState.AddModelError("ImageUrl", "Format d'image non supporté. Utilisez JPG ou PNG");
                        return BadRequest(new ValidationProblemDetails(ModelState));
                    }

                    // Supprimer l'ancienne image si elle existe
                    if (!string.IsNullOrEmpty(livre.ImageUrl))
                    {
                        DeleteImage(livre.ImageUrl);
                    }

                    // Télécharger la nouvelle image
                    newImageUrl = await UploadImageAsync(imageFile);
                    if (newImageUrl == null)
                    {
                        return StatusCode(500, new { message = "Échec du téléchargement de l'image" });
                    }

                    livre.ImageUrl = newImageUrl;
                }

                // Mettre à jour les autres propriétés du livre
                livre.Titre = updatedLivreDto.Titre;
                livre.Auteur = updatedLivreDto.Auteur;
                livre.Editeur = updatedLivreDto.Editeur;
                livre.Genre = updatedLivreDto.Genre;
                livre.AnneePublication = updatedLivreDto.AnneePublication;
                livre.ExemplairesDisponibles = updatedLivreDto.ExemplairesDisponibles;
                livre.DateMiseAJour = DateTime.UtcNow;

                _context.Livres.Update(livre);
                await _context.SaveChangesAsync();

                // Mettre à jour le DTO avec les nouvelles valeurs
                updatedLivreDto.ImageUrl = livre.ImageUrl;
                updatedLivreDto.DateMiseAJour = livre.DateMiseAJour;

                _logger.LogInformation("Livre mis à jour avec succès. ID : {Id}", id);
                return Ok(updatedLivreDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du livre");
                return StatusCode(500, new { message = "Une erreur est survenue lors de la mise à jour du livre" });
            }
        }

        private void DeleteImage(string imageUrl)
        {
            try
            {
                if (!string.IsNullOrEmpty(imageUrl))
                {
                    var imagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", imageUrl.TrimStart('/'));
                    if (System.IO.File.Exists(imagePath))
                    {
                        System.IO.File.Delete(imagePath);
                        _logger.LogInformation("Ancienne image supprimée : {ImagePath}", imagePath);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de l'ancienne image.");
            }
        }

        // Supprimer un livre (accessible seulement par un Bibliothécaire)
        [Authorize(Roles = "Bibliothecaire")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLivre(int id)
        {
            var livre = await _context.Livres.FindAsync(id);
            if (livre == null)
            {
                return NotFound("Livre non trouvé.");
            }

            _context.Livres.Remove(livre);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("search")]
        public IActionResult SearchBooks(
            [FromQuery] string? titre,
            [FromQuery] string? auteur,
            [FromQuery] string? genre,
            [FromQuery] int? anneePublication,
            [FromQuery] bool? disponiblesUniquement)
        {
            // Construire la requête de recherche
            var query = _context.Livres.AsQueryable();

            if (!string.IsNullOrEmpty(titre))
            {
                query = query.Where(l => l.Titre.Contains(titre));
            }

            if (!string.IsNullOrEmpty(auteur))
            {
                query = query.Where(l => l.Auteur.Contains(auteur));
            }

            if (!string.IsNullOrEmpty(genre))
            {
                query = query.Where(l => l.Genre.Contains(genre));
            }

            if (anneePublication.HasValue)
            {
                query = query.Where(l => l.AnneePublication == anneePublication.Value);
            }

            if (disponiblesUniquement.HasValue && disponiblesUniquement.Value)
            {
                query = query.Where(l => l.ExemplairesDisponibles > 0);
            }

            var result = query.Select(l => new
            {
                l.Id,
                l.Titre,
                l.Auteur,
                l.Editeur,
                l.Genre,
                l.AnneePublication,
                l.ExemplairesDisponibles,
                l.DateCreation,
                l.DateMiseAJour,
                l.ImageUrl
            }).ToList();

            return Ok(result);
        }

        // Méthode pour télécharger une image pour un livre
        /*[HttpPost("upload-image/{id}")]
        public async Task<IActionResult> UploadImage(int id, [FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("Aucune image à télécharger.");
            }

            var livre = await _context.Livres.FindAsync(id);
            if (livre == null)
            {
                return NotFound("Livre non trouvé.");
            }

            var imageUrl = await UploadImageAsync(file);
            if (imageUrl == null)
            {
                return StatusCode(500, "Erreur lors du téléchargement de l'image.");
            }

            livre.ImageUrl = imageUrl;
            await _context.SaveChangesAsync();

            return Ok(new { imageUrl });
        }*/
    }
}