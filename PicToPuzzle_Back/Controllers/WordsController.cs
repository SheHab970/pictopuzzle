using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OpenAI;
using PictoPuzzle.Models;
using System.Net.Http;
using System.Text;
using System.Text.Json;
namespace PictoPuzzle.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WordsController : ControllerBase
    {
        private readonly Data.AppDbContext _context;
        private readonly HttpClient _httpClient;

        public WordsController(Data.AppDbContext context, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _httpClient = httpClientFactory.CreateClient(); ;
        }
        [HttpGet]
        public IActionResult GetWords()
        {
            var words = _context.WordPics.OrderBy(w => Guid.NewGuid()).Take(5).ToList();
            return Ok(words);
        }
        [HttpGet("difficulty/{number:int}")]
        public IActionResult GetWordsByDifficulty(int number)
        {
            if (number < 0 || number > 2)
            {
                return BadRequest("Difficulty level must be 0, 1, or 2.");
            }
            var words = _context.WordPics.Where(w => w.DifficultyLevel == number).OrderBy(w => Guid.NewGuid()).Take(5).ToList();
            return Ok(words);
        }
        [HttpPost]
        public IActionResult AddWord(WordPic wordPic)
        {
            wordPic.Id = 0; // Reset Id to let database generate it
            _context.WordPics.Add(wordPic);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetWords), new { id = wordPic.Id }, wordPic);
        }
        [HttpGet("{text}")]
        public async Task<IActionResult> GetWordText(string text)
        {
            WordPic wordPic = new WordPic
            {
                Word = text,
                DifficultyLevel = await GetDifficulty(text), // Default difficulty level
                ImageUrl = await GetImageUrl(text)
            };
            if (wordPic.DifficultyLevel == -1)
            {
                return BadRequest("Failed to determine difficulty level.");
            }
            if (string.IsNullOrEmpty(wordPic.ImageUrl))
            {
                return BadRequest("Failed to retrieve image URL.");
            }
            return Ok(wordPic);
        }

        private async Task<int> GetDifficulty(string text)
        {
            var request = new HttpRequestMessage(
            HttpMethod.Post,
            "https://router.huggingface.co/v1/chat/completions"
        );
            request.Headers.Add("Authorization", $"Bearer ");

            var body = new
            {
                model = "openai/gpt-oss-120b:fastest",
                messages = new[]
    {
        new
        {
            role = "user",
            content = $"Reply with ONLY 0, 1, or 2 describing the difficulty of the word: {text}"
        }
    }
            };


            request.Content = new StringContent(
        JsonSerializer.Serialize(body),
        Encoding.UTF8,
        "application/json"

    );
            Console.WriteLine(request);
            var response = await _httpClient.SendAsync(request);
            Console.WriteLine(response);

            var json = await response.Content.ReadAsStringAsync();
            Console.WriteLine(json);

            using var doc = JsonDocument.Parse(json);

            var difficulty = doc.RootElement
    .GetProperty("choices")[0]
    .GetProperty("message")
    .GetProperty("content")
    .GetString();



            return int.TryParse(difficulty, out var result) ? result:-1;
        }

        private async  Task<string> GetImageUrl(string text)
        {
            
            var unsplashKey = "";

            var url = $"https://api.unsplash.com/photos/random?query={text}";

            var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Add("Authorization", $"Client-ID {unsplashKey}");

            var response = await _httpClient.SendAsync(request);

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            return doc.RootElement
                .GetProperty("urls")
                .GetProperty("regular")
                .GetString() ?? "";
        }

        [HttpPut("{id}")]
        public IActionResult UpdateWord(int id, WordPic updatedWord)
        {
            if (id != updatedWord.Id)
                return BadRequest("ID mismatch");

            var existingWord = _context.WordPics.Find(id);
            if (existingWord == null)
                return NotFound();

            existingWord.Word = updatedWord.Word;
            existingWord.ImageUrl = updatedWord.ImageUrl;
            existingWord.DifficultyLevel = updatedWord.DifficultyLevel;

            _context.SaveChanges();

            return Ok(existingWord);
        }

    }
}
