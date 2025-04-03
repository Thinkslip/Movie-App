require("dotenv").config();
const express = require("express");
const sequelize = require("./config/config"); 
const authRoutes = require("./routes/authRoutes");
const movieRoutes = require("./routes/movieRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const User = require('./models/User');
const Movie = require('./models/Movie');
const Review = require('./models/Review');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // Parse JSON bodies

// Routes
app.use("/auth", authRoutes);
app.use("/movies", movieRoutes);
app.use("/watchlist", watchlistRoutes);
app.use("/reviews", reviewRoutes);

// Sync Sequelize models with database
sequelize.sync({ force: false}) // Can set to true to drop and recreate tables   
    .then(() => console.log("Database connected and synced"))
    .catch(err => console.error('DB Connection Error:', err));

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.use((err, req, res, next) => {
    console.error(err.stacck);
    res.status(err.status || 500).json({
        error: "Server error",
        details: err.message || "Something went wrong",
    });
});