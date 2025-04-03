const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Movie = sequelize.define('Movie', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    year: {
        type: DataTypes.STRING
    },
    poster: {
        type: DataTypes.STRING
    },
    imdbID: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    timestamps: true
});

module.exports = Movie;