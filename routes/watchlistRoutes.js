const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const Watchlist = require("../models/Watchlist");
const Movie = require("../models/Movie");

const router = express.Router();

// Add a movie to the watchlist
router.post("/", verifyToken, async (req, res) => {
    try {
        const { movieId } = req.body;
        const userId = req.user.userId;

        if (!movieId) {
            return res.status(400).json({ error: "Movie ID is required" });
        }

        const movie = await Movie.findByPk(movieId);
        if (!movie) {
            return res.status(404).json({ error: "Movie not found "});
        }

        const watchlistEntry = await Watchlist.create({ userId, movieId });

        res.status(201).json(watchlistEntry);
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message});
    }
});

// Get the user's watchlist
router.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const watchlist = await Watchlist.findAll({
            where: { userId },
            include: [Movie]
        });

        res.json(watchlist);
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message});
    }
});

// Remove a movie from the watchlist
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const watchlistEntry = await Watchlist.findOne({ where: { id, userId } });
        if (!watchlistEntry) {
            return res.status(404).json({ error: "Watchlist entry not found"});
        }

        await watchlistEntry.destroy();

        res.json({ message: "Movie removed from watchlist" });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message});
    }
});

module.exports = router;