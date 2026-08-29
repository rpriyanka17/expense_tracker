const express = require('express');
const SplitExpense = require('../models/SplitExpense');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

/**
 * FEATURE 3: Bill Splitting (mini-Splitwise)
 */

// GET /api/split
router.get('/', async (req, res) => {
  try {
    const splits = await SplitExpense.find({ user: req.userId }).sort({ date: -1 });
    res.json(splits);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/split
// body: { title, totalAmount, paidBy, participants: [{ name, share }] }
router.post('/', async (req, res) => {
  try {
    const { title, totalAmount, paidBy, participants } = req.body;

    if (!title || !totalAmount || !participants || !participants.length) {
      return res.status(400).json({ message: 'title, totalAmount and participants are required' });
    }

    const shareSum = participants.reduce((sum, p) => sum + Number(p.share), 0);
    if (Math.round(shareSum * 100) !== Math.round(Number(totalAmount) * 100)) {
      return res.status(400).json({
        message: `Participant shares (${shareSum}) must add up to the total amount (${totalAmount})`
      });
    }

    const split = await SplitExpense.create({
      user: req.userId,
      title,
      totalAmount,
      paidBy: paidBy || 'You',
      participants
    });

    res.status(201).json(split);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/split/:id/settle/:participantIndex
router.patch('/:id/settle/:participantIndex', async (req, res) => {
  try {
    const split = await SplitExpense.findOne({ _id: req.params.id, user: req.userId });
    if (!split) return res.status(404).json({ message: 'Split expense not found' });

    const idx = Number(req.params.participantIndex);
    if (!split.participants[idx]) return res.status(404).json({ message: 'Participant not found' });

    split.participants[idx].settled = !split.participants[idx].settled;
    await split.save();

    res.json(split);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/split/:id
router.delete('/:id', async (req, res) => {
  try {
    const split = await SplitExpense.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!split) return res.status(404).json({ message: 'Split expense not found' });
    res.json({ message: 'Split expense deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/split/balances -- summary of who owes what across all splits
router.get('/summary/balances', async (req, res) => {
  try {
    const splits = await SplitExpense.find({ user: req.userId });
    const balances = {};

    splits.forEach((split) => {
      split.participants.forEach((p) => {
        if (!balances[p.name]) balances[p.name] = { owed: 0, settled: 0 };
        if (p.settled) {
          balances[p.name].settled += p.share;
        } else {
          balances[p.name].owed += p.share;
        }
      });
    });

    res.json(balances);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
