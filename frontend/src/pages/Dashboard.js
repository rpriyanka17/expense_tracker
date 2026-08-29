import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import HeatmapCalendar from '../components/HeatmapCalendar';

export default function Dashboard() {
  const now = new Date();
  const [month] = useState(now.getMonth());
  const [year] = useState(now.getFullYear());
  const [expenses, setExpenses] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadExpenses = useCallback(async () => {
    const { data } = await api.get('/expenses', { params: { month, year } });
    setExpenses(data);
  }, [month, year]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses, refreshKey]);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  return (
    <div>
      <h1>Dashboard — {now.toLocaleString('default', { month: 'long' })} {year}</h1>

      <div className="summary-row">
        <div className="card summary-card">
          <span>Total spent this month</span>
          <strong>₹{total.toFixed(2)}</strong>
        </div>
        <div className="card summary-card">
          <span>Transactions</span>
          <strong>{expenses.length}</strong>
        </div>
        <div className="card summary-card">
          <span>Top Category</span>
          <strong>
            {Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'}
          </strong>
        </div>
      </div>

      <div className="grid-2">
        <ExpenseForm onAdded={() => setRefreshKey((k) => k + 1)} />
        <HeatmapCalendar month={month} year={year} refreshKey={refreshKey} />
      </div>

      <ExpenseList expenses={expenses} onChange={() => setRefreshKey((k) => k + 1)} />
    </div>
  );
}
