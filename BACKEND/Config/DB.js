const { Sequelize } = require("sequelize");
require("dotenv").config();

const { Sequelize } = require('sequelize');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(
    isProduction ? process.env.DATABASE_URL : process.env.DB_NAME,
    isProduction ? null : process.env.DB_USER,
    isProduction ? null : process.env.DB_PASSWORD,
    {
        host: isProduction ? null : process.env.DB_HOST,
        dialect: 'postgres',
        logging: false,
        dialectOptions: isProduction ? {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        } : {}
    }
);

const connectToDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("Connection has been  successfully.");
    } catch (error) {
        console.error("Connection Failed", error);
    }
};
module.exports = {connectToDB,sequelize};