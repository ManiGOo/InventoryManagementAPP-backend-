const knex = require('../db')

exports.getAllItems = async (req, res) => {
  try {
    console.log('GET /items, user:', req.user.id);
    const items = await knex('items').select('*').where({ user_id: req.user.id });
    res.json(items);
  } catch (err) {
    console.error('Get items error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getItemById = async (req, res) => {
  try {
    console.log(`GET /items/${req.params.id}, user:`, req.user.id);
    const item = await knex('items').where({ id: req.params.id, user_id: req.user.id }).first();
    if (!item) return res.status(404).json({ error: 'Item not found or unauthorized' });
    res.json(item);
  } catch (err) {
    console.error('Get item error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createItem = async (req, res) => {
  const { name, description, price, category_id } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    console.log('POST /items, user:', req.user.id);
    const [id] = await knex('items').insert({
      name,
      description,
      price,
      category_id,
      image_url,
      user_id: req.user.id,
    });
    res.status(201).json({ id });
  } catch (err) {
    console.error('Create item error:', err);
    res.status(400).json({ error: 'Invalid data' });
  }
};

exports.updateItem = async (req, res) => {
  const { name, description, price, category_id } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : undefined;
  try {
    console.log(`PUT /items/${req.params.id}, user:`, req.user.id);
    const count = await knex('items')
      .where({ id: req.params.id, user_id: req.user.id })
      .update({ name, description, price, category_id, image_url });
    if (!count) return res.status(404).json({ error: 'Item not found or unauthorized' });
    res.json({ message: 'Updated' });
  } catch (err) {
    console.error('Update item error:', err);
    res.status(400).json({ error: 'Invalid data' });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    console.log(`DELETE /items/${req.params.id}, user:`, req.user.id);
    const count = await knex('items')
      .where({ id: req.params.id, user_id: req.user.id })
      .del();
    if (!count) return res.status(404).json({ error: 'Item not found or unauthorized' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Delete item error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};