const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const User = require('./User');
const Movie = require('./Movie');

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    movieId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { 
            model: Movie,
            key: "id"
        }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 10 } // Rating between 1-10
    }
}, {
    timestamps: true  
});

// Associations
Review.belongsTo(User, { foreignKey: "userId" });
Review.belongsTo(Movie, { foreignKey: "movieId", as: "Movie" });

module.exports = Review;