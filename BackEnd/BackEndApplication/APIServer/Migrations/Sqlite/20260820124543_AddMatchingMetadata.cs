using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace APIServer.Migrations.Sqlite
{
    /// <inheritdoc />
    public partial class AddMatchingMetadata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MatchingEligibilityReason",
                table: "CVMatchings",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MatchingEligibilityStatus",
                table: "CVMatchings",
                type: "TEXT",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "MatchingEvaluatedAtUtc",
                table: "CVMatchings",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MatchingExplanation",
                table: "CVMatchings",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MatchingFailureReason",
                table: "CVMatchings",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MatchingModel",
                table: "CVMatchings",
                type: "TEXT",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MatchingProvider",
                table: "CVMatchings",
                type: "TEXT",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MatchingRulesVersion",
                table: "CVMatchings",
                type: "TEXT",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MatchingStatus",
                table: "CVMatchings",
                type: "TEXT",
                maxLength: 30,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MatchingEligibilityReason",
                table: "CVMatchings");

            migrationBuilder.DropColumn(
                name: "MatchingEligibilityStatus",
                table: "CVMatchings");

            migrationBuilder.DropColumn(
                name: "MatchingEvaluatedAtUtc",
                table: "CVMatchings");

            migrationBuilder.DropColumn(
                name: "MatchingExplanation",
                table: "CVMatchings");

            migrationBuilder.DropColumn(
                name: "MatchingFailureReason",
                table: "CVMatchings");

            migrationBuilder.DropColumn(
                name: "MatchingModel",
                table: "CVMatchings");

            migrationBuilder.DropColumn(
                name: "MatchingProvider",
                table: "CVMatchings");

            migrationBuilder.DropColumn(
                name: "MatchingRulesVersion",
                table: "CVMatchings");

            migrationBuilder.DropColumn(
                name: "MatchingStatus",
                table: "CVMatchings");
        }
    }
}
