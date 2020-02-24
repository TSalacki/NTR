using System;
using System.Linq;
using TodoApi.Models;

namespace TodoApi
{
    public static class DbInitializer
    {
        public static void Initialize(StorageContext context)
        {
            context.Database.EnsureCreated();

            // Look for any students.
            if (context.Notes.Any())
            {
                return;   // DB has been seeded
            }

            var notes = new Note[]
            {
                new Note{Title="Note1",Description="Alexander",Date=DateTime.Parse("2019-09-01"), isMarkdown=0},
                new Note{Title="Note2",Description="Alonso",Date=DateTime.Parse("2017-09-01"), isMarkdown=0},
                new Note{Title="Note3",Description="Anand",Date=DateTime.Parse("2018-09-01"), isMarkdown=0},
                new Note{Title="Note4",Description="Barzdukas",Date=DateTime.Parse("2017-09-01"), isMarkdown=0},
                new Note{Title="Note5",Description="Li",Date=DateTime.Parse("2017-09-01"), isMarkdown=0},
                new Note{Title="Note6",Description="Justice",Date=DateTime.Parse("2016-09-01"), isMarkdown=0},
                new Note{Title="Note7",Description="Norman",Date=DateTime.Parse("2018-09-01"), isMarkdown=0},
                new Note{Title="Note8",Description="Olivetto",Date=DateTime.Parse("2019-09-01"), isMarkdown=0}
            };
            foreach (Note n in notes)
            {
                context.Notes.Add(n);
            }
            context.SaveChanges();

            var categories = new Category[]
            {
                new Category{Name="Chemistry"},
                new Category{Name="Microeconomics"},
                new Category{Name="Macroeconomics"},
                new Category{Name="Calculus"},
                new Category{Name="Trigonometry"},
                new Category{Name="Composition"},
                new Category{Name="Literature"}
            };
            foreach (Category c in categories)
            {
                context.Categories.Add(c);
            }
            context.SaveChanges();

            var noteCategories = new NoteCategory[]
            {
                new NoteCategory{IDNote=1,IDCategory=1},
                new NoteCategory{IDNote=1,IDCategory=2},
                new NoteCategory{IDNote=1,IDCategory=3},
                new NoteCategory{IDNote=2,IDCategory=4},
                new NoteCategory{IDNote=2,IDCategory=5},
                new NoteCategory{IDNote=2,IDCategory=6},
                new NoteCategory{IDNote=3,IDCategory=7},
                new NoteCategory{IDNote=4,IDCategory=1},
                new NoteCategory{IDNote=4,IDCategory=2},
                new NoteCategory{IDNote=5,IDCategory=3},
                new NoteCategory{IDNote=6,IDCategory=4},
                new NoteCategory{IDNote=7,IDCategory=5},
                new NoteCategory{IDNote=8,IDCategory=6}
            };
            foreach (NoteCategory e in noteCategories)
            {
                context.NoteCategories.Add(e);
            }
            context.SaveChanges();
        }
    }
}