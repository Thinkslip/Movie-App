const express = require('express');
const axios = require('axios');
const { verifyToken } = require("../middleware/authMiddleware");
const Review = require("../models/Review");
const Movie = require("../models/Movie");
const User = require("../models/User");

const router = express.Router();

// Add a review 
router.post("/", verifyToken, async (req, res, next) => {
    try {
        const { movieId: imdbID, rating, comment } = req.body; 
        const userId = req.user.userId;

        if (!imdbID || rating === undefined) {
            return res.status(400).json({ error: "IMDB ID and rating are required" });
        }

        let movie = await Movie.findOne({ where: { imdbID } });

        if (!movie) {
            // Fetch from OMDb
            const omdbRes = await axios.get("http://www.omdbapi.com/", {
                params: {
                    i: imdbID,
                    apikey: process.env.OMDB_API_KEY,
                },
            });

            const data = omdbRes.data;

            if (data.Response === "False") {
                return res.status(404).json({ error: "Movie not found in OMDb" });
            }

            // Create movie in DB
            movie = await Movie.create({
                title: data.Title,
                year: data.Year,
                poster: data.Poster,
                imdbID: data.imdbID,
            });
        }

        const review = await Review.create({
            userId,
            movieId: movie.id,
            rating,
            comment,
        });

        res.status(201).json(review);
    } catch (error) {
        next(error);
    }
});

// Get all reviews for the logged-in user
router.get("/me", verifyToken, async (req, res, next) => {
    try {
        const userId = req.user.userId; // Get user ID from token

        const reviews = await Review.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            include: [{
                model: Movie,
                as: "Movie"
            }]
        });

        res.json(reviews);
    } catch (error) {
        next(error);
    }
});

// Get all reviews for a specific user
router.get("/user/:userId", async (req, res, next) => {
    try {
        const { userId } = req.params;

        const reviews = await Review.findAll({
            where: { userId },
            include: ["Movie"]
        });

        if (reviews.length === 0) {
            return res.status(404).json({ error: "No reviews found for this user."});
        }

        res.json(reviews);
    } catch (error) {
        next(error);
    }
});

// Get all reviews for a movie
router.get("/:imdbID", async (req, res, next) => {
    try {
        const { imdbID } = req.params;
    
       // Find the movie row first
       const movie = await Movie.findOne({ where: { imdbID } });
        if (!movie) {
            return res.status(404).json({ error: "Movie not found" });
        }
    
        // Now fetch reviews by the numeric PK
        const reviews = await Review.findAll({
            where: { movieId: movie.id },
            order: [['createdAt', 'DESC']],
            attributes: ["id","rating","comment","userId","createdAt","updatedAt"],
            include: [{
              model: User,
              attributes: ["id","username"],
              as: "User"
            }]
          });
    
        res.json(reviews);
    } catch (error) {
        next(error);
    }
});

// Edit a review (only if it's the user's own review)
router.put("/:id", verifyToken, async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const { rating, comment } = req.body;

        const review = await Review.findOne({ where: { id, userId } });

        if (!review) {
            return res.status(404).json({ error: "Review not found or unauthorized." });
        }

        if (rating !== undefined) review.rating = rating;
        if (comment !== undefined) review.comment = comment;

        await review.save();
        res.json(review);
    } catch (error) {
        next (error);
    }
});

// Delete a review (only the user who posted it can delete)
router.delete("/:id", verifyToken, async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const review = await Review.findOne({ where: { id, userId } });

        if (!review) {
            return res.status(404).json({ error: "Review not found or unauthorized." });
        }

        await review.destroy();
        res.json({ message: "Review deleted successfully" });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
