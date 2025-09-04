const knex = require('../knexfile').knex;

// ===== Create a related item =====
exports.createRelatedItem = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Login required' });

  const { item_id, related_item_id } = req.body;

  try {
    // Ensure the user owns the main item
    const item = await knex('items')
      .where({ id: item_id, user_id: req.user.id })
      .first();

    if (!item) return res.status(403).json({ error: 'You do not own this item' });

    // Prevent duplicate related entries
    const exists = await knex('related_items')
      .where({ item_id, related_item_id })
      .first();

    if (exists) return res.status(400).json({ error: 'Related item already exists' });

    await knex('related_items').insert({ item_id, related_item_id });
    res.status(201).json({ message: 'Related item added' });
  } catch (err) {
    console.error('Create related item error:', err);
    next(err); // send to centralized error handler
  }
};

// ===== Get related items =====
exports.getRelatedItems = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Login required' });

  const itemId = req.params.id;

  try {
    // Ensure the user owns the item
    const item = await knex('items').where({ id: itemId, user_id: req.user.id }).first();
    if (!item) return res.status(403).json({ error: 'You do not own this item' });

    const related = await knex('related_items')
      .join('items', 'related_items.related_item_id', 'items.id')
      .where('related_items.item_id', itemId)
      .select('items.*');

    res.json(related);
  } catch (err) {
    console.error('Get related items error:', err);
    next(err); // centralized error handling
  }
};
