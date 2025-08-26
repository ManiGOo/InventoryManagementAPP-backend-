const knex = require('../db');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await knex('categories').select('*');
    res.json(categories);
  } catch (err) {
    console.error('Get categories error:', err); // 👈 log it
    res.status(500).json({ error: 'Server error' });
  }
};
