const axios = require("axios");
const express = require("express");


const router = express.Router();
const pool = require("../utils/db");
const result = require("../utils/result");

// List all stores with average rating and user's rating
// List all stores with average rating and user's rating
router.get("/", (req, res) => {
  const sql = `
        SELECT s.s_id, s.name, s.address,
               AVG(r.rating) AS avg_rating,
               COUNT(r.rating) AS rating_count,
               GROUP_CONCAT(r.rating) as raw_ratings,
               (SELECT rating FROM ratings WHERE u_id = ? AND s_id = s.s_id) AS user_rating
        FROM stores s
        LEFT JOIN ratings r ON s.s_id = r.s_id
        GROUP BY s.s_id
    `;
  pool.query(sql, [req.u_id], async (error, data) => {
    if (error) {
      res.send(result.createResult(error, data));
      return;
    }

    try {
      const rankingPayload = data.map(s => ({
        storeId: s.s_id,
        ratings: s.raw_ratings ? s.raw_ratings.split(',').map(Number) : []
      }));

      const response = await axios.post("http://localhost:5076/api/rankings/calculate", rankingPayload);

      // O(1) Loopup Map
      const rankingMap = new Map();
      if (response.data) {
        response.data.forEach(r => rankingMap.set(r.storeId, r));
      }

      const merged = data.map(s => {
        const rank = rankingMap.get(s.s_id);
        return {
          ...s,
          avg_rating: rank ? rank.avgRating : s.avg_rating,
          rankingScore: rank ? rank.rankingScore : s.avg_rating,
          raw_ratings: undefined
        };
      });
      res.send(result.createResult(null, merged));

    } catch (err) {
      console.error("Ranking service error:", err.message);
      // Fallback
      res.send(result.createResult(null, data));
    }
  });
});

// Search store by name or address
router.get("/search", (req, res) => {
  const { q } = req.query;
  const sql = `
        SELECT s.s_id, s.name, s.address, AVG(r.rating) AS avg_rating, COUNT(r.rating) AS rating_count
        FROM stores s
        LEFT JOIN ratings r ON s.s_id = r.s_id
        WHERE s.name LIKE ? OR s.address LIKE ?
        GROUP BY s.s_id
    `;
  pool.query(sql, [`%${q}%`, `%${q}%`], (error, data) => {
    res.send(result.createResult(error, data));
  });
});

// Submit or update rating
router.post("/rate", (req, res) => {
  const { s_id, rating } = req.body;

  const sql = `
        INSERT INTO ratings(u_id,s_id,rating)
        VALUES(?,?,?)
        ON DUPLICATE KEY UPDATE rating=?
    `;

  pool.query(sql, [req.u_id, s_id, rating, rating], (error, data) => {
    res.send(result.createResult(error, "Rating submitted"));
  });
});

// Store Owner Dashboard: list users who rated their store
router.get("/owner/dashboard", (req, res) => {
  const sql = `
        SELECT u.name, u.email, r.rating
        FROM stores s
        JOIN ratings r ON s.s_id = r.s_id
        JOIN users u ON r.u_id = u.u_id
        WHERE s.owner_id = ?
    `;
  pool.query(sql, [req.u_id], (error, data) => {
    res.send(result.createResult(error, data));
  });
});

// Store Owner: average rating
router.get("/owner/average", (req, res) => {
  const sql = `
        SELECT AVG(r.rating) AS avg_rating
        FROM stores s
        LEFT JOIN ratings r ON s.s_id = r.s_id
        WHERE s.owner_id = ?
    `;
  pool.query(sql, [req.u_id], (error, data) => {
    res.send(result.createResult(error, data[0]));
  });
});

module.exports = router;
