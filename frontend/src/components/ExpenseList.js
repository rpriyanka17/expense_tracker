import React from 'react';
import api from '../api/axios';

export default function ExpenseList({ expenses, onChange }) {
  const handleDelete = async (id) => {
    await api.delete(`/expenses/${id}`);
    onChange();
  };

  if (!expenses.length) {
    return (
      <div className="card">
        <p>No expenses yet this month. Add your first one!</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>Recent Expenses</h3>
      <table className="expense-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th>Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e._id}>
              <td>{new Date(e.date).toLocaleDateString()}</td>
              <td>
                <span className="tag">{e.category}</span>
                {e.isRecurring && <span className="tag tag-recurring">recurring</span>}
              </td>
              <td>{e.description || '—'}</td>
              <td>₹{e.amount.toFixed(2)}</td>
              <td>
                <button className="link-btn" onClick={() => handleDelete(e._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
