import React, { useState } from 'react';
import api from '../api/axios';

const CATEGORIES = ['Food', 'Transport', 'Housing', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Other'];

export default function ExpenseForm({ onAdded }) {
  const [form, setForm] = useState({
    amount: '',
    category: 'Food',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    isRecurring: false,
    recurringFrequency: 'monthly'
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/expenses', {
        ...form,
        amount: Number(form.amount)
      });
      onAdded(data);
      setForm({
        amount: '',
        category: 'Food',
        description: '',
        date: new Date().toISOString().slice(0, 10),
        isRecurring: false,
        recurringFrequency: 'monthly'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense');
    }
  };

  return (
    <form className="card expense-form" onSubmit={handleSubmit}>
      <h3>Add Expense</h3>
      {error && <p className="error">{error}</p>}
      <div className="form-row">
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          step="0.01"
          required
        />
        <select name="category" value={form.category} onChange={handleChange}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <input
          type="text"
          name="description"
          placeholder="Description (optional)"
          value={form.description}
          onChange={handleChange}
        />
        <input type="date" name="date" value={form.date} onChange={handleChange} />
      </div>
      <div className="form-row checkbox-row">
        <label>
          <input type="checkbox" name="isRecurring" checked={form.isRecurring} onChange={handleChange} />
          Recurring expense
        </label>
        {form.isRecurring && (
          <select name="recurringFrequency" value={form.recurringFrequency} onChange={handleChange}>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        )}
      </div>
      <button type="submit">Add Expense</button>
    </form>
  );
}
