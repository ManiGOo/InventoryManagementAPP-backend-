// migrations/xxxx_add_user_id_to_categories.js
exports.up = function(knex) {
  return knex.schema.alterTable('categories', table => {
    table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('categories', table => {
    table.dropColumn('user_id');
  });
};
