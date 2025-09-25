namespace omnitrix.Models
{
	public class GpsAlert
	{
		public int Id { get; set; } // clé primaire
		public string DeviceId { get; set; } = string.Empty;
		public string Button { get; set; } = string.Empty;
		public double Lat { get; set; }
		public double Lon { get; set; }
		public long UtcMs { get; set; } = 0;
        public DateTime ReceivedAt { get; set; } = DateTime.UtcNow;
	}
}
