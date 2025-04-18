const { Sequelize } = require ('sequelize');
require('dotenv').config(); // Load environement variables

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST, // MySQL host (localhost)
        dialect: 'mysql',
        logging: false,
    }
);

module.exports = sequelize;