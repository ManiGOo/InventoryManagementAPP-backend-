/**
 * @param { import("knex").Knex } knex
 */
exports.up = async function(knex) {
  return knex.schema.createTable("items", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.text("description");
    table.decimal("price", 10, 2).notNullable();
    table.string("image_url");
    table.integer("category_id").unsigned().references("id").inTable("categories").onDelete("CASCADE");
    table.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTableIfExists("items");
};
