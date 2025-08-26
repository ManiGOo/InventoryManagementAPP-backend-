// seeds/01_users.js
const bcrypt = require("bcryptjs");

exports.seed = async function (knex) {
  await knex("users").del();

  const passwordHash = await bcrypt.hash("password123", 10);

  await knex("users").insert([
    {
      id: 1,
      username: "admin",
      password: passwordHash,
    },
    {
      id: 2,
      username: "johndoe",
      password: passwordHash,
    },
    {
      id: 3,
      username: "janedoe",
      password: passwordHash,
    },
  ]);
};
