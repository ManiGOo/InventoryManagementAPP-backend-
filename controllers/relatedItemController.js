const knex = require('../knexfile').knex;

exports.createRelatedItem = async (req, res) => {
  const { item_id, related_item_id } = req.body;
  try {
    await knex('related_items').insert({ item_id, related_item_id });
    res.status(201).json({ message: 'Related item added' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid data' });
  }
};

exports.getRelatedItems = async (req, res) => {
  try {
    const related = await knex('related_items')
      .join('items', 'related_items.related_item_id', 'items.id')
      .where('related_items.item_id', req.params.id)
      .select('items.*');
    res.json(related);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};