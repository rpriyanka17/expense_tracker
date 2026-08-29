const express = require('express');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');
const { predictMonthEnd } = require('../utils/predictor');

const router = express.Router();
router.use(auth);

// GET /api/budget?month=&year=
router.get('/', async (req, res) => {
  try {
    const { month, year } = req.query;
    const budget = await Budget.findOne({ user: req.userId, month: Number(month), year: Number(year) });
    res.json(budget || null);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/budget  (create or update the budget for a month)
router.post('/', async (req, res) => {
  try {
    const { month, year, amount } = req.body;
    if (month === undefined || year === undefined || amount === undefined) {
      return res.status(400).json({ message: 'month, year and amount are required' });
    }

    const budget = await Budget.findOneAndUpdate(
      { user: req.userId, month, year },
      { amount },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * FEATURE 1: Smart Budget Predictor
 * GET /api/budget/predict?month=&year=
 */
router.get('/predict', async (req, res) => {
  try {
    const { month, year } = req.query;
    if (month === undefined || year === undefined) {
      return res.status(400).json({ message: 'month and year query params are required' });
    }

    const m = Number(month);
    const y = Number(year);

    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 1);

    const [expenses, budget] = await Promise.all([
      Expense.find({ user: req.userId, date: { $gte: start, $lt: end } }),
      Budget.findOne({ user: req.userId, month: m, year: y })
    ]);

    const prediction = predictMonthEnd({
      expenses,
      budgetAmount: budget ? budget.amount : null,
      month: m,
      year: y
    });

    res.json(prediction);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * MONTHLY BUDGET TRACKER
 * GET /api/budget/overview?month=&year=
 * Returns actual spend to date, remaining budget, and a category-wise
 * breakdown so the user can see what's eating their budget.
 */
router.get('/overview', async (req, res) => {
  try {
    const { month, year } = req.query;
    if (month === undefined || year === undefined) {
      return res.status(400).json({ message: 'month and year query params are required' });
    }

    const m = Number(month);
    const y = Number(year);

    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 1);

    const [expenses, budget] = await Promise.all([
      Expense.find({ user: req.userId, date: { $gte: start, $lt: end } }),
      Budget.findOne({ user: req.userId, month: m, year: y })
    ]);

    const totalSpent = Math.round(expenses.reduce((sum, e) => sum + e.amount, 0) * 100) / 100;
    const budgetAmount = budget ? budget.amount : null;
    const remaining = budgetAmount !== null ? Math.round((budgetAmount - totalSpent) * 100) / 100 : null;
    const percentUsed = budgetAmount ? Math.round((totalSpent / budgetAmount) * 1000) / 10 : null;

    const categoryTotals = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const categories = Object.entries(categoryTotals)
      .map(([category, total]) => ({
        category,
        total: Math.round(total * 100) / 100,
        percentOfSpend: totalSpent ? Math.round((total / totalSpent) * 1000) / 10 : 0
      }))
      .sort((a, b) => b.total - a.total);

    res.json({
      totalSpent,
      budgetAmount,
      remaining,
      percentUsed,
      categories
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;