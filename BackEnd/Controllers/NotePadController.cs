using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TodoApi.Models;
using Newtonsoft.Json;

namespace TodoApi.Controllers
{
    public class JsonResponse
    {
        public IList<Note> paginatedNotes;
        public int currentPage;
        public int maxPage;
        public string selectedCategory;
        public DateTime startDate;
        public DateTime endDate;
        public IList<string> categories;
        public bool filtering;

    }

    [ApiController]
    [Route("[controller]")]
    public class NotePadController : ControllerBase
    {
        int notesPerPage = 5;            
        private readonly ILogger<NotePadController> _logger;

        public NotePadController(ILogger<NotePadController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        public string Get(int? page, string startDate, string endDate, string selectedCategory, bool filtering)
        {
            var db = new StorageContext();
            var currentPage = page ?? 1;
            List<Note> noteList = db.ReadNotes();
            if(String.IsNullOrEmpty(selectedCategory))
                selectedCategory = "";

            if(!String.IsNullOrEmpty(startDate) && filtering)
            {
                for(int i = noteList.Count-1; i >= 0; i--){
                    if(noteList[i].Date < Convert.ToDateTime(startDate))
                        noteList.RemoveAt(i);
                }
            }else{
                var tmp = DateTime.Now.Date;
                foreach(Note n in noteList)
                    if(n.Date < tmp)
                        tmp = n.Date;
                startDate = tmp.ToString();
            }
            if(!String.IsNullOrEmpty(endDate) && filtering)
            {
                for(int i = noteList.Count-1; i >= 0; i--){
                    if(noteList[i].Date > Convert.ToDateTime(endDate))
                        noteList.RemoveAt(i);
                }
            }else{
                DateTime tmp = DateTime.Now.Date;
                if(noteList.Count > 0)
                    tmp = noteList[0].Date;
                foreach(Note n in noteList)
                    if(n.Date > tmp)
                        tmp = n.Date;
                endDate = tmp.ToString();
            }
            if(!String.IsNullOrEmpty(selectedCategory) && filtering)
            {
                for(int i = noteList.Count-1; i >= 0; i--){
                    if(!noteList[i].Categories.Contains(selectedCategory))
                        noteList.RemoveAt(i);
                }
            }
            

            var categoryList = db.Categories.ToList();
            var categories = new List<string>();
            categories.Add("");
            foreach(Category c in categoryList)
                categories.Add(c.Name);
            
            db.Dispose();
            int maxPage = (noteList.Count + notesPerPage) / notesPerPage;
            if(noteList.Count % notesPerPage == 0)
                maxPage--;
            int notesCountToReturn = notesPerPage;
            if(currentPage * notesPerPage > noteList.Count)
                notesCountToReturn = noteList.Count % notesPerPage;

            

            var toSerialize = new JsonResponse{
                paginatedNotes = noteList.GetRange((currentPage -1) * notesPerPage, notesCountToReturn),
                currentPage = currentPage,
                maxPage = maxPage,
                categories = categories,
                selectedCategory = selectedCategory,
                startDate = Convert.ToDateTime(startDate),
                endDate = Convert.ToDateTime(endDate),
                filtering = filtering
            };

            return JsonConvert.SerializeObject(toSerialize);;
        }

        [HttpGet("/Edit")]
        public string GetNewNoteToEdit(){
            var note = new Note();
            return JsonConvert.SerializeObject(note);
        }

        [HttpGet("/Edit/{IDNote}")]
        public string GetNoteToEdit(int IDNote){
            var db = new StorageContext();
            if(!db.Notes.Where(n=> n.IDNote.Equals(IDNote)).Any())
            {
                db.Dispose();
                return @"{""status"":""Existence Error""}";
            }
            var note = db.Notes.Where(n=> n.IDNote.Equals(IDNote)).Single();
            var notecategories = db.NoteCategories.Where(nc => nc.IDNote == note.IDNote).ToList();
            foreach (NoteCategory nc in notecategories)
            {
                note.Categories.Add(db.Categories.Where(c => c.IDCategory == nc.IDCategory).Single().Name);
            }

            db.Dispose();
            return JsonConvert.SerializeObject(note);
        }

        [HttpPost("/Edit/{IDNote}")]
        public string AddNewNote([FromBody()] Note note, int IDNote){
            var db = new StorageContext();
            if(note.Categories.Count == 0){
                db.Dispose();
                return "Note needs categories!";
            }   
            if(String.IsNullOrEmpty(note.Title)){
                return "Note needs title!";
            }      
            if(db.Notes.Where(n => n.IDNote.Equals(note.IDNote)).Any()){

                db.Dispose();
                return "NOTE ALREADY EXISTS!";
            }

            var noteToAdd = new Note(){
                Title = note.Title,
                Date = note.Date,
                Description = note.Description,
                isMarkdown = note.isMarkdown
            };

            db.Notes.Add(noteToAdd);
            db.SaveChanges();
        
            foreach(String category in note.Categories)
            {
                if(!db.Categories.Where(d => d.Name.Equals(category)).Any()){
                    db.Categories.Add(new Category() { Name = category});
                    db.SaveChanges();
                }
                
                int catID = db.Categories.Where(d => d.Name.Equals(category)).Single().IDCategory;
                db.NoteCategories.Add(new NoteCategory() { IDCategory = catID, IDNote = noteToAdd.IDNote });
                db.SaveChanges();
            }
            
            db.SaveChanges();
            db.Dispose();
            return "SUC";
        }  

        [HttpPut("/Edit/{IDNote}")]
        public string UpdateNote([FromBody()] Note note, int IDNote){
            var db = new StorageContext();
            
            if(!db.Notes.Where(n => n.IDNote.Equals(note.IDNote)).Any()){
                db.Dispose();
                return "NOTE NOT FOUND - PROBALBY IT WAS DELETED!";
            }

            if(note.Categories.Count == 0){
                db.Dispose();
                return "Note needs categories!";
            }
            
            if(String.IsNullOrEmpty(note.Title)){
                return "Note needs title!";
            }
            try{
                db.Entry(note).State = Microsoft.EntityFrameworkCore.EntityState.Modified;
                db.SaveChanges();
            }catch(Microsoft.EntityFrameworkCore.DbUpdateConcurrencyException e){
                return e.Message;
            }
            
            var notecategories = db.NoteCategories.Where(nc => nc.IDNote == note.IDNote).ToList();
            foreach(NoteCategory noteCategory in notecategories)
            {
                db.NoteCategories.Remove(db.NoteCategories.Find(noteCategory.IDNote, noteCategory.IDCategory));
                db.SaveChanges();
                if (!db.NoteCategories.Where(nc => nc.IDCategory.Equals(noteCategory.IDCategory)).Any()){
                    db.Categories.Remove(db.Categories.Find(noteCategory.IDCategory));
                    db.SaveChanges();
                }
            }
            var tmp = db.NoteCategories.ToList();
            foreach(String category in note.Categories)
            {
                if(!db.Categories.Where(d => d.Name.Equals(category)).Any()){
                    db.Categories.Add(new Category() { Name = category});
                    db.SaveChanges();
                }
                
                int catID = db.Categories.Where(d => d.Name.Equals(category)).Single().IDCategory;
                db.NoteCategories.Add(new NoteCategory() { IDCategory = catID, IDNote = note.IDNote });
                db.SaveChanges();
            }
            
            db.SaveChanges();
            db.Dispose();
            return "SUC";
        }  

        [HttpDelete("{IDNote}")]
        public string Delete(int IDNote, int? page, string startDate, string endDate, string selectedCategory, bool filtering){
           
            var db = new StorageContext();
            if (!db.Notes.Where(n => n.IDNote.Equals(IDNote)).Any())
            {
                db.Dispose();
                return this.Get(page, startDate, endDate, selectedCategory, filtering);
            }
                
            var note = db.Notes.Where(n => n.IDNote.Equals(IDNote)).First();
            var IDCategorys = new List<int>();
            var notecategories = db.NoteCategories.Where(nc => nc.IDNote == note.IDNote).ToList();

            foreach (NoteCategory nc in notecategories)
            {
                IDCategorys.Add(db.Categories.Where(c => c.IDCategory == nc.IDCategory).Single().IDCategory);
                db.NoteCategories.Remove(db.NoteCategories.Find(IDNote, IDCategorys.Last()));
            }
            db.SaveChanges();

            foreach(int IDCategory in IDCategorys)
            {
                if (!db.NoteCategories.Where(nc => nc.IDCategory == IDCategory).Any())
                db.Categories.Remove(db.Categories.Find(IDCategory));
            }
            db.SaveChanges();
            
            db.Notes.Remove(note);
            db.SaveChanges();

            db.Dispose();
            return this.Get(page, startDate, endDate, selectedCategory, filtering);
        }

    }
}
