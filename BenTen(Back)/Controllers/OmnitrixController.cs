using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using omnitrix.Data;
using omnitrix.Models;
using omnitrix.DTOs;
using omnitrix.Controllers;

namespace omnitrix.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OmnitrixController : Controller
    {
        private readonly AppDbContext _context;

        public OmnitrixController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> GiveCoordonnees(int longitude, int latitude, int IdUser, AlertType alert)
        {
            if (longitude < -180 || longitude > 180 && latitude < -90 || latitude > 90)
                return BadRequest("La longitude ou la latitude n'est pas correct");

            var bracelet = await _context.Bracelets.FindAsync(IdUser);

            if (bracelet == null)
            {
                return BadRequest("Le bracelet n'existe pas");
            }
            else
            {

                bracelet.Longitude = longitude;
                bracelet.Latitude = latitude;
                bracelet.Alert = alert;

                _context.Bracelets.Update(bracelet);
                await _context.SaveChangesAsync();
            }
            
            return Ok();
        }

    }
}
