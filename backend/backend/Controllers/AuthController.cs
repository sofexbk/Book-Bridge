using backend.Db;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] UtilisateurRegisterRequest request)
    {
        // Vérifier si l'email est déjà utilisé
        if (await _context.Utilisateurs.AnyAsync(u => u.Email == request.Email))
        {
            return BadRequest(new { Message = "Email déjà utilisé." });
        }

        // Créer un nouvel utilisateur avec le rôle Lecteur
        var utilisateur = new Utilisateur
        {
            Email = request.Email,
            MotDePasse = BCrypt.Net.BCrypt.HashPassword(request.MotDePasse),
            Prenom = request.Prenom,
            Nom = request.Nom,
            Role = RoleUtilisateur.Lecteur // Rôle par défaut
        };

        _context.Utilisateurs.Add(utilisateur);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Utilisateur enregistré avec succès." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var utilisateur = await _context.Utilisateurs
            .SingleOrDefaultAsync(u => u.Email == request.Email);

        if (utilisateur == null || !BCrypt.Net.BCrypt.Verify(request.MotDePasse, utilisateur.MotDePasse))
        {
            return Unauthorized("Identifiants incorrects.");
        }

        // Générer le token JWT
        var token = JwtHelper.GenerateToken(utilisateur.Id, utilisateur.Role.ToString());

        // Retourner les informations nécessaires
        var response = new
        {
            userId=utilisateur.Id,
            Token = token,
            Email = utilisateur.Email,
            Prenom = utilisateur.Prenom,
            Nom = utilisateur.Nom,
            Role = utilisateur.Role.ToString() // Retourner le nom du rôle (par exemple, "Lecteur")
        };

        return Ok(response);
    }
    [Authorize(Roles = "Bibliothecaire")] // Restreindre l'accès aux rôles spécifiques
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        try
        {
            // Récupérer tous les utilisateurs
            var utilisateurs = await _context.Utilisateurs
                .Select(u => new
                {
                    u.Id,
                    u.Email,
                    u.Prenom,
                    u.Nom,
                    Role = u.Role.ToString() // Convertir le rôle en chaîne de caractères
                })
                .ToListAsync();

            return Ok(utilisateurs);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Une erreur est survenue lors de la récupération des utilisateurs.", Error = ex.Message });
        }
    }
}

public class LoginRequest
{
    public string Email { get; set; }
    public string MotDePasse { get; set; }
}

public class UtilisateurRegisterRequest
{
    public string Email { get; set; }
    public string MotDePasse { get; set; }
    public string Prenom { get; set; }
    public string Nom { get; set; }
}
