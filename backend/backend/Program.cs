using backend.Db;
using backend.Helpers;
using backend.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder
            .SetIsOriginAllowed(_ => true)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Ajouter le service de logging
builder.Services.AddLogging(options =>
{
    options.AddConsole();  // Vous pouvez aussi ajouter d'autres providers de logs comme Debug ou File
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0")),
            RoleClaimType = ClaimTypes.Role // Indiquez que les rôles sont contenus dans le type `Role`
        };

        // Ajouter des logs dans le processus de validation du token
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                logger.LogError("L'authentification a échoué: {0}", context.Exception.Message);
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                logger.LogInformation("Token validé avec succès pour l'utilisateur {0}.", context.Principal?.Identity?.Name);
                return Task.CompletedTask;
            }
        };
    });
// Ajouter les services nécessaires pour Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "API Livre",
        Version = "v1",
        Description = "API pour gérer les livres dans la bibliothèque"
    });

    // Add the custom operation filter
    options.OperationFilter<FileUploadOperationFilter>();
});

// Continuer avec la configuration des autres services
builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();
// Ajouter un bibliothécaire par défaut si ce n'est pas déjà fait
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    // Vérifier si un bibliothécaire existe déjà
    if (!dbContext.Utilisateurs.Any(u => u.Role == RoleUtilisateur.Bibliothecaire))
    {
        // Créer un nouvel utilisateur Bibliothécaire
        var bibliothecaire = new Utilisateur
        {
            Email = "bibliothecaire@example.com",
            MotDePasse = BCrypt.Net.BCrypt.HashPassword("password123"),
            Prenom = "Marie",
            Nom = "Lemoine",
            Role = RoleUtilisateur.Bibliothecaire
        };
        dbContext.Utilisateurs.Add(bibliothecaire);
        dbContext.SaveChanges();
    }
}



app.UseCors();

// Ajoutez un logger pour toute la demande HTTP
app.UseMiddleware<RequestLoggingMiddleware>();
app.UseStaticFiles();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
// Activer Swagger et Swagger UI
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();  // Génère la documentation de l'API
    app.UseSwaggerUI();  // Affiche Swagger UI
}
app.MapControllers();
app.Run();
