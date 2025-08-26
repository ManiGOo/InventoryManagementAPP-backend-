// db.js
const knex = require("knex");
const config = require("./knexfile");

const db = knex(config.development); // or process.env.NODE_ENV
module.exports = db;
