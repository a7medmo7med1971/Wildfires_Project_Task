namespace WildfireApi.Models
{
    public class Fire
    {
        public int Id { get; set; }
        public Attributes Attributes { get; set; } = new();
        public Geometry? Geometry { get; set; }
    }

    public class Attributes
    {
        public int OBJECTID { get; set; }
        public int? EVENTTYPE { get; set; }
    }

    public class Geometry
    {
        public string? Type { get; set; }

        public double? X { get; set; }
        public double? Y { get; set; }

        public double[][][]? Paths { get; set; }

        public double[][][]? Rings { get; set; }
    }
}