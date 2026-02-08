using Microsoft.AspNetCore.Mvc;
using Ranking_service.Models;

namespace Ranking_service.Controllers
{
    [ApiController]
    [Route("api/rankings")]
    public class RankingController : ControllerBase
    {
        [HttpPost("calculate")]
        public IActionResult Calculate([FromBody] List<StoreRating> stores)
        {
            var results = stores.Select(s => {
                double avg = s.Ratings != null && s.Ratings.Any() ? s.Ratings.Average() : 0;
                int count = s.Ratings != null ? s.Ratings.Count : 0;
                
                double score = (avg * 0.7) + (Math.Log(count + 1) * 0.3);

                return new 
                {
                    s.StoreId,
                    avgRating = Math.Round(avg, 2),
                    rankingScore = Math.Round(score, 2)
                };
            });

            return Ok(results);
        }
    }
}
