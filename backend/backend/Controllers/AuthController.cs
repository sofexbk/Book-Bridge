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
        if (await _context.Utilisateurs.AnyAsync(u => u.Email == request.Email))
        {
            return BadRequest(new { Message = "Email déjà utilisé." });
        }

        var utilisateur = new Utilisateur
        {
            Email = request.Email,
            MotDePasse = BCrypt.Net.BCrypt.HashPassword(request.MotDePasse),
            Prenom = request.Prenom,
            Nom = request.Nom,
            Role = RoleUtilisateur.Lecteur
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

        var token = JwtHelper.GenerateToken(utilisateur.Id, utilisateur.Role.ToString());

        var response = new
        {
            userId = utilisateur.Id,
            Token = token,
            Email = utilisateur.Email,
            Prenom = utilisateur.Prenom,
            Nom = utilisateur.Nom,
            Role = utilisateur.Role.ToString()
        };

        return Ok(response);
    }

    [Authorize(Roles = "Bibliothecaire")]
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        try
        {
            var utilisateurs = await _context.Utilisateurs
                .Select(u => new
                {
                    u.Id,
                    u.Email,
                    u.Prenom,
                    u.Nom,
                    Role = u.Role.ToString()
                })
                .ToListAsync();

            return Ok(utilisateurs);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Une erreur est survenue lors de la récupération des utilisateurs.", Error = ex.Message });
        }
    }

    [Authorize(Roles = "Bibliothecaire")]
    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var utilisateur = await _context.Utilisateurs.FindAsync(id);

        if (utilisateur == null)
        {
            return NotFound(new { Message = "Utilisateur introuvable." });
        }

        _context.Utilisateurs.Remove(utilisateur);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Utilisateur supprimé avec succès." });
    }

    [Authorize(Roles = "Bibliothecaire")]
    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request)
    {
        var utilisateur = await _context.Utilisateurs.FindAsync(id);

        if (utilisateur == null)
        {
            return NotFound(new { Message = "Utilisateur introuvable." });
        }

        utilisateur.Prenom = request.Prenom;
        utilisateur.Nom = request.Nom;
        utilisateur.Email = request.Email;


  
        _context.Utilisateurs.Update(utilisateur);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Utilisateur mis à jour avec succès." });
    }

    [Authorize(Roles = "Bibliothecaire")]
    [HttpGet("users/{id}")]
    public async Task<IActionResult> GetUserById(int id)
    {
        var utilisateur = await _context.Utilisateurs
            .Where(u => u.Id == id)
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.Prenom,
                u.Nom,
                Role = u.Role.ToString()
            })
            .FirstOrDefaultAsync();

        if (utilisateur == null)
        {
            return NotFound(new { Message = "Utilisateur introuvable." });
        }

        return Ok(utilisateur);
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

public class UpdateUserRequest
{
    public string Email { get; set; }
    public string Prenom { get; set; }
    public string Nom { get; set; }
}
