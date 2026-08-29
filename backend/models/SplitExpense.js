const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    share: { type: Number, required: true },
    settled: { type: Boolean, default: false }
  },
  { _id: false }
);

const splitExpenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    paidBy: { type: String, required: true, default: 'You' },
    date: { type: Date, default: Date.now },
    participants: [participantSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('SplitExpense', splitExpenseSchema);
