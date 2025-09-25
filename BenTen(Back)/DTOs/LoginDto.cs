namespace omnitrix.DTOs
{
    public class LoginDto
    {
        public string Pseudo { get; set; }
        public string Password { get; set; }
        public string HoneypotField { get; set; }
        public bool HoneypotClicked { get; set; }
    }
}
