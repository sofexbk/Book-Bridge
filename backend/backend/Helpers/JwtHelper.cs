using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

public static class JwtHelper
{
    private const string SecretKey = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0";

    public static string GenerateToken(int userId, string role)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(SecretKey);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
            new Claim("userid", userId.ToString()),
            new Claim(ClaimTypes.Role, role)  // Ajout du rôle dans les claims
        }),
            Expires = DateTime.UtcNow.AddHours(2),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);

        var logger = LoggerFactory.Create(builder => builder.AddConsole()).CreateLogger("JwtHelper");
        logger.LogInformation("Token généré pour l'utilisateur {0} avec le rôle {1}.", userId, role);

        return tokenHandler.WriteToken(token);
    }

}

