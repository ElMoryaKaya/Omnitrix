using Microsoft.EntityFrameworkCore;
using omnitrix.Data;
using omnitrix.Models;

var builder = WebApplication.CreateBuilder(args);

// --- Services ---
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- PostgreSQL via AppDbContext ---
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("bdd")));

// --- CORS (si besoin front local) ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173") // ton front vite/react/vue
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        });
});

var app = builder.Build();

// --- Middlewares ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

// --- Endpoint minimal API pour ESP8266 ---
app.MapPost("/api/alert", async (HttpContext ctx, AppDbContext db) =>
{
    var alert = await ctx.Request.ReadFromJsonAsync<GpsAlert>();
    if (alert is null) return Results.BadRequest();

    alert.ReceivedAt = DateTime.UtcNow;

    db.GpsAlerts.Add(alert);
    await db.SaveChangesAsync();

    Console.WriteLine($"✅ Alerte enregistrée : {alert.DeviceId} {alert.Button} ({alert.Lat}, {alert.Lon})");

    return Results.Ok(new { status = "saved", id = alert.Id });
});

// app.UseHttpsRedirection();  // <-- désactive pour tests ESP (HTTP simple)
app.Run("http://0.0.0.0:5000");