const express = require("express");
const axios = require("axios");
const Movie = require("../models/Movie");
require("dotenv").config();

const router = express.Router();

// Search for a movie
router.get("/search", async (req, res) => {
    try {
        const { title } = req.query; // Example: /movies/search?title=Inception

        if (!title) {
            return res.status(400).json({ error: "Title is required" });
        }

        const apiKey = process.env.OMDB_API_KEY;
        const response = await axios.get(`http://www.omdbapi.com/?apikey=${apiKey}&t=${title}`);

        if (response.data.Response === 'False') {
            return res.status(404).json({ error: "Movie not found" });
        }

        const { imdbID, Title, Year, Poster } = response.data;

        // Check if movie is already in DB
        let movie = await Movie.findOne({ where: { imdbID } });

        if (!movie) {
            movie = await Movie.create({
                imdbID,
                title: Title,
                year: Year,
                poster: Poster
            });
        }
        
        res.json(movie);
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
});

module.exports = router;