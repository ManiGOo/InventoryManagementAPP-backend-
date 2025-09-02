const { v4: uuidv4 } = require("uuid");

exports.seed = async function(knex) {
  await knex("users").del();

  await knex("users").insert([
    {
      id: uuidv4(),
      name: "Admin User",
      email: "admin@example.com",
      password: "hashed_password_here"
    },
    {
      id: uuidv4(),
      name: "John Doe",
      email: "john@example.com",
      password: "hashed_password_here"
    }
  ]);
};
