import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const CATEGORY_COLORS = {
  Food: '#4f5bd5',
  Transport: '#38a169',
  Housing: '#d69e2e',
  Utilities: '#3182ce',
  Entertainment: '#d53f8c',
  Health: '#e53e3e',
  Shopping: '#805ad5',
  Other: '#718096'
};

// Monthly Budget Tracker — actual spend to date, remaining budget,
// and a category-wise breakdown of where the money is going.
export default function BudgetOverview({ month, year, refreshKey }) {
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get('/budget/overview', { params: { month, year } });
      setOverview(data);
    };
    load();
  }, [month, year, refreshKey]);

  if (!overview) return null;

  const { totalSpent, budgetAmount, remaining, percentUsed, categories } = overview;
  const maxCategoryTotal = Math.max(...categories.map((c) => c.total), 1);

  // Build a CSS conic-gradient string for the donut chart from category percentages
  const buildConicGradient = () => {
    if (!categories.length) return '#eee';
    let cumulative = 0;
    const stops = categories.map((c) => {
      const start = cumulative;
      cumulative += c.percentOfSpend;
      const color = CATEGORY_COLORS[c.category] || '#4f5bd5';
      return `${color} ${start}% ${cumulative}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  };

  return (
    <div className="card">
      <h3>Monthly Budget Tracker</h3>

      <div className="summary-row">
        <div className="summary-card">
          <span>Spent so far</span>
          <strong>₹{totalSpent.toFixed(2)}</strong>
        </div>
        <div className="summary-card">
          <span>Budget</span>
          <strong>{budgetAmount !== null ? `₹${budgetAmount.toFixed(2)}` : '—'}</strong>
        </div>
        <div className="summary-card">
          <span>Remaining</span>
          <strong style={{ color: remaining !== null && remaining < 0 ? '#e53e3e' : undefined }}>
            {remaining !== null ? `₹${remaining.toFixed(2)}` : '—'}
          </strong>
        </div>
      </div>

      {budgetAmount !== null && (
        <div className="progress-bar-outer" style={{ marginBottom: 20 }}>
          <div
            className={`progress-bar-inner bar-${
              percentUsed >= 100 ? 'danger' : percentUsed >= 85 ? 'warning' : 'info'
            }`}
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          />
        </div>
      )}

      <h4>Where your money went</h4>
      {!categories.length && <p>No expenses recorded yet this month.</p>}

      {categories.length > 0 && (
        <div className="pie-chart-row">
          <div className="pie-chart" style={{ background: buildConicGradient() }}>
            <div className="pie-chart-hole">
              <strong>₹{totalSpent.toFixed(2)}</strong>
              <span>Total</span>
            </div>
          </div>
          <div className="pie-legend">
            {categories.map((c) => (
              <div className="pie-legend-item" key={c.category}>
                <span
                  className="legend-swatch"
                  style={{ background: CATEGORY_COLORS[c.category] || '#4f5bd5' }}
                />
                <span>
                  {c.category} — {c.percentOfSpend}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="category-breakdown">
        {categories.map((c) => (
          <div className="category-row" key={c.category}>
            <div className="category-label">
              <span>{c.category}</span>
              <span>
                ₹{c.total.toFixed(2)} · {c.percentOfSpend}%
              </span>
            </div>
            <div className="category-bar-outer">
              <div
                className="category-bar-inner"
                style={{
                  width: `${(c.total / maxCategoryTotal) * 100}%`,
                  background: CATEGORY_COLORS[c.category] || '#4f5bd5'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}