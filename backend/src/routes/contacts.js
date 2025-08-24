const { Router } = require('express');
const ContactMessageModel = require('../models/ContactMessage');

const router = Router();

router.post('/', async (req, res) => {
  try {
    const created = await ContactMessageModel.create(req.body);
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ error: 'Failed to submit message', details: String(error) });
  }
});

router.get('/', async (_req, res) => {
  const messages = await ContactMessageModel.find().sort({ createdAt: -1 });
  res.json(messages);
});

module.exports = router;


