require('dotenv').config();
const { DataSource } = require("typeorm");

const AppDataSource = new DataSource({
  type: "sqlite",
  database: process.env.DB_DATABASE || ":memory:", 
  synchronize: true,
  logging: false,
  entities: [__dirname + "/../models/*.js"]
});

module.exports = AppDataSource;