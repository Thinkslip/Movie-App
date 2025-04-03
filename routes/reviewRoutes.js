const express = require('express');
const { verifyToken } = require("../middleware/authMiddleware");
const Review = require("../models/Review");
const Movie = require("../models/Movie");

const router = express.Router();

// Add a review 
router.post("/", verifyToken, async (req, res) => {
    try {
        const { movieId, rating, comment } = req.body;
        const userId = req.user.userId;

        if (!movieId || !rating) {
            return res.status(400).json({ error: "Movie ID and rating are required" });
        }

        const movie = await Movie.findByPk(movieId);
        if (!movie) {
            return res.status(404).json({ error: "Movie not found" });
        }

        const review = await Review.create({ userId, movieId, rating, comment });
        res.status(201).json(review);
    } catch (error) {
        next(error);
    }
});

// Get all reviews for the logged-in user
router.get("/me", verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId; // Get user ID from token

        const reviews = await Review.findAll({
            where: { userId },
            include: ["Movie"]
        });

        if (reviews.length === 0) {
            return res.status(404).json({ error: "You haven't left any reviews yet." });
        }

        res.json(reviews);
    } catch (error) {
        next(error);
    }
});

// Get all reviews for a movie
router.get("/:movieId", async (req, res) => {
    try {
        const { movieId } = req.params;

        const reviews = await Review.findAll({
            where: { movieId },
            include: ["User"]
        });

        if (reviews.length === 0) {
            return res.status(404).json({ error: "No reviews found for this movie." });
        }

        res.json(reviews);
    } catch (error) {
       next(error);
    }
});

// Get all reviews for a specific user
router.get("/user/:userId", async (req, res) => {
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

// Delete a review (only the user who posted it can delete)
router.delete("/:id", verifyToken, async (req, res) => {
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
