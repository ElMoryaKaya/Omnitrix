namespace omnitrix.Models
{
    public enum AlertType
    {
        None = 0,
        Police = 1,
        Medecin = 2,
        Pompier = 3
    }
    public class User
    {
        public int Id { get; set; }
        public string LastName { get; set; }
        public string FirstName { get; set; }
        public string Password { get; set; }
        public string Pseudo { get; set; }
        public int Latitude { get; set; }
        public int Longitude { get; set; }
        public AlertType Alert { get; set; }
    }

}
