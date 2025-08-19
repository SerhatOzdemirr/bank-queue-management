using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using BankNumerator.Api.Data;        
using BankNumerator.Api.Services;
using BankNumerator.Api.Services.Interfaces;
using BankNumerator.Api.Contracts;

var builder = WebApplication.CreateBuilder(args);

// 1) DbContext: PostgreSQL
builder.Services.AddDbContext<BankNumeratorContext>(opts =>
    opts.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2) CORS
builder.Services.AddCors(opts => {
    opts.AddDefaultPolicy(policy => policy
        .AllowAnyOrigin()
        .AllowAnyMethod()
        .AllowAnyHeader());
});

// 3) JWT Ayarlarını Oku
var jwtSection = builder.Configuration.GetSection("JwtSettings");
var key       = Encoding.UTF8.GetBytes(jwtSection["Key"]!);
var issuer    = jwtSection["Issuer"];
var audience  = jwtSection["Audience"];
// 4) Authentication & JWT Bearer
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken            = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer           = true,
        ValidateAudience         = true,
        ValidateLifetime         = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer              = issuer,
        ValidAudience            = audience,
        IssuerSigningKey         = new SymmetricSecurityKey(key)
    };
});
builder.Services.AddAuthorization();

// 5) Controller ve Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Backend Services
builder.Services.AddScoped<IAgentAdminService, AgentAdminService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IAgentTicketsService, AgentTicketsService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<INumeratorService, NumeratorService>();
builder.Services.AddScoped<IServicesService, ServicesService>();
builder.Services.AddScoped<IAdminStatsService, AdminStatsService>();
builder.Services.AddScoped<IAdminAgentActivityService, AdminAgentActivityService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
var app = builder.Build();

// 6) Middleware
app.UseCors();
app.UseStaticFiles();
app.UseAuthentication();   
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// 7) Health‑check Endpoint
app.MapGet("/health/db", async (BankNumeratorContext db) =>
{
    bool ok = await db.Database.CanConnectAsync();
    return ok
      ? Results.Ok(new { status = "Database connection OK" })
      : Results.Problem("Cannot connect to database", statusCode: 500);
})
.WithName("HealthCheck");

// 8) API Controller’larını Haritalandır
app.MapControllers();

var avatarsPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot", "avatars");
Directory.CreateDirectory(avatarsPath);
app.Run();
