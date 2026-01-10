const { Sequelize } = require('sequelize');
require('dotenv').config();

// Use RENDER_DATABASE_URL if available (Render's PostgreSQL service), otherwise use DATABASE_URL or individual env vars
const databaseUrl = process.env.RENDER_DATABASE_URL || process.env.DATABASE_URL;

const isProduction = process.env.NODE_ENV === 'production';

let sequelize;

if (isProduction && databaseUrl) {
    // Render/Heroku style database URL
    sequelize = new Sequelize(databaseUrl, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    });
} else {
    // Traditional individual environment variables for development
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            dialect: 'postgres',
            logging: false
        }
    );
}

const connectToDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("Connection has been  successfully.");
    } catch (error) {
        console.error("Connection Failed", error);
    }
};
module.exports = {connectToDB,sequelize};