const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const Watchlist = require("../models/Watchlist");
const Movie = require("../models/Movie");

const router = express.Router();

// Add a movie to the watchlist
router.post("/", verifyToken, async (req, res) => {
    try {
        const { imdbID, title, year, poster } = req.body;
        const userId = req.user.userId;

        if (!imdbID || !title || !year || !poster) {
            return res.status(400).json({ error: "Incomplete movie data" });
        }

        // Try to find existing movie by imdbID
        let movie = await Movie.findOne({ where: { imdbID } });

        // If movie doesn't exist, create it
        if (!movie) {
            movie = await Movie.create({ imdbID, title, year, poster });
        }

        // Check if it's already in the user's watchlist
        const existingEntry = await Watchlist.findOne({ where: { userId, movieId: movie.id } });
        if (existingEntry) {
            return res.status(400).json({ error: "Movie already in watchlist" });
        }

        // Create watchlist entry
        const watchlistEntry = await Watchlist.create({ userId, movieId: movie.id });

        res.status(201).json({ message: "Movie added to watchlist", watchlistEntry });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
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