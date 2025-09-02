/**
 * @param { import("knex").Knex } knex
 */
exports.up = async function(knex) {
  return knex.schema.createTable("categories", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.integer("user_id").notNullable();
    table.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTableIfExists("categories");
};
