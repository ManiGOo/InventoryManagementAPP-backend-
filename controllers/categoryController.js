const knex = require('../db');

// Get all categories (default + user-specific)
exports.getAllCategories = async (req, res) => {
  try {
    const query = knex('categories').select('*');

    // Only filter by user_id if req.user exists
    if (req.user?.id) {
      query.where(builder => 
        builder.where('user_id', null).orWhere('user_id', req.user.id)
      );
    } else {
      query.where('user_id', null); // only default categories
    }

    const categories = await query;
    res.json(categories);
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add new category (user-specific)
exports.createCategory = async (req, res) => {
  const { name } = req.body;
  try {
    if (!req.user) return res.status(401).json({ error: 'Login required' });

    const [id] = await knex('categories').insert({
      name,
      user_id: req.user.id,
    }).returning('id');

    res.status(201).json({ id, name });
  } catch (err) {
    console.error('Create category error:', err);
    res.status(400).json({ error: 'Category creation failed' });
  }
};

// Delete user-added category
exports.deleteCategory = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Login required' });

    const count = await knex('categories')
      .where({ id: req.params.id, user_id: req.user.id })
      .del();

    if (!count) return res.status(404).json({ error: 'Category not found or not yours' });

    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
