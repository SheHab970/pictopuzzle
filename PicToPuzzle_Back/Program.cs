using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});
builder.Services.AddHttpClient();

// OpenAPI document
builder.Services.AddOpenApi("pictopuzzle");

builder.Services.AddDbContext<PictoPuzzle.Data.AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("ProductionConnection")));

var app = builder.Build();

// OpenAPI
app.MapOpenApi();

// Scalar
app.MapScalarApiReference(options =>
{
    options.WithTitle("PictoPuzzle API");
    options.WithOpenApiRoutePattern("/openapi/{documentName}.json");
});

app.UseHttpsRedirection();

// APPLY CORS HERE (BEFORE controllers)
app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();
