namespace PictoPuzzle.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using PictoPuzzle.Models;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options): base(options)
    { }
    public DbSet<WordPic> WordPics { get; set; }
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
    }
}