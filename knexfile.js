require("dotenv").config(); // 👈 add this at the very top

// knexfile.js
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: "pg",
    connection: process.env.DB_URL,
    migrations: {
      directory: "./migrations"  // 👈 add this
    },
    seeds: {
      directory: "./seeds"       // 👈 optional, but good to have
    }
  },

  staging: {
    client: "pg", // better to keep consistent naming instead of 'postgresql'
    connection: {
      database: "my_db",
      user:     "username",
      password: "password"
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  },

  production: {
    client: "pg",
    connection: {
      database: "my_db",
      user:     "username",
      password: "password"
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  }

};
