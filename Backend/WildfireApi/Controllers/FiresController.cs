using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using WildfireApi.Models;

namespace WildfireApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FiresController : ControllerBase
    {
        private readonly string _filePath;

        public FiresController(string filePath)
        {
            _filePath = filePath;
        }

        [HttpPost]
        public IActionResult SaveFires([FromBody] List<Fire> fires)
        {
            try
            {
                if (fires == null || fires.Count == 0)
                {
                    return BadRequest("No fires received.");
                }

                // Create file if it doesn't exist
                if (!System.IO.File.Exists(_filePath))
                {
                    System.IO.File.WriteAllText(_filePath, "[]");
                }

                // Read existing data
                string json = System.IO.File.ReadAllText(_filePath);

                List<Fire> savedFires =
                    JsonSerializer.Deserialize<List<Fire>>(json)
                    ?? new List<Fire>();

                // Add new fires
                savedFires.AddRange(fires);

                // Convert data to JSON
                string updatedJson = JsonSerializer.Serialize(
                    savedFires,
                    new JsonSerializerOptions
                    {
                        WriteIndented = true
                    }
                );

                // Save data
                System.IO.File.WriteAllText(
                    _filePath,
                    updatedJson
                );

                return Ok(savedFires);
            }
            catch (Exception ex)
            {
                Console.WriteLine("ERROR:");
                Console.WriteLine(ex);

                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message,
                        details = ex.ToString()
                    }
                );
            }
        }
    }
}