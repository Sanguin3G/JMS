using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace APIServer.Migrations.Sqlite;

public partial class AddBilingualHelp : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(name: "QuestionEn", table: "FaqEntries", type: "TEXT", maxLength: 200, nullable: true);
        migrationBuilder.AddColumn<string>(name: "AnswerEn", table: "FaqEntries", type: "TEXT", maxLength: 4000, nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "QuestionEn", table: "FaqEntries");
        migrationBuilder.DropColumn(name: "AnswerEn", table: "FaqEntries");
    }
}
