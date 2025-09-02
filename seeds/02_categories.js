exports.seed = async function(knex) {
  await knex("categories").del();

  await knex("categories").insert([
    { id: 1, name: "Electronics" },
    { id: 2, name: "Sports" },
    { id: 3, name: "Clothing" }
  ]);
};
