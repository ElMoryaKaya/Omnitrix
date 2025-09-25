namespace omnitrix.Models
{
    public class Bracelet
    {
        public int Id { get; set; }
        public string LastName { get; set; }
        public string FirstName { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public AlertType Alert { get; set; }
    }
}
