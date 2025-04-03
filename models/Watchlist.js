const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/config");
const User = require("./User");
const Movie = require("./Movie");

const Watchlist = sequelize.define("Watchlist", {
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
            key: "id"
        }
    },
    movieId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Movie,
            key: "id"
        }
    }
}, {
    timestamps: true
});

Watchlist.belongsTo(Movie, { foreignKey: "movieId" });
Movie.hasMany(Watchlist, { foreignKey: "movieId"});

module.exports = Watchlist;