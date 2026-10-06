using APIServer.DTO.EntityDTO;
using APIServer.DTO.ResponseBody;
using APIServer.Features.AiConfiguration;
using APIServer.Features.AiConfiguration.Contracts;
using APIServer.Features.Faq;
using APIServer.Features.Faq.Contracts;
using APIServer.Features.Matching;
using APIServer.Features.Matching.Contracts;
using APIServer.Infrastructure;
using APIServer.IRepositories;
using APIServer.IServices;
using APIServer.Models;
using APIServer.Models.Entity;
using APIServer.Repositories;
using APIServer.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Text;
using System.Text.Json.Serialization;

namespace APIServer
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            builder.Logging.ClearProviders();
            builder.Logging.AddConsole();

            var publicUrl = Environment.GetEnvironmentVariable("JMS_PUBLIC_URL");
            if (!builder.Environment.IsDevelopment() &&
                (string.IsNullOrWhiteSpace(publicUrl) ||
                 !Uri.TryCreate(publicUrl, UriKind.Absolute, out var publicUri) ||
                 publicUri.Scheme is not ("http" or "https") ||
                 publicUri.AbsolutePath != "/" ||
                 !string.IsNullOrEmpty(publicUri.Query) ||
                 !string.IsNullOrEmpty(publicUri.Fragment) ||
                 !string.IsNullOrEmpty(publicUri.UserInfo)))
                throw new InvalidOperationException(
                    "JMS_PUBLIC_URL must be configured as the public HTTP(S) backend origin without a path for non-development deployments.");

            var jwtKey = builder.Configuration["Jwt:Key"];
            if (string.IsNullOrWhiteSpace(jwtKey))
            {
                if (!builder.Environment.IsDevelopment())
                {
                    throw new InvalidOperationException(
                        "Jwt:Key must be configured through the environment for non-development deployments.");
                }

                // Development tokens are intentionally invalidated whenever the process restarts.
                jwtKey = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32));
                builder.Configuration["Jwt:Key"] = jwtKey;
            }

            if (Encoding.UTF8.GetByteCount(jwtKey) < 32)
                throw new InvalidOperationException("Jwt:Key must contain at least 32 UTF-8 bytes.");

            var allowFE = "_AllowFrontEndClient";
            var dataProtectionPath = Path.GetFullPath(
                builder.Configuration["DataProtection:KeyPath"] ?? "App_Data/keys",
                builder.Environment.ContentRootPath);
            Directory.CreateDirectory(dataProtectionPath);
            var dataProtection = builder.Services.AddDataProtection()
                .PersistKeysToFileSystem(new DirectoryInfo(dataProtectionPath));
            var applicationName = builder.Configuration["DataProtection:ApplicationName"];
            if (!string.IsNullOrWhiteSpace(applicationName)) dataProtection.SetApplicationName(applicationName);
            builder.Services.AddSingleton<LocalImageStorage>();

            var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                ?? (builder.Environment.IsDevelopment() ? ["http://localhost:4200"] : []);
            if (allowedOrigins.Any(origin => !Uri.TryCreate(origin, UriKind.Absolute, out var uri)
                || uri.Scheme is not ("http" or "https") || uri.AbsolutePath != "/"
                || !string.IsNullOrEmpty(uri.Query) || !string.IsNullOrEmpty(uri.Fragment)
                || !string.IsNullOrEmpty(uri.UserInfo) || origin.EndsWith('/')))
                throw new InvalidOperationException("Cors:AllowedOrigins must contain HTTP(S) origins without paths or trailing slashes.");
            builder.Services.AddCors(options => options.AddPolicy(allowFE, policy =>
            {
                if (allowedOrigins.Length > 0)
                    policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod();
            }));
            // Add services to the container.

            builder.Services.AddControllers(options =>
                {
                    options.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true;
                })
                .ConfigureApiBehaviorOptions(options =>
                {
                    options.InvalidModelStateResponseFactory = context =>
                    {
                        var errors = context.ModelState
                            .Where(entry => entry.Value?.Errors.Count > 0)
                            .ToDictionary(
                                entry => entry.Key,
                                entry => entry.Value!.Errors
                                    .Select(error => string.IsNullOrWhiteSpace(error.ErrorMessage)
                                        ? "The value is invalid."
                                        : error.ErrorMessage)
                                    .ToArray());

                        return new BadRequestObjectResult(new BaseResponseBody<Dictionary<string, string[]>>
                        {
                            statusCode = System.Net.HttpStatusCode.BadRequest,
                            message = "Validation failed.",
                            data = errors,
                        });
                    };
                })
                .AddJsonOptions(options => options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

            //JWT
            builder.Services.AddAuthentication(
                x =>
                {
                    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                    x.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
                }).AddJwtBearer(options =>
                {
                    options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
                    options.SaveToken = true;
                    options.TokenValidationParameters = new TokenValidationParameters()
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidAudience = builder.Configuration["Jwt:Audience"],
                        ValidIssuer = builder.Configuration["Jwt:Issuer"],
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.Zero,
                    };
                    options.Events = new JwtBearerEvents
                    {
                        OnAuthenticationFailed = context =>
                        {
                            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                            logger.LogWarning("JWT authentication failed for {Path}.", context.HttpContext.Request.Path);
                            return Task.CompletedTask;
                        }
                    };
                });

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(setup =>
            {
                // Include 'SecurityScheme' to use JWT Authentication
                var jwtSecurityScheme = new OpenApiSecurityScheme
                {
                    BearerFormat = "JWT",
                    Name = "JWT Authentication",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,
                    Scheme = JwtBearerDefaults.AuthenticationScheme,
                    Description = "Put **_ONLY_** your JWT Bearer token on textbox below!"
                };
                setup.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, jwtSecurityScheme);
                setup.AddSecurityRequirement(document => new OpenApiSecurityRequirement
                {
                    [new OpenApiSecuritySchemeReference(JwtBearerDefaults.AuthenticationScheme, document, null)] = []
                });
            });

            builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
            builder.Services.AddDbContext<JMSDBContext>(options =>
            {
                options.UseSqlite(builder.Configuration.GetConnectionString("JobConstr"));
                //options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
            });
            builder.Services.AddHealthChecks()
                .AddCheck<SqliteHealthCheck>("sqlite");

            configurationInterfce(builder);

            var app = builder.Build();

            // Migrations are explicit outside Development; seeding is development-only.
            var applyMigrations = builder.Configuration.GetValue<bool?>("Database:ApplyMigrations")
                ?? app.Environment.IsDevelopment();
            if (applyMigrations)
            {
                await using var scope = app.Services.CreateAsyncScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<JMSDBContext>();
                await dbContext.Database.MigrateAsync();
                if (app.Environment.IsDevelopment() &&
                    builder.Configuration.GetValue("Database:SeedDemo", true))
                    await DevelopmentDataSeeder.SeedAsync(dbContext, app.Logger);
            }
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }
            else
            {
                app.UseExceptionHandler(errorApp => errorApp.Run(async context =>
                {
                    context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                    await context.Response.WriteAsJsonAsync(new { statusCode = 500, message = "An unexpected error occurred." });
                }));
            }

            app.UseCors(allowFE);

            app.UseAuthentication();

            app.UseAuthorization();

            app.MapControllers();
            app.MapHealthChecks("/health/live", new HealthCheckOptions
            {
                Predicate = _ => false,
                ResultStatusCodes =
                {
                    [HealthStatus.Healthy] = StatusCodes.Status200OK,
                    [HealthStatus.Degraded] = StatusCodes.Status200OK,
                    [HealthStatus.Unhealthy] = StatusCodes.Status503ServiceUnavailable
                }
            });
            app.MapHealthChecks("/health/ready", new HealthCheckOptions
            {
                ResultStatusCodes =
                {
                    [HealthStatus.Healthy] = StatusCodes.Status200OK,
                    [HealthStatus.Degraded] = StatusCodes.Status200OK,
                    [HealthStatus.Unhealthy] = StatusCodes.Status503ServiceUnavailable
                }
            });
            app.Logger.LogInformation("JMS API started in {EnvironmentName}; SQLite health checks are enabled.", app.Environment.EnvironmentName);

            app.UseDefaultFiles();

            app.UseStaticFiles();
            var images = app.Services.GetRequiredService<LocalImageStorage>();
            foreach (var folder in new[] { "images", "images_clone", "slider" })
                app.UseStaticFiles(new StaticFileOptions
                {
                    FileProvider = new PhysicalFileProvider(Path.Combine(images.Root, folder)),
                    RequestPath = "/" + folder,
                    OnPrepareResponse = context => context.Context.Response.Headers["X-Content-Type-Options"] = "nosniff"
                });

            app.Run();
        }

        private static void configurationInterfce(WebApplicationBuilder builder)
        {
            builder.Services.AddTransient<IRecuirterService, RecuirterService>();
            builder.Services.AddTransient<IRecuirterRepository, RecuirterRepository>();
            builder.Services.AddTransient<IJobRepository, JobRepository>();
            builder.Services.AddTransient<IJobService, JobService>();
            builder.Services.AddTransient<ICurriculumVitaeRepository, CurriculumVitaeRepository>();
            builder.Services.AddTransient<ICurriculumVitaeService, CurriculumVitaeService>();
            builder.Services.AddTransient<IBaseRepository<Level>, LevelRepository>();
            builder.Services.AddTransient<IBaseRepository<Company>, CompanyRepository>();
            builder.Services.AddTransient<ICompanyService, CompanyService>();
            builder.Services.AddTransient<IBaseRepository<Category>, CategoryRepository>();
            builder.Services.AddTransient<IBaseRepository<EmploymentType>, EmploymentTypeRepository>();
            builder.Services.AddTransient<ICVMatchingRepository, CVMatchingRepository>();
            builder.Services.AddTransient<IBaseRepository<EmployeeInCompany>, EmployeeInCompanyRepository>();
            builder.Services.AddTransient<IImageService, ImageService>();
            builder.Services.AddTransient<ICandidateService, CandidateService>();
            builder.Services.AddTransient<IBaseRepository<Gender>, GenderRepository>();
            builder.Services.AddTransient<IRecurterCommon, RecuirterCommonService>();
            builder.Services.AddTransient<ICandidateRepository, CandidateRepository>();
            builder.Services.AddTransient<IBaseRepository<Slider>, SliderRepository>();

            builder.Services.AddTransient<IRegisterService, RegisterService>();
            builder.Services.AddTransient<IAdminRepository, AdminRepository>();
            builder.Services.AddTransient<IAdminService, AdminService>();
            builder.Services.AddHttpClient("AiProviders", client => client.Timeout = TimeSpan.FromSeconds(20));
            builder.Services.AddTransient<IAiProviderAdapter, GeminiProviderAdapter>();
            builder.Services.AddTransient<IAiProviderAdapter, OpenAiProviderAdapter>();
            builder.Services.AddTransient<IAiProviderAdapter, AnthropicProviderAdapter>();
            builder.Services.AddTransient<IMatchEvaluationProvider, AiMatchEvaluationProvider>();
            builder.Services.AddTransient<IMatchEvaluationService, MatchEvaluationService>();
            builder.Services.AddScoped<IAiProviderProfileService, AiProviderProfileService>();
            builder.Services.AddScoped<IFaqService, FaqService>();
        }
    }
}
