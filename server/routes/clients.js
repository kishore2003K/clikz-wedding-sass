const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const auth = require('../middleware/auth');

// GET all clients (with search for autocomplete)
router.get('/', auth, async (req, res) => {
  try {
    const { search } = req.query;
    const query = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { phone: { $regex: search, $options: 'i' } }] }
      : {};
    const clients = await Client.find(query).sort({ name: 1 }).limit(50);
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create client
router.post('/', auth, async (req, res) => {
  try {
    const existing = await Client.findOne({ phone: req.body.phone });
    if (existing) return res.status(400).json({ message: 'Client with this phone already exists' });
    const client = new Client(req.body);
    await client.save();
    res.status(201).json(client);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update client
router.put('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(client);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
