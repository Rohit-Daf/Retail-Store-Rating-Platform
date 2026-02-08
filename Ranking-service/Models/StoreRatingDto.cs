namespace Ranking_service.Models
{
    public class StoreRating
    {
        public int StoreId { get; set; }
        public List<int> Ratings { get; set; } = new();
    }
}
