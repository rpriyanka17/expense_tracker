const express = require('express');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// GET /api/expenses  (supports ?month=&year= filtering)
router.get('/', async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = { user: req.userId };

    if (month !== undefined && year !== undefined) {
      const start = new Date(Number(year), Number(month), 1);
      const end = new Date(Number(year), Number(month) + 1, 1);
      query.date = { $gte: start, $lt: end };
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/expenses
router.post('/', async (req, res) => {
  try {
    const { amount, category, description, date, isRecurring, recurringFrequency } = req.body;

    if (!amount || !category) {
      return res.status(400).json({ message: 'Amount and category are required' });
    }

    const expense = await Expense.create({
      user: req.userId,
      amount,
      category,
      description,
      date: date || Date.now(),
      isRecurring: !!isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency || 'monthly' : 'none'
    });

    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/expenses/:id
router.put('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * FEATURE 2: Spending Heatmap Calendar
 * GET /api/expenses/heatmap?month=&year=
 * Returns per-day totals for the given month so the frontend can render
 * a GitHub-contributions-style heatmap of spending intensity.
 */
router.get('/heatmap/data', async (req, res) => {
  try {
    const { month, year } = req.query;
    if (month === undefined || year === undefined) {
      return res.status(400).json({ message: 'month and year query params are required' });
    }

    const start = new Date(Number(year), Number(month), 1);
    const end = new Date(Number(year), Number(month) + 1, 1);

    const expenses = await Expense.find({
      user: req.userId,
      date: { $gte: start, $lt: end }
    });

    const dailyTotals = {};
    expenses.forEach((e) => {
      const day = new Date(e.date).getDate();
      dailyTotals[day] = (dailyTotals[day] || 0) + e.amount;
    });

    const daysInMonth = new Date(Number(year), Number(month) + 1, 0).getDate();
    const result = [];
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ day: d, total: Math.round((dailyTotals[d] || 0) * 100) / 100 });
    }

    res.json({ month: Number(month), year: Number(year), days: result });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
