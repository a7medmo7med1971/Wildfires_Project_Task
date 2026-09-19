var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Path to saved_fires.json in project root
string projectRoot = Directory.GetParent(
    builder.Environment.ContentRootPath
)!.Parent!.FullName;

string savedFiresPath = Path.Combine(
    projectRoot,
    "saved_fires.json"
);

builder.Services.AddSingleton(savedFiresPath);

var app = builder.Build();

app.UseCors("Frontend");

app.MapControllers();

app.Run();