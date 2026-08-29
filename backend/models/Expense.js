const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    category: {
      type: String,
      required: true,
      enum: ['Food', 'Transport', 'Housing', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Other']
    },
    description: { type: String, default: '' },
    date: { type: Date, required: true, default: Date.now },
    isRecurring: { type: Boolean, default: false },
    recurringFrequency: {
      type: String,
      enum: ['none', 'weekly', 'monthly'],
      default: 'none'
    }
  },
  { timestamps: true }
);

expenseSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
