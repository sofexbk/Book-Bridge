using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class MigrationAddedLinks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LivreId1",
                table: "Emprunts",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UtilisateurId1",
                table: "Emprunts",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Emprunts_LivreId1",
                table: "Emprunts",
                column: "LivreId1");

            migrationBuilder.CreateIndex(
                name: "IX_Emprunts_UtilisateurId1",
                table: "Emprunts",
                column: "UtilisateurId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Emprunts_Livres_LivreId1",
                table: "Emprunts",
                column: "LivreId1",
                principalTable: "Livres",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Emprunts_Utilisateurs_UtilisateurId1",
                table: "Emprunts",
                column: "UtilisateurId1",
                principalTable: "Utilisateurs",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Emprunts_Livres_LivreId1",
                table: "Emprunts");

            migrationBuilder.DropForeignKey(
                name: "FK_Emprunts_Utilisateurs_UtilisateurId1",
                table: "Emprunts");

            migrationBuilder.DropIndex(
                name: "IX_Emprunts_LivreId1",
                table: "Emprunts");

            migrationBuilder.DropIndex(
                name: "IX_Emprunts_UtilisateurId1",
                table: "Emprunts");

            migrationBuilder.DropColumn(
                name: "LivreId1",
                table: "Emprunts");

            migrationBuilder.DropColumn(
                name: "UtilisateurId1",
                table: "Emprunts");
        }
    }
}
