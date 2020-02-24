using System;
using System.IO;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;


namespace TodoApi.Models
{
    public class Note
    {
        public const int MAX = 2048;
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IDNote { get; set; }

        [StringLength(64)]
        public String Title { get; set; }

        [StringLength(MAX)]
        public String Description { get; set; }

        public DateTime Date { get; set; }

        [Timestamp]
        public byte[] Timestamp { get; set; }

        public System.Int16 isMarkdown {get; set;}

        [NotMapped]
        public List<String> Categories { get; set; }

        public Note(String title, String content, DateTime date, List<String> categories, short markdown)
        {
            this.Title = title;
            this.Description = content;
            this.Date = date;
            this.Categories = categories;
            this.isMarkdown = markdown;
        }

        public Note()
        {
            this.Date = DateTime.Now.Date;
            this.Categories = new List<String>();
            this.isMarkdown = 0;
        }
    }

    public class Category
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IDCategory { get; set; }
        [StringLength(64)]
        public string Name { get; set; }
    }

    public class NoteCategory
    {
        [ForeignKey("Note")]
        public int IDNote { get; set; }
        [ForeignKey("Category")]
        public int IDCategory { get; set; }
    }

    public class StorageContext : DbContext
    {
        public DbSet<Note> Notes { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<NoteCategory> NoteCategories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Note>().Property(n => n.Timestamp).IsRowVersion();
            modelBuilder.Entity<Note>().ToTable("Note");
            modelBuilder.Entity<Category>().ToTable("Category");
            modelBuilder.Entity<NoteCategory>()
                        .HasKey(o => new { o.IDNote, o.IDCategory });
            modelBuilder.Entity<NoteCategory>().ToTable("NoteCategory");
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer(@"Data Source=base.ii.pw.edu.pl;Initial Catalog=NTR2019Z;User=User2019Z;Password=Password2019Z");
        }

        public StorageContext()
        {
        }

        public StorageContext(DbContextOptions<StorageContext> options)
            : base(options)
        {
        }

        public List<Note> ReadNotes()
        {
            var db = new StorageContext();
            var noteList = db.Notes.ToList();

            foreach (Note n in noteList)
            {
                var notecategories = db.NoteCategories.Where(nc => nc.IDNote == n.IDNote).ToList();
                var CategoriesForNote = new List<String>();
                //n.CategoriesEntity = this.NoteCategories.Where(nc => nc.IDNote == n.IDNote).ToList();
                foreach (NoteCategory nc in notecategories)
                {
                    CategoriesForNote.Add(db.Categories.Where(c => c.IDCategory == nc.IDCategory).Single().Name);
                }
                n.Categories.Clear();
                n.Categories = CategoriesForNote;
            }
            db.Dispose();
            return noteList;
        }

    }
}