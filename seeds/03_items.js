exports.seed = async function(knex) {
  await knex("items").del();

  await knex("items").insert([
    {
      id: 1,
      name: "Laptop",
      description: "High-performance laptop",
      price: 1200,
      category_id: 1 // integer
    },
    {
      id: 2,
      name: "Football",
      description: "Official size football",
      price: 30,
      category_id: 2 // integer
    },
    {
      id: 3,
      name: "T-shirt",
      description: "Cotton T-shirt",
      price: 20,
      category_id: 3 // integer
    }
  ]);
};
