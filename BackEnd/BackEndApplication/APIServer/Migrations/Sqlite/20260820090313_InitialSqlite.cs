using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace APIServer.Migrations.Sqlite
{
    /// <inheritdoc />
    public partial class InitialSqlite : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Admins",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserName = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    FullName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Password = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    PhoneNumber = table.Column<string>(type: "TEXT", maxLength: 10, nullable: true),
                    DOB = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    LastUpdateDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsDelete = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Admins", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CategoryName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    IsDelete = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EmploymentTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    IsDelete = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmploymentTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Genders",
                columns: table => new
                {
                    GenderId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Title = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Genders", x => x.GenderId);
                });

            migrationBuilder.CreateTable(
                name: "Levels",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Title = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    IsDelete = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Levels", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    IsDelete = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Sliders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Title = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    SubTitle = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    URL = table.Column<string>(type: "TEXT", nullable: true),
                    Order = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sliders", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Candidates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserName = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    FullName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Password = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    GenderId = table.Column<int>(type: "INTEGER", nullable: true),
                    PhoneNumber = table.Column<string>(type: "TEXT", maxLength: 10, nullable: true),
                    DOB = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    LastUpdateDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsDelete = table.Column<bool>(type: "INTEGER", nullable: false),
                    AvatarURL = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Candidates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Candidates_Genders_GenderId",
                        column: x => x.GenderId,
                        principalTable: "Genders",
                        principalColumn: "GenderId");
                });

            migrationBuilder.CreateTable(
                name: "Recuirters",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    FullName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    UserName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Password = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    GenderId = table.Column<int>(type: "INTEGER", nullable: true),
                    PhoneNumber = table.Column<string>(type: "TEXT", maxLength: 10, nullable: false),
                    DOB = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    LastUpdate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedBy = table.Column<int>(type: "INTEGER", nullable: true),
                    RoleId = table.Column<int>(type: "INTEGER", nullable: true),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsDelete = table.Column<bool>(type: "INTEGER", nullable: false),
                    AvatarURL = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Recuirters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Recuirters_Genders_GenderId",
                        column: x => x.GenderId,
                        principalTable: "Genders",
                        principalColumn: "GenderId");
                    table.ForeignKey(
                        name: "FK_Recuirters_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "CurriculumVitaes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CandidateId = table.Column<int>(type: "INTEGER", nullable: true),
                    CareerGoal = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    EmploymentTypeId = table.Column<int>(type: "INTEGER", nullable: true),
                    Phone = table.Column<string>(type: "TEXT", maxLength: 10, nullable: true),
                    DisplayName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    GenderId = table.Column<int>(type: "INTEGER", nullable: true),
                    DisplayEmail = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    Address = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    DOB = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    LastUpdateDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    LevelId = table.Column<int>(type: "INTEGER", nullable: true),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsDelete = table.Column<bool>(type: "INTEGER", nullable: false),
                    AvatarURL = table.Column<string>(type: "TEXT", nullable: true),
                    CategoryId = table.Column<int>(type: "INTEGER", nullable: true),
                    IsFindingJob = table.Column<bool>(type: "INTEGER", nullable: true),
                    CVTitle = table.Column<string>(type: "TEXT", nullable: false),
                    Theme = table.Column<int>(type: "INTEGER", nullable: true),
                    Font = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CurriculumVitaes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CurriculumVitaes_Candidates_CandidateId",
                        column: x => x.CandidateId,
                        principalTable: "Candidates",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CurriculumVitaes_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CurriculumVitaes_EmploymentTypes_EmploymentTypeId",
                        column: x => x.EmploymentTypeId,
                        principalTable: "EmploymentTypes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CurriculumVitaes_Genders_GenderId",
                        column: x => x.GenderId,
                        principalTable: "Genders",
                        principalColumn: "GenderId");
                    table.ForeignKey(
                        name: "FK_CurriculumVitaes_Levels_LevelId",
                        column: x => x.LevelId,
                        principalTable: "Levels",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Companies",
                columns: table => new
                {
                    CompanyId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CompanyName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Phone = table.Column<string>(type: "TEXT", maxLength: 10, nullable: false),
                    Address = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    DateCreated = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Tax = table.Column<string>(type: "TEXT", nullable: true),
                    YearOfEstablishment = table.Column<int>(type: "INTEGER", nullable: true),
                    WebURL = table.Column<string>(type: "TEXT", nullable: true),
                    IsDelete = table.Column<bool>(type: "INTEGER", nullable: false),
                    CategoryId = table.Column<int>(type: "INTEGER", nullable: true),
                    BackGroundURL = table.Column<string>(type: "TEXT", nullable: true),
                    AvatarURL = table.Column<string>(type: "TEXT", nullable: true),
                    RecuirterId = table.Column<int>(type: "INTEGER", nullable: true),
                    Size = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Companies", x => x.CompanyId);
                    table.ForeignKey(
                        name: "FK_Companies_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Companies_Recuirters_RecuirterId",
                        column: x => x.RecuirterId,
                        principalTable: "Recuirters",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Awards",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CurriculumVitaeId = table.Column<int>(type: "INTEGER", nullable: true),
                    AwardName = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    FromYear = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Awards", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Awards_CurriculumVitaes_CurriculumVitaeId",
                        column: x => x.CurriculumVitaeId,
                        principalTable: "CurriculumVitaes",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Certificates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CurriculumVitaeId = table.Column<int>(type: "INTEGER", nullable: true),
                    CertificateName = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    CertificateProvider = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    credentialURL = table.Column<string>(type: "TEXT", nullable: true),
                    IssuedDate = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    ExpiredDate = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Certificates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Certificates_CurriculumVitaes_CurriculumVitaeId",
                        column: x => x.CurriculumVitaeId,
                        principalTable: "CurriculumVitaes",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Educations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CurriculumVitaeId = table.Column<int>(type: "INTEGER", nullable: true),
                    SchoolName = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    MajorName = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    FromYear = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    ToYear = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    StillLearning = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Educations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Educations_CurriculumVitaes_CurriculumVitaeId",
                        column: x => x.CurriculumVitaeId,
                        principalTable: "CurriculumVitaes",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "JobExperiences",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CurriculumVitaeId = table.Column<int>(type: "INTEGER", nullable: true),
                    ComapanyName = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    Position = table.Column<string>(type: "TEXT", nullable: false),
                    FromDate = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    ToDate = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    EmploymentTypeId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobExperiences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JobExperiences_CurriculumVitaes_CurriculumVitaeId",
                        column: x => x.CurriculumVitaeId,
                        principalTable: "CurriculumVitaes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JobExperiences_EmploymentTypes_EmploymentTypeId",
                        column: x => x.EmploymentTypeId,
                        principalTable: "EmploymentTypes",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CurriculumVitaeId = table.Column<int>(type: "INTEGER", nullable: true),
                    ProjectName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    FromDate = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    ToDate = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    IsStillWorking = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Projects_CurriculumVitaes_CurriculumVitaeId",
                        column: x => x.CurriculumVitaeId,
                        principalTable: "CurriculumVitaes",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Skills",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CurriculumVitaeId = table.Column<int>(type: "INTEGER", nullable: true),
                    Title = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    SkillDescription = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Skills", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Skills_CurriculumVitaes_CurriculumVitaeId",
                        column: x => x.CurriculumVitaeId,
                        principalTable: "CurriculumVitaes",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "EmployeeInCompanies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    RecuirterId = table.Column<int>(type: "INTEGER", nullable: true),
                    CompanyId = table.Column<int>(type: "INTEGER", nullable: true),
                    StartDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    EndDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsWorking = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeInCompanies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmployeeInCompanies_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "CompanyId");
                    table.ForeignKey(
                        name: "FK_EmployeeInCompanies_Recuirters_RecuirterId",
                        column: x => x.RecuirterId,
                        principalTable: "Recuirters",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "JobDescriptions",
                columns: table => new
                {
                    JobId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    RecuirterId = table.Column<int>(type: "INTEGER", nullable: true),
                    Title = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    LevelId = table.Column<int>(type: "INTEGER", nullable: true),
                    EmploymentTypeId = table.Column<int>(type: "INTEGER", nullable: true),
                    GenderId = table.Column<int>(type: "INTEGER", nullable: true),
                    AgeRequirement = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    EducationRequirement = table.Column<string>(type: "TEXT", nullable: true),
                    JobDetail = table.Column<string>(type: "TEXT", nullable: true),
                    ExperienceRequirement = table.Column<string>(type: "TEXT", nullable: true),
                    ProjectRequirement = table.Column<string>(type: "TEXT", nullable: true),
                    SkillRequirement = table.Column<string>(type: "TEXT", nullable: true),
                    CertificateRequirement = table.Column<string>(type: "TEXT", nullable: true),
                    OtherInformation = table.Column<string>(type: "TEXT", nullable: true),
                    CandidateBenefit = table.Column<string>(type: "TEXT", nullable: true),
                    Salary = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    ContactEmail = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Address = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ExpiredDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    IsDelete = table.Column<bool>(type: "INTEGER", nullable: false),
                    CompanyId = table.Column<int>(type: "INTEGER", nullable: true),
                    CategoryId = table.Column<int>(type: "INTEGER", nullable: true),
                    NumberRequirement = table.Column<int>(type: "INTEGER", nullable: true),
                    MatchingNumberRequirement = table.Column<int>(type: "INTEGER", nullable: true),
                    PositionTitle = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobDescriptions", x => x.JobId);
                    table.ForeignKey(
                        name: "FK_JobDescriptions_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JobDescriptions_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "CompanyId");
                    table.ForeignKey(
                        name: "FK_JobDescriptions_EmploymentTypes_EmploymentTypeId",
                        column: x => x.EmploymentTypeId,
                        principalTable: "EmploymentTypes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JobDescriptions_Genders_GenderId",
                        column: x => x.GenderId,
                        principalTable: "Genders",
                        principalColumn: "GenderId");
                    table.ForeignKey(
                        name: "FK_JobDescriptions_Levels_LevelId",
                        column: x => x.LevelId,
                        principalTable: "Levels",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JobDescriptions_Recuirters_RecuirterId",
                        column: x => x.RecuirterId,
                        principalTable: "Recuirters",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "CVMatchings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CandidateId = table.Column<int>(type: "INTEGER", nullable: true),
                    JobDescriptionId = table.Column<int>(type: "INTEGER", nullable: true),
                    CareerGoal = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    Phone = table.Column<string>(type: "TEXT", maxLength: 10, nullable: true),
                    DisplayName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    GenderId = table.Column<int>(type: "INTEGER", nullable: true),
                    DisplayEmail = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    DOB = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Address = table.Column<string>(type: "TEXT", nullable: true),
                    Skill = table.Column<string>(type: "TEXT", nullable: true),
                    Education = table.Column<string>(type: "TEXT", nullable: true),
                    JobExperience = table.Column<string>(type: "TEXT", nullable: true),
                    Project = table.Column<string>(type: "TEXT", nullable: true),
                    Certificate = table.Column<string>(type: "TEXT", nullable: true),
                    Award = table.Column<string>(type: "TEXT", nullable: true),
                    ApplyDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    JSONMatching = table.Column<string>(type: "TEXT", nullable: true),
                    PercentMatching = table.Column<float>(type: "REAL", nullable: true),
                    LevelId = table.Column<int>(type: "INTEGER", nullable: true),
                    EmploymentTypeId = table.Column<int>(type: "INTEGER", nullable: true),
                    CategoryName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    CurriculumVitaeId = table.Column<int>(type: "INTEGER", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    LastUpdateDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    IsMatched = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsApplied = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsSelected = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsReject = table.Column<bool>(type: "INTEGER", nullable: true),
                    Theme = table.Column<int>(type: "INTEGER", nullable: true),
                    Font = table.Column<string>(type: "TEXT", nullable: true),
                    AvatarURL = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CVMatchings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CVMatchings_Candidates_CandidateId",
                        column: x => x.CandidateId,
                        principalTable: "Candidates",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CVMatchings_CurriculumVitaes_CurriculumVitaeId",
                        column: x => x.CurriculumVitaeId,
                        principalTable: "CurriculumVitaes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CVMatchings_EmploymentTypes_EmploymentTypeId",
                        column: x => x.EmploymentTypeId,
                        principalTable: "EmploymentTypes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CVMatchings_Genders_GenderId",
                        column: x => x.GenderId,
                        principalTable: "Genders",
                        principalColumn: "GenderId");
                    table.ForeignKey(
                        name: "FK_CVMatchings_JobDescriptions_JobDescriptionId",
                        column: x => x.JobDescriptionId,
                        principalTable: "JobDescriptions",
                        principalColumn: "JobId");
                    table.ForeignKey(
                        name: "FK_CVMatchings_Levels_LevelId",
                        column: x => x.LevelId,
                        principalTable: "Levels",
                        principalColumn: "Id");
                });

            migrationBuilder.InsertData(
                table: "Genders",
                columns: new[] { "GenderId", "Title" },
                values: new object[,]
                {
                    { 1, "None" },
                    { 2, "Male" },
                    { 3, "Female" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Awards_CurriculumVitaeId",
                table: "Awards",
                column: "CurriculumVitaeId");

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_GenderId",
                table: "Candidates",
                column: "GenderId");

            migrationBuilder.CreateIndex(
                name: "IX_Certificates_CurriculumVitaeId",
                table: "Certificates",
                column: "CurriculumVitaeId");

            migrationBuilder.CreateIndex(
                name: "IX_Companies_CategoryId",
                table: "Companies",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Companies_RecuirterId",
                table: "Companies",
                column: "RecuirterId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CurriculumVitaes_CandidateId",
                table: "CurriculumVitaes",
                column: "CandidateId");

            migrationBuilder.CreateIndex(
                name: "IX_CurriculumVitaes_CategoryId",
                table: "CurriculumVitaes",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_CurriculumVitaes_EmploymentTypeId",
                table: "CurriculumVitaes",
                column: "EmploymentTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_CurriculumVitaes_GenderId",
                table: "CurriculumVitaes",
                column: "GenderId");

            migrationBuilder.CreateIndex(
                name: "IX_CurriculumVitaes_LevelId",
                table: "CurriculumVitaes",
                column: "LevelId");

            migrationBuilder.CreateIndex(
                name: "IX_CVMatchings_CandidateId",
                table: "CVMatchings",
                column: "CandidateId");

            migrationBuilder.CreateIndex(
                name: "IX_CVMatchings_CurriculumVitaeId",
                table: "CVMatchings",
                column: "CurriculumVitaeId");

            migrationBuilder.CreateIndex(
                name: "IX_CVMatchings_EmploymentTypeId",
                table: "CVMatchings",
                column: "EmploymentTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_CVMatchings_GenderId",
                table: "CVMatchings",
                column: "GenderId");

            migrationBuilder.CreateIndex(
                name: "IX_CVMatchings_JobDescriptionId",
                table: "CVMatchings",
                column: "JobDescriptionId");

            migrationBuilder.CreateIndex(
                name: "IX_CVMatchings_LevelId",
                table: "CVMatchings",
                column: "LevelId");

            migrationBuilder.CreateIndex(
                name: "IX_Educations_CurriculumVitaeId",
                table: "Educations",
                column: "CurriculumVitaeId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeInCompanies_CompanyId",
                table: "EmployeeInCompanies",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeInCompanies_RecuirterId",
                table: "EmployeeInCompanies",
                column: "RecuirterId");

            migrationBuilder.CreateIndex(
                name: "IX_JobDescriptions_CategoryId",
                table: "JobDescriptions",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_JobDescriptions_CompanyId",
                table: "JobDescriptions",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_JobDescriptions_EmploymentTypeId",
                table: "JobDescriptions",
                column: "EmploymentTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_JobDescriptions_GenderId",
                table: "JobDescriptions",
                column: "GenderId");

            migrationBuilder.CreateIndex(
                name: "IX_JobDescriptions_LevelId",
                table: "JobDescriptions",
                column: "LevelId");

            migrationBuilder.CreateIndex(
                name: "IX_JobDescriptions_RecuirterId",
                table: "JobDescriptions",
                column: "RecuirterId");

            migrationBuilder.CreateIndex(
                name: "IX_JobExperiences_CurriculumVitaeId",
                table: "JobExperiences",
                column: "CurriculumVitaeId");

            migrationBuilder.CreateIndex(
                name: "IX_JobExperiences_EmploymentTypeId",
                table: "JobExperiences",
                column: "EmploymentTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_CurriculumVitaeId",
                table: "Projects",
                column: "CurriculumVitaeId");

            migrationBuilder.CreateIndex(
                name: "IX_Recuirters_GenderId",
                table: "Recuirters",
                column: "GenderId");

            migrationBuilder.CreateIndex(
                name: "IX_Recuirters_RoleId",
                table: "Recuirters",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_Skills_CurriculumVitaeId",
                table: "Skills",
                column: "CurriculumVitaeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Admins");

            migrationBuilder.DropTable(
                name: "Awards");

            migrationBuilder.DropTable(
                name: "Certificates");

            migrationBuilder.DropTable(
                name: "CVMatchings");

            migrationBuilder.DropTable(
                name: "Educations");

            migrationBuilder.DropTable(
                name: "EmployeeInCompanies");

            migrationBuilder.DropTable(
                name: "JobExperiences");

            migrationBuilder.DropTable(
                name: "Projects");

            migrationBuilder.DropTable(
                name: "Skills");

            migrationBuilder.DropTable(
                name: "Sliders");

            migrationBuilder.DropTable(
                name: "JobDescriptions");

            migrationBuilder.DropTable(
                name: "CurriculumVitaes");

            migrationBuilder.DropTable(
                name: "Companies");

            migrationBuilder.DropTable(
                name: "Candidates");

            migrationBuilder.DropTable(
                name: "EmploymentTypes");

            migrationBuilder.DropTable(
                name: "Levels");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "Recuirters");

            migrationBuilder.DropTable(
                name: "Genders");

            migrationBuilder.DropTable(
                name: "Roles");
        }
    }
}
