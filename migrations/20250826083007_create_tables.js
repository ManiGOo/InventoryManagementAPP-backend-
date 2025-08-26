/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable("users", table => {
    table.increments("id").primary();
    table.string("username").unique().notNullable();
    table.string("password").notNullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("categories", table => {
    table.increments("id").primary();
    table.string("name").unique().notNullable(); // e.g., 'Electronics', 'Clothing'
    table.timestamps(true, true);
  });

  await knex.schema.createTable("items", table => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.text("description");
    table.decimal("price", 8, 2);
    table.string("image_url"); // URL to uploaded image
    table
      .integer("category_id")
      .unsigned()
      .references("id")
      .inTable("categories")
      .onDelete("CASCADE");
    table
      .integer("user_id")
      .unsigned()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE"); // Owner
    table.timestamps(true, true);
  });

  await knex.schema.createTable("related_items", table => {
    table.increments("id").primary();
    table
      .integer("item_id")
      .unsigned()
      .references("id")
      .inTable("items")
      .onDelete("CASCADE");
    table
      .integer("related_item_id")
      .unsigned()
      .references("id")
      .inTable("items")
      .onDelete("CASCADE");
    table.unique(["item_id", "related_item_id"]);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("related_items");
  await knex.schema.dropTableIfExists("items");
  await knex.schema.dropTableIfExists("categories");
  await knex.schema.dropTableIfExists("users");
};
