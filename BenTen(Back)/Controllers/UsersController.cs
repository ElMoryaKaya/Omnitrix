using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using omnitrix.Data;
using omnitrix.Models;
using omnitrix.DTOs;

namespace omnitrix.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound(new { message = "Utilisateur non trouvé" });
            }

            return Ok(user);
        }


        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] UserDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.FirstName) || string.IsNullOrWhiteSpace(dto.LastName))
            {
                return BadRequest("Le prénom et le nom sont obligatoires.");
            }

            // Générer pseudo unique
            var pseudo = GenerateUniquePseudo(dto.FirstName, dto.LastName, _context);

            // Générer mot de passe sécurisé
            var password = GenerateSecurePassword();

            var user = new User
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Pseudo = pseudo,
                Password = password // ⚠️ En production, il faudrait stocker un hash !
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Retourner l'utilisateur créé (sans exposer le mot de passe)
            return Ok(new { user.Id, user.FirstName, user.LastName, user.Pseudo, Password = password });
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto dto)
        {
            if (!string.IsNullOrEmpty(dto.HoneypotField) || dto.HoneypotClicked == true)
            {
                return BadRequest(new { message = "Suspicion de bot détectée 🚫" });
            }
            if (string.IsNullOrWhiteSpace(dto.Pseudo) || string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest("Le pseudo et le mot de passe sont obligatoires.");
            }

            var user = _context.Users.FirstOrDefault(u => u.Pseudo == dto.Pseudo);

            if (user == null)
            {
                return Unauthorized("Utilisateur introuvable.");
            }

            if (user.Password != dto.Password) // ⚠️ Comparaison directe, car stocké en clair
            {
                return Unauthorized("Mot de passe incorrect.");
            }

            // ✅ Si tout va bien
            return Ok(new { Message = "Connexion réussie", UserId = user.Id, user.Pseudo });
        }

        private string GenerateUniquePseudo(string firstName, string lastName, AppDbContext context)
        {
            var basePseudo = (firstName + lastName).ToLower();
            var pseudo = basePseudo;
            int counter = 1;

            while (context.Users.Any(u => u.Pseudo == pseudo))
            {
                pseudo = basePseudo + counter;
                counter++;
            }

            return pseudo;
        }

        private string GenerateSecurePassword(int length = 12)
        {
            const string validChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()";
            char[] chars = new char[length];
            byte[] data = new byte[length];

            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(data);
            }

            for (int i = 0; i < length; i++)
            {
                var rnd = data[i] % validChars.Length;
                chars[i] = validChars[rnd];
            }

            return new string(chars);
        }
    }
}
